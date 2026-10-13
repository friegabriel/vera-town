import { createRequire as __vtRequire } from 'node:module';
import { fileURLToPath as __vtPath } from 'node:url';
const require = __vtRequire(import.meta.url);
const __filename = __vtPath(import.meta.url);
const __dirname = __vtPath(new URL('.', import.meta.url));

// scripts/plugin/pueblo.ts
import { spawn, spawnSync } from "node:child_process";
import { existsSync as existsSync2, mkdirSync as mkdirSync2, openSync, readFileSync, realpathSync, rmSync, writeFileSync as writeFileSync2 } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname as dirname2, join as join2 } from "node:path";
import { fileURLToPath } from "node:url";

// scripts/voice-download.ts
import { copyFileSync, createWriteStream, existsSync, mkdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
var MODEL = "onnx-community/whisper-base";
var MODEL_FILES = [
  "config.json",
  "generation_config.json",
  "preprocessor_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "special_tokens_map.json",
  "added_tokens.json",
  "vocab.json",
  "merges.txt",
  "normalizer.json",
  "onnx/encoder_model_quantized.onnx",
  "onnx/decoder_model_merged_quantized.onnx"
];
var PIPER_VOICES = "https://huggingface.co/rhasspy/piper-voices/resolve/main";
var VOICES = [
  { id: "es_AR-daniela-high", path: "es/es_AR/daniela/high", label: "Daniela (Argentina)", default: true },
  { id: "es_MX-ald-medium", path: "es/es_MX/ald/medium", label: "Ald (M\xE9xico)", default: true },
  { id: "es_ES-sharvard-medium", path: "es/es_ES/sharvard/medium", label: "Sharvard (Espa\xF1a)", default: true },
  { id: "es_MX-claude-high", path: "es/es_MX/claude/high", label: "Claude (M\xE9xico)", default: false },
  { id: "es_ES-davefx-medium", path: "es/es_ES/davefx/medium", label: "Davefx (Espa\xF1a)", default: false }
];
var PHONEMIZE = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize";
var ORT_FILES = [
  "ort-wasm-simd-threaded.asyncify.mjs",
  "ort-wasm-simd-threaded.asyncify.wasm",
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm"
];
async function fetchTo(url, dest, log, label) {
  if (existsSync(dest) && statSync(dest).size > 0) {
    log(`\u2713 ya estaba ${label}`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`${url} \u2192 HTTP ${res.status}`);
  const total = Number(res.headers.get("content-length") ?? 0);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(`${dest}.part`));
  renameSync(`${dest}.part`, dest);
  log(`\u2193 ${label}${total ? ` (${(total / 1e6).toFixed(1)} MB)` : ""}`);
}
async function downloadVoice(o) {
  const log = o.log ?? console.log;
  for (const f of MODEL_FILES) {
    await fetchTo(`https://huggingface.co/${MODEL}/resolve/main/${f}`, join(o.out, "models", MODEL, f), log, `whisper ${f}`);
  }
  mkdirSync(join(o.out, "ort"), { recursive: true });
  for (const f of ORT_FILES) {
    const dest = join(o.out, "ort", f);
    if ("dir" in o.ort) copyFileSync(join(o.ort.dir, f), dest);
    else await fetchTo(`https://cdn.jsdelivr.net/npm/onnxruntime-web@${o.ort.version}/dist/${f}`, dest, log, `ort ${f}`);
  }
  for (const v of VOICES.filter((x) => o.all || x.default)) {
    for (const ext of [".onnx", ".onnx.json"]) {
      await fetchTo(`${PIPER_VOICES}/${v.path}/${v.id}${ext}`, join(o.out, "voices", `${v.id}${ext}`), log, `voz ${v.id}${ext}`);
    }
  }
  for (const ext of [".wasm", ".data"]) {
    await fetchTo(`${PHONEMIZE}${ext}`, join(o.out, "piper", `piper_phonemize${ext}`), log, `fonetizador ${ext}`);
  }
  const installed = VOICES.filter((v) => existsSync(join(o.out, "voices", `${v.id}.onnx`))).map(({ id, label }) => ({ id, label }));
  writeFileSync(join(o.out, "voices", "index.json"), JSON.stringify(installed, null, 2));
  return installed.map((v) => v.label);
}

// scripts/plugin/pueblo.ts
var ROOT = join2(dirname2(fileURLToPath(import.meta.url)), "..");
var DATA = process.env.VERA_TOWN_DATA ?? join2(homedir(), ".vera-town");
var PORT = Number(process.env.VERA_TOWN_PORT ?? 8787);
var URL_ = `http://localhost:${PORT}`;
var PID = join2(DATA, "server.pid");
var RUNTIME = join2(DATA, "runtime");
var SDK_DIR = join2(RUNTIME, "node_modules", "@anthropic-ai", "claude-agent-sdk");
var LOG = join2(DATA, "server.log");
var WIN = process.platform === "win32";
var say = (s) => console.log(s);
async function alive() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/health`, { signal: AbortSignal.timeout(1e3) });
    return r.ok && typeof (await r.json()).ok === "boolean";
  } catch {
    return false;
  }
}
function findClaude(env = process.env) {
  if (env.VERA_TOWN_CLAUDE && existsSync2(env.VERA_TOWN_CLAUDE)) return env.VERA_TOWN_CLAUDE;
  const dirs = (env.PATH ?? env.Path ?? "").split(delimiter).filter(Boolean);
  dirs.push(join2(homedir(), ".local", "bin"), join2(homedir(), ".claude", "local"));
  for (const d of dirs) {
    const native = join2(d, WIN ? "claude.exe" : "claude");
    if (existsSync2(native)) return WIN ? native : realpathSync(native);
    if (WIN && existsSync2(join2(d, "claude.cmd"))) {
      const exe = join2(d, "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
      if (existsSync2(exe)) return exe;
    }
  }
  return void 0;
}
function ensureSdk() {
  const pkg = join2(SDK_DIR, "package.json");
  const ok = () => existsSync2(pkg) && JSON.parse(readFileSync(pkg, "utf8")).version === "0.3.296";
  if (!ok()) {
    say(`Instalando el Agent SDK de Claude ${"0.3.296"} (solo la primera vez)\u2026`);
    mkdirSync2(RUNTIME, { recursive: true });
    if (!existsSync2(join2(RUNTIME, "package.json"))) writeFileSync2(join2(RUNTIME, "package.json"), '{ "private": true }\n');
    const r = spawnSync("npm", ["install", `@anthropic-ai/claude-agent-sdk@${"0.3.296"}`, "--omit=optional", "--no-audit", "--no-fund", "--loglevel=error"], {
      cwd: RUNTIME,
      stdio: ["ignore", "ignore", "pipe"],
      encoding: "utf8",
      shell: WIN
    });
    if (r.status !== 0 || !ok()) {
      say(`\u26A0 No pude instalar el Agent SDK con npm${r.stderr ? `: ${r.stderr.trim().split("\n").slice(-3).join(" ")}` : ""}. El pueblo funciona para mirar, pero no para crear aldeanos.`);
      return void 0;
    }
  }
  return join2(SDK_DIR, "sdk.mjs");
}
function openBrowser(url) {
  const [cmd2, args] = WIN ? ["cmd", ["/c", "start", '""', url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  try {
    spawn(cmd2, args, { detached: true, stdio: "ignore", windowsHide: true }).unref();
  } catch {
  }
}
function cleanEnv() {
  const env = { ...process.env };
  for (const k of Object.keys(env)) {
    if (k === "CLAUDECODE" || k === "CLAUDE_PROJECT_DIR" || k.startsWith("CLAUDE_PLUGIN_") || k === "CLAUDE_CODE_ENTRYPOINT" || k === "CLAUDE_CODE_SSE_PORT") delete env[k];
  }
  return env;
}
async function start(open) {
  const [major] = process.versions.node.split(".").map(Number);
  if (major < 20) return say(`\u26A0 Vera Town necesita Node.js 20 o m\xE1s nuevo (ten\xE9s ${process.versions.node}). Bajalo de https://nodejs.org`);
  if (await alive()) {
    say(`\u2713 El pueblo ya est\xE1 abierto: ${URL_}`);
    if (open) openBrowser(URL_);
    return;
  }
  mkdirSync2(DATA, { recursive: true });
  const claude = findClaude();
  const sdk = ensureSdk();
  const out = openSync(LOG, "a");
  const child = spawn(process.execPath, [join2(ROOT, "server", "server.mjs")], {
    detached: true,
    stdio: ["ignore", out, out],
    windowsHide: true,
    env: {
      ...cleanEnv(),
      VERA_TOWN_PLUGIN: "1",
      VERA_TOWN_DATA: DATA,
      VERA_TOWN_PORT: String(PORT),
      VERA_TOWN_CLIENT: join2(ROOT, "client"),
      VERA_TOWN_VOICE_DIR: join2(DATA, "voice"),
      ...claude ? { VERA_TOWN_CLAUDE: claude } : {},
      ...sdk ? { VERA_TOWN_SDK: sdk } : {}
    }
  });
  child.unref();
  writeFileSync2(PID, String(child.pid));
  for (let i = 0; i < 40 && !await alive(); i++) await new Promise((r) => setTimeout(r, 250));
  if (!await alive()) {
    say(`\u26A0 El pueblo no arranc\xF3. Mir\xE1 el log: ${LOG}`);
    const tail = existsSync2(LOG) ? readFileSync(LOG, "utf8").split("\n").slice(-8).join("\n") : "";
    if (tail.trim()) say(tail);
    return;
  }
  say(`\u2713 Pueblo abierto en ${URL_} (datos en ${DATA})`);
  if (!claude) say("\u26A0 No encontr\xE9 tu `claude`: pod\xE9s mirar el pueblo, pero no crear aldeanos. Defin\xED VERA_TOWN_CLAUDE con la ruta.");
  if (!existsSync2(join2(DATA, "voice", "voices", "index.json"))) say("\u2139 La voz es opcional: /pueblo-voz la instala (~370 MB, una sola vez).");
  if (open) openBrowser(URL_);
}
async function stop() {
  const pid = existsSync2(PID) ? Number(readFileSync(PID, "utf8")) : void 0;
  if (pid) {
    try {
      if (WIN) spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
      else process.kill(-pid, "SIGTERM");
    } catch {
    }
    rmSync(PID, { force: true });
  }
  await new Promise((r) => setTimeout(r, 600));
  if (await alive()) say(`\u26A0 Sigue habiendo un pueblo en el puerto ${PORT} que no prend\xED yo (\xBFpnpm dev en el repo?).`);
  else say("\u2713 Pueblo apagado. Tus sesiones de Claude Code siguen igual (los hooks no esperan a nadie).");
}
async function status() {
  const up = await alive();
  const claude = findClaude();
  say([
    `Vera Town ${"0.1.1"}`,
    `pueblo: ${up ? `abierto en ${URL_}` : "apagado (/pueblo para abrirlo)"}`,
    `datos: ${DATA}`,
    `claude: ${claude ?? "no encontrado (defin\xED VERA_TOWN_CLAUDE)"}`,
    `Agent SDK: ${existsSync2(join2(SDK_DIR, "package.json")) ? "instalado" : "se instala en el primer /pueblo"}`,
    `voz: ${existsSync2(join2(DATA, "voice", "voices", "index.json")) ? "instalada" : "no instalada (/pueblo-voz)"}`
  ].join("\n"));
}
async function voice(all) {
  say(`Bajando la voz del pueblo a ${join2(DATA, "voice")} (Whisper, voces Piper y ONNX; una sola vez)\u2026`);
  const voices = await downloadVoice({ out: join2(DATA, "voice"), ort: { version: "1.31.0-dev.20260914-8d85527a0" }, all, log: say });
  say(`\u2713 Voz lista: ${voices.join(", ")}. Recarg\xE1 el pueblo y activ\xE1 "voz: s\xED".`);
  if (await alive()) say("\u2139 Si el pueblo estaba abierto, apagalo y prendelo (/pueblo-parar y /pueblo) para que sirva los archivos nuevos.");
}
var [cmd = "start", ...rest] = process.argv.slice(2);
var run = { start: () => start(!rest.includes("--no-abrir")), stop, status, voz: () => voice(rest.includes("--todas")) }[cmd];
if (!run) {
  say("Uso: pueblo [start|stop|status|voz [--todas]]");
  process.exitCode = 1;
} else {
  await run().catch((err) => {
    say(`\u26A0 ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  });
}
export {
  findClaude
};
