# Vera Town: cómo instalarlo

Vera Town es un pueblito pixel art donde cada sesión de Claude Code aparece como un aldeano. Lo ves caminar a la biblioteca cuando lee archivos, al taller cuando edita, a la mina cuando corre comandos, y a la campana cuando te necesita. Desde el pueblo también podés hablarle, aprobarle permisos y mandarle tareas.

Todo corre en tu computadora. Nadie más ve tu pueblo.

---

## Antes de empezar

Necesitás dos cosas:

1. **Claude Code**, con tu cuenta. Puede ser la app de escritorio de Claude o el `claude` de la terminal.
2. **Node.js 20 o más nuevo.** Para saber si ya lo tenés, abrí una terminal y escribí:

   ```
   node --version
   ```

   Si te contesta algo como `v20...` o un número mayor, listo. Si no lo reconoce o te muestra una versión vieja, bajalo de https://nodejs.org (la versión "LTS" está bien) e instalalo.

---

## Instalarlo

Hay tres caminos y todos terminan en lo mismo. Elegí el que te quede más cómodo.

### Opción 1: desde la app de escritorio de Claude

1. Abrí la app y entrá a la pantalla de **plugins**.
2. Agregá un marketplace nuevo y escribí:

   ```
   friegabriel/vera-town
   ```

3. Cuando aparezca en la lista, instalá **vera-town**.

### Opción 2: desde una sesión de Claude Code

En cualquier sesión, en la app o en la terminal, escribí estos dos comandos de a uno:

```
/plugin marketplace add friegabriel/vera-town
```

```
/plugin install vera-town@vera-town
```

### Opción 3: desde la terminal, sin abrir Claude

```
claude plugin marketplace add friegabriel/vera-town
```

```
claude plugin install vera-town@vera-town
```

Sirve cualquier terminal: PowerShell, la de tu editor o la que trae la propia app de Claude.

---

## Abrir el pueblo

Este paso es el que más se olvida: **abrí una sesión nueva**. Las sesiones que ya tenías abiertas no se enteran del plugin, porque Claude Code los carga al arrancar cada sesión. Si escribís `/pueblo` en una sesión vieja, Claude lo va a tomar como un mensaje cualquiera.

En la sesión nueva escribí:

```
/pueblo
```

Si no te lo sugiere, usá el nombre completo:

```
/vera-town:pueblo
```

La primera vez tarda unos 10 a 20 segundos, porque instala una pieza que le falta (el SDK de agentes de Claude). Después se abre el navegador en http://localhost:8787 con tu pueblo.

Pedile cualquier cosa a Claude en esa sesión y vas a ver a tu aldeano moverse.

---

## Los comandos

| Comando | Para qué sirve |
|---|---|
| `/pueblo` | Prende el pueblo y lo abre en el navegador |
| `/pueblo-parar` | Lo apaga. Tus sesiones siguen funcionando igual |
| `/pueblo-estado` | Te dice si está prendido, dónde guarda los datos y si tiene voz |
| `/pueblo-voz` | Instala la voz, para hablarle y que te responda en voz alta |

La voz es opcional. Baja unos 370 MB una sola vez y después funciona sin internet. Escribí `/pueblo-voz todas` si querés las cinco voces en lugar de tres.

---

## Algunas cosas para probar

- **Click en un aldeano** para seguirlo con la cámara. Con doble click copiás el comando para retomar esa sesión.
- **Click en el taller** para ver qué archivos se cambiaron hoy, con el detalle, y deshacer un cambio si hace falta.
- **Click en la mina** para ver los comandos que se corrieron y qué devolvieron.
- **Click en la Alcaldía** para las recetas: tareas armadas como "revisá los cambios" o "corré los tests y arreglá lo que falle".
- **El tablón de la plaza** es una lista de tareas que los aldeanos van tomando de a una.
- **La tecla C** te pone a caminar por el pueblo con WASD. Con **E** hablás con quien tengas al lado.
- **🏘 Proyectos**: ahí aparecen las carpetas donde usaste Claude Code. Mirar es automático, pero para que los aldeanos del pueblo trabajen en un proyecto lo tenés que habilitar acá.

---

## Si algo no anda

**Escribo `/pueblo` y Claude me contesta otra cosa.**
Estás en una sesión que se abrió antes de instalar el plugin. Abrí una nueva.

**Dice que falta Node.js.**
Instalalo desde https://nodejs.org, cerrá y volvé a abrir Claude, y repetí `/pueblo`.

**Mi sesión no aparece en el pueblo.**
Pasa lo mismo que con el comando: solo aparecen las sesiones abiertas después de instalar.

**Se abrió el pueblo pero no puedo crear aldeanos.**
Corré `/pueblo-estado`. Si dice que no encontró `claude` o el SDK, probá cerrar el pueblo con `/pueblo-parar` y volver a abrirlo con `/pueblo` (con internet, la primera vez).

**Quiero ver qué pasó por dentro.**
Hay un registro en la carpeta `.vera-town` de tu usuario, en el archivo `server.log`.

---

## Actualizar, pausar o desinstalar

- **Actualizar:** en `/plugin`, entrá a los marketplaces, elegí vera-town y actualizalo. Tus datos se conservan.
- **Apagarlo un rato:** `/pueblo-parar`. Claude Code sigue funcionando normal, sin demoras.
- **Desinstalarlo:** `/plugin uninstall vera-town@vera-town`. Tus datos quedan en la carpeta `.vera-town` de tu usuario por si lo volvés a instalar; si no, la podés borrar.

---

## Lo que conviene saber

- **Es local.** El pueblo escucha solo en tu computadora y no manda nada a ningún lado.
- **Usa tu cuenta.** Los aldeanos que crees desde el pueblo usan tu propio Claude, así que gastan de tu plan como cualquier otra sesión.
- **Te pregunta antes de tocar algo.** Cuando un aldeano quiere editar un archivo o correr un comando, el permiso te lo pide a vos, igual que en la terminal.
- **Las cifras de costo son estimadas** a precio de API. Si tenés una suscripción de Claude, no pagás por token.

Código y novedades: https://github.com/friegabriel/vera-town

---

Versión 0.1.0 · Licencia MIT (ver LICENSE) · Licencias de terceros en `plugin/vera-town/THIRD_PARTY_LICENSES.md`
