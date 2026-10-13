---
description: Instala la voz local del pueblo (Whisper + voces Piper, ~370 MB, una sola vez; "todas" suma 2 voces más)
allowed-tools: Bash(pueblo:*), Bash(node:*)
---
Corré `pueblo voz` con la herramienta de terminal (está en el PATH gracias al plugin; si no lo encuentra, usá `node "${CLAUDE_PLUGIN_ROOT}/lib/pueblo.mjs" voz`).

Si la persona escribió "todas" ($ARGUMENTS), agregá `--todas`. Puede tardar varios minutos. Al terminar, contale qué voces quedaron y que recargue el pueblo.
No hagas nada más que eso.
