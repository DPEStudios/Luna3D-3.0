# Despliegue en Vercel — Luna 3D v3

> Última actualización: 2026-06-16
> Estado: **v3 en producción y funcionando.**

## Resumen

La tienda Luna 3D (v3) es un **sitio estático autocontenido** (HTML/CSS/JS, sin build) que se
despliega en Vercel desde el repositorio `DPEStudios/Luna3D-3.0`.

| Dato | Valor |
|---|---|
| URL de producción | https://luna3d.cl · https://www.luna3d.cl |
| URL de Vercel (alias) | https://luna3-d-2-0-7t94.vercel.app |
| Repositorio | https://github.com/DPEStudios/Luna3D-3.0 |
| Rama de producción | `main` |
| Proyecto en Vercel | `luna3-d-2-0-7t94` (team `estrella3ds-projects`) |
| Framework | **Ninguno (Other)** — sitio estático, sin build |
| Commit en producción (al cierre) | `a3b6c2f` |

## Cómo se despliega (auto-deploy)

El proyecto de Vercel está conectado al repo `Luna3D-3.0`. **Cada `git push` a `main`
dispara un despliegue de producción automático.** No hay que tocar el panel.

> Importante (montaje Google Drive): git NO opera de forma fiable dentro de la carpeta
> `Web_Luna3D_v3` montada. El flujo correcto es trabajar el repo en el disco local de la VM
> y empujar desde ahí; la historia completa también se respalda en
> `Respaldo_Git/luna3d_main.bundle`. Ver la sección "Control de versiones" del `README.md`.

## Configuración relevante

- **`vercel.json`**: `framework: null`, `buildCommand: ""`, `outputDirectory: "."`,
  `cleanUrls: true` (sirve `/catalogo` sin `.html`) y headers de caché para `assets/`,
  `Imágenes/`, `*.css` y `*.js`.
- **`.vercelignore`**: excluye `api/create-preference.php`. Ese archivo es el equivalente PHP
  solo para hosting cPanel; en Vercel se usa `api/create-preference.js`, y tener ambos en
  `/api` provoca un conflicto de ruta (`/api/create-preference`) que rompe el build. El `.php`
  sigue en el repo, pero no se sube a Vercel.

## Variables de entorno

El sitio funciona **sin variables de entorno** en su estado actual:

- **Venta:** canal activo = **WhatsApp** (`+56 9 8335 7145`, constante `WHATSAPP_NUMERO` en `app.js`).
- **Catálogo:** se lee de Supabase con la *anon key* embebida (segura por el modelo anon + RLS).
  La web muestra solo productos en estado `publicado`; si se ve vacía es porque aún no hay
  productos publicados.

Pendiente para cuando se active "Pagar con tarjeta" (MercadoPago):

- Agregar en **Vercel → Settings → Environment Variables** la variable `MP_ACCESS_TOKEN`
  (la usa la función serverless `api/create-preference.js`). El Access Token **nunca** va al repo.

## Despliegue manual / rollback

- **Re-desplegar:** Vercel → proyecto `luna3-d-2-0-7t94` → Deployments → ⋯ → Redeploy.
- **Rollback:** en Deployments, promover a producción un despliegue anterior (botón ⋯ →
  "Promote to Production").
- **Reconstruir el sitio a un commit dado:** clonar el bundle
  `Respaldo_Git/luna3d_main.bundle` y empujar el commit deseado a `main`.

## Respaldos

- `00_.../` repos antiguos: `01_Estrella3D/Respaldo_Repos_GitHub_2026-06-15/`
  - `Luna3D_v1_2026-06-15.bundle` (repo v1 `Luna3D`)
  - `Luna3D-2.0_v2_2026-06-15.bundle` (repo v2 `Luna3D-2.0`, Next.js)
  - `Luna3D-3.0_PREVIO_2026-06-15.bundle` (estado de `Luna3D-3.0` antes de subir la v3)
- Historia viva de la v3: `Web_Luna3D_v3/Respaldo_Git/luna3d_main.bundle`

## Credenciales (gitignored, en `.claude-secrets/`)

- `github-pat` — token de GitHub (push al repo).
- `vercel-token` — token de Vercel (deploys vía API/CLI).
- `supabase.env` — llaves de Supabase.

Estos archivos **no se commitean** (`.claude-secrets/` está en `.gitignore`). Pueden rotarse o
borrarse cuando se quiera; si se borran, habrá que volver a generarlos para futuros despliegues.

## Historial de esta migración (2026-06-16)

1. Se respaldaron v1, v2 y la v3 previa en bundles locales.
2. Se publicó la v3 (estado actual de la carpeta, hasta la sesión 7) en `Luna3D-3.0/main`.
3. En Vercel: el proyecto `luna3-d-2-0-7t94` se reapuntó de `Luna3D-2.0` (Next.js) a
   `Luna3D-3.0`, se configuró como sitio estático y se desplegó a producción.
4. Se corrigió el conflicto de ruta en `/api` con `.vercelignore`.
5. Verificado: la home en vivo es la v3 (sin Next.js), recursos en 200, `cleanUrls` y caché OK.
6. El dominio `luna3d.cl` + `www.luna3d.cl` (nameservers en Vercel) daba 404
   `DEPLOYMENT_NOT_FOUND` porque no estaba asignado al proyecto. Se asignó al proyecto
   `luna3-d-2-0-7t94` y quedó sirviendo la v3 (200). No requirió cambios de DNS externos
   porque los nameservers ya apuntan a Vercel.
