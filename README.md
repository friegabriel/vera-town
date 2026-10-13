# Vera Town · plugin de Claude Code

Tus agentes de Claude como aldeanos de un pueblo pixel art: mirá qué hacen, hablales, aprobá permisos y
delegá tareas. Todo corre en tu máquina. Versión 0.1.0.

## Requisitos

- Claude Code (con tu propia cuenta: los aldeanos del pueblo usan tu `claude`).
- Node.js 20 o más nuevo.
- Acceso a este repositorio (OCI DevOps) desde git: si `git clone https://devops.scmservice.sa-saopaulo-1.oci.oraclecloud.com/namespaces/grg7fa7ww9p4/projects/vera/repositories/vera-town` te anda, el plugin también.

## Instalar

En Claude Code:

```
/plugin marketplace add https://devops.scmservice.sa-saopaulo-1.oci.oraclecloud.com/namespaces/grg7fa7ww9p4/projects/vera/repositories/vera-town
/plugin install vera-town@vera-town
```

Abrí una sesión nueva (los hooks se cargan al arrancar) y escribí `/pueblo`.

| Comando | Qué hace |
|---|---|
| `/pueblo` | Prende el pueblo y lo abre en http://localhost:8787 |
| `/pueblo-parar` | Lo apaga (tus sesiones siguen igual) |
| `/pueblo-estado` | Muestra si está prendido, dónde guarda los datos y si tiene voz |
| `/pueblo-voz` | Instala la voz local (opcional, ~370 MB, una sola vez) |

- Cada sesión de Claude Code aparece sola como aldeano, con el nombre de su proyecto.
- Para que los aldeanos del pueblo (recetas, tablón) trabajen en un proyecto, habilitalo en **🏘 Proyectos**.
- Los datos quedan en `~/.vera-town`. El pueblo escucha solo en 127.0.0.1.

## Acceso a OCI DevOps desde git

Necesitás un usuario en el tenant con permiso de lectura sobre el proyecto DevOps `vera`.

- **HTTPS:** el usuario es `<tenancy>/<dominio>/<tu usuario>` (con el dominio por defecto, `<tenancy>/Default/<tu usuario>`)
  y la contraseña es un **Auth Token** (Perfil → Tokens de autenticación). Guardalo en el administrador de credenciales de git.
- **SSH:** subí tu clave pública en tu perfil de OCI (Claves de API) y usá la URL `ssh://` del repo, con esto en `~/.ssh/config`:
  ```
  Host devops.scmservice.sa-saopaulo-1.oci.oraclecloud.com
    User Default/<tu usuario>@<tenancy>
    IdentityFile ~/.ssh/<tu clave privada>
  ```

## Actualizar

`/plugin` → Marketplaces → vera-town → actualizar. Tus datos en `~/.vera-town` se conservan.

## Licencia

MIT (ver LICENSE). Las licencias de terceros están en `plugin/vera-town/THIRD_PARTY_LICENSES.md`.
