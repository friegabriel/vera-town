#!/usr/bin/env node
// Hook de Claude Code → Vera Town.
// Lee el JSON del hook por stdin y lo reenvía al server. Fail-open: nunca bloquea al agente,
// nunca escribe en stdout (algunos hooks inyectan stdout en el contexto) y siempre sale con 0.
import { existsSync, readFileSync, statSync } from 'node:fs';

const BASE = process.env.VERA_TOWN_URL ?? 'http://127.0.0.1:8787';
const TOKEN = process.env.VERA_TOWN_TOKEN;
/** `agent-sdk` o `managed` si este hook se usa desde otro runtime con el mismo formato. */
const SOURCE = process.env.VERA_TOWN_SOURCE;
const DROP = new Set(['content', 'old_string', 'new_string', 'new_source', 'edits']);
/** Eventos donde vale la pena leer el transcript (fin de turno / de subagente / de sesión). */
const READ_TRANSCRIPT = new Set(['Stop', 'SubagentStop', 'SessionEnd']);

/** Eventos que pueden quedar esperando tu decisión en el pueblo. */
const WAITS = new Set(['PermissionRequest']);
/** Un poco más que lo que espera el server (VERA_TOWN_HOOK_WAIT, 25 s por defecto). */
const WAIT_MS = (Number(process.env.VERA_TOWN_HOOK_WAIT ?? 25) + 5) * 1000;

/** Herramientas cuyo trabajo se guarda en la bitácora del taller / la mina. */
const WORK_TOOLS = new Set(['Edit', 'MultiEdit', 'Write', 'NotebookEdit', 'Bash', 'PowerShell']);
const MAX_WORK = 900_000;

/** Lo que hizo la tool (entero, para ver el diff y poder deshacerlo) si no es gigante. */
function workOf(p) {
  if (!WORK_TOOLS.has(p.tool_name)) return undefined;
  const input = p.tool_input;
  const r = p.tool_response && typeof p.tool_response === 'object' ? { ...p.tool_response } : undefined;
  if (r) {
    for (const k of ['stdout', 'stderr']) if (typeof r[k] === 'string' && r[k].length > 6000) r[k] = `…${r[k].slice(-6000)}`;
    if (typeof r.originalFile === 'string' && r.originalFile.length > MAX_WORK / 2) delete r.originalFile;
    if (typeof r.content === 'string') delete r.content;
  }
  const fits = (v) => v === undefined || JSON.stringify(v).length < MAX_WORK;
  return {
    input: fits(input) ? input : slim(input),
    response: fits(r) ? r : undefined,
    partial: !fits(input) || undefined,
    project_dir: process.env.CLAUDE_PROJECT_DIR ?? p.cwd,
    tool_use_id: p.tool_use_id,
  };
}

/** Antes de un Write: lo que tenía el archivo (null si no existía), para poder deshacerlo. */
function beforeWrite(p) {
  if (p.tool_name !== 'Write' || typeof p.tool_input?.file_path !== 'string') return undefined;
  const f = p.tool_input.file_path;
  try {
    if (!existsSync(f)) return { tool_use_id: p.tool_use_id, before: null };
    if (statSync(f).size > MAX_WORK / 2) return undefined;
    return { tool_use_id: p.tool_use_id, before: readFileSync(f, 'utf8') };
  } catch {
    return undefined;
  }
}

/** Texto de la conversación: más largo que el resto, para que se lea en el chat del pueblo. */
const clip = (v) => (typeof v === 'string' && v.length > 4000 ? `${v.slice(0, 4000)}…` : v);

/** Recorta strings largos y descarta campos pesados (contenido de archivos, diffs). */
function slim(v, depth = 0) {
  if (typeof v === 'string') return v.length > 300 ? `${v.slice(0, 300)}…` : v;
  if (Array.isArray(v)) return depth > 1 ? undefined : v.slice(0, 5).map((x) => slim(x, depth + 1));
  if (v && typeof v === 'object') {
    if (depth > 1) return undefined;
    const out = {};
    for (const [k, x] of Object.entries(v)) if (!DROP.has(k)) out[k] = slim(x, depth + 1);
    return out;
  }
  return v;
}

/**
 * Tokens, modelo y título a partir del transcript JSONL. El formato es interno de Claude Code:
 * las entradas `assistant` traen `message.usage` repetido por cada bloque del mismo mensaje
 * (se deduplica por `message.id`) y el título vive en entradas `custom-title`.
 */
function transcriptStats(path) {
  if (!path) return undefined;
  const usageById = new Map();
  let lastUsage;
  let model;
  let title;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.includes('"usage"') && !line.includes('custom-title')) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.type === 'custom-title' && e.customTitle) title = e.customTitle;
    const m = e.message;
    if (e.type === 'assistant' && m?.usage) {
      usageById.set(m.id ?? e.uuid, m.usage);
      lastUsage = m.usage;
      if (m.model && !m.model.startsWith('<')) model = m.model;
    }
  }
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cacheWrite1h: 0 };
  for (const u of usageById.values()) {
    usage.input += u.input_tokens ?? 0;
    usage.output += u.output_tokens ?? 0;
    usage.cacheRead += u.cache_read_input_tokens ?? 0;
    usage.cacheWrite += u.cache_creation_input_tokens ?? 0;
    usage.cacheWrite1h += u.cache_creation?.ephemeral_1h_input_tokens ?? 0;
  }
  // lo que ocupa la ventana de contexto ahora: la entrada completa del último mensaje
  const context = lastUsage
    ? (lastUsage.input_tokens ?? 0) + (lastUsage.cache_read_input_tokens ?? 0) + (lastUsage.cache_creation_input_tokens ?? 0)
    : undefined;
  return { usage: usageById.size ? usage : undefined, model, title, context };
}

try {
  let raw = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) raw += chunk;
  const p = JSON.parse(raw);
  const event = p.hook_event_name;
  let stats;
  if (READ_TRANSCRIPT.has(event)) {
    try {
      stats = transcriptStats(event === 'SubagentStop' ? p.agent_transcript_path : p.transcript_path);
    } catch {
      // transcript inaccesible o con otro formato: se manda el evento sin estadísticas
    }
  }
  const body = {
    session_id: p.session_id,
    // ruta completa del proyecto (solo viaja a tu propio server): para habilitarlo en el panel 🏘 Proyectos
    project_dir: process.env.CLAUDE_PROJECT_DIR ?? p.cwd,
    hook_event_name: event,
    // la raíz del proyecto, no la carpeta donde quedó parado el shell
    cwd: (process.env.CLAUDE_PROJECT_DIR ?? p.cwd)?.split(/[\\/]/).filter(Boolean).pop(),
    tool_name: p.tool_name,
    // las preguntas viajan enteras: para responderlas hay que devolver el input original
    tool_input: p.tool_name === 'AskUserQuestion' ? p.tool_input : slim(p.tool_input),
    prompt: clip(p.prompt),
    message: slim(p.message),
    source: p.source,
    reason: p.reason,
    error: slim(p.error),
    agent_id: p.agent_id,
    agent_type: p.agent_type,
    last_assistant_message: clip(p.last_assistant_message),
    session_title: p.session_title,
    permission_suggestions: p.permission_suggestions,
    stats,
    work: event === 'PostToolUse' || event === 'PostToolUseFailure' ? workOf(p) : event === 'PreToolUse' ? beforeWrite(p) : undefined,
  };
  const res = await fetch(`${BASE}/hooks/claude-code${SOURCE ? `?source=${encodeURIComponent(SOURCE)}` : ''}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) },
    body: JSON.stringify(body),
    // los eventos que esperan tu decisión en el pueblo pueden tardar; el resto, nunca
    signal: AbortSignal.timeout(WAITS.has(event) || (event === 'PreToolUse' && p.tool_name === 'AskUserQuestion') ? WAIT_MS : 1500),
  });
  // única vez que el hook escribe en stdout: cuando el pueblo decide algo (permiso, respuesta o buzón)
  const reply = await res.json().catch(() => undefined);
  if (reply?.hookOutput) process.stdout.write(JSON.stringify(reply.hookOutput));
} catch (err) {
  // server apagado o payload raro: no importa (VERA_TOWN_DEBUG=1 para verlo en stderr)
  if (process.env.VERA_TOWN_DEBUG) console.error('[vera-town hook]', err);
}
process.exit(0);
