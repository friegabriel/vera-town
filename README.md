# Vera Town · plugin de Claude Code

Tus agentes de Claude como aldeanos de un pueblo pixel art: mirá qué hacen, hablales, aprobá permisos y
delegá tareas. Todo corre en tu máquina. Versión 0.1.0.

## Instalar

Necesitás [Claude Code](https://claude.com/claude-code) y [Node.js](https://nodejs.org) 20 o más nuevo.

En Claude Code:

```
/plugin marketplace add friegabriel/vera-town
/plugin install vera-town@vera-town
```

(o desde una terminal: `claude plugin marketplace add friegabriel/vera-town` y `claude plugin install vera-town@vera-town`).

Después abrí una **sesión nueva** (los hooks se cargan al arrancar) y escribí `/pueblo`.
La primera vez tarda unos segundos más: instala el Agent SDK de Claude desde npm.

## Comandos

| Comando | Qué hace |
|---|---|
| `/pueblo` | Prende el pueblo y lo abre en http://localhost:8787 |
| `/pueblo-parar` | Lo apaga (tus sesiones siguen igual) |
| `/pueblo-estado` | Muestra si está prendido, dónde guarda los datos y si tiene voz |
| `/pueblo-voz` | Instala la voz local (opcional, ~370 MB, una sola vez) |

## Cómo se usa

- Cada sesión de Claude Code, de cualquier carpeta, aparece sola como aldeano con el nombre de su proyecto.
- Click en un aldeano para seguirlo; click en un lugar para ver quién está ahí (el taller y la mina muestran qué
  archivos cambiaron y qué comandos corrieron).
- Si una sesión te pide un permiso con el pueblo abierto, lo aprobás desde una tarjeta.
- Para que los aldeanos del pueblo (recetas de la Alcaldía, tablón de la plaza) trabajen en un proyecto,
  habilitalo en **🏘 Proyectos**. Usan tu propio `claude` y tu cuenta.
- `C` para caminar con WASD; `E` para hablar con quien tengas al lado.

Todo queda en tu máquina: los datos en `~/.vera-town` y el pueblo escucha solo en 127.0.0.1.

## Actualizar

`/plugin` → Marketplaces → vera-town → actualizar. Tus datos se conservan.

## Licencia

MIT (ver LICENSE). Licencias de terceros en `plugin/vera-town/THIRD_PARTY_LICENSES.md`.
