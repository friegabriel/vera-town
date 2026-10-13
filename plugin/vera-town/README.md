# Vera Town (plugin de Claude Code)

Tus agentes de Claude como aldeanos de un pueblo pixel art: mirá qué hacen, hablales, aprobá permisos y delegá tareas. Todo local.

## Instalar

```
/plugin marketplace add <carpeta o repo de vera-town>
/plugin install vera-town@vera-town
```

Necesita Node.js 20 o más nuevo.

## Usar

- `/pueblo`: abre el pueblo en http://localhost:8787 (lo prende si está apagado).
- `/pueblo-parar`: lo apaga. Tus sesiones siguen igual.
- `/pueblo-voz`: instala la voz local (opcional, una sola vez).
- `/pueblo-estado`: cómo está todo.

Cada sesión de Claude Code aparece sola como un aldeano, con el nombre de su proyecto.
Para que los aldeanos del pueblo (recetas, tablón) trabajen en un proyecto, habilitalo en **🏘 Proyectos**.

Los datos quedan en `~/.vera-town` (`VERA_TOWN_DATA` para cambiarlo). El pueblo escucha solo en `127.0.0.1`.
