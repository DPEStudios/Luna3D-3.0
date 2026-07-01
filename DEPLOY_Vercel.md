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

### Protocolo obligatorio antes de subir cualquier cambio (desde 2026-07-01)

**Motivo:** el 2026-07-01 un despliegue revirtió el fix del tamaño del badge del
carrito porque se clonó GitHub como base y esa corrección solo existía en la
carpeta `Web_Luna3D_v3` montada, nunca se había subido. Carpeta local y GitHub
pueden desincronizarse en cualquier dirección sin avisar, porque cada sesión
de Claude edita la carpeta montada directamente y el `git` de esa carpeta
apunta a un bundle local, no al repo real. Para que no vuelva a pasar, **toda
sesión que vaya a desplegar a producción debe seguir estos pasos, sin
excepción:**

1. **Clonar limpio** el repo real (`https://github.com/DPEStudios/Luna3D-3.0`,
   usando el token en `.claude-secrets/github-pat`) en un disco temporal de la
   sesión (no en la carpeta montada).
2. **Diferenciar** ese clon contra la carpeta `Web_Luna3D_v3` montada
   (`diff -rq`, excluyendo `.git`, `.vercel`, `.claude-secrets`, backups
   `*.bak*`, carpetas de borradores/papelera). Esto muestra TODO lo que
   difiere en las dos direcciones, no solo lo que se planea cambiar.
3. Si aparecen diferencias que no son del cambio actual (como pasó con el
   badge del carrito o el CSS de Nosotros), **no ignorarlas**: hay que
   entender de qué se trata cada una (¿es un fix pendiente de subir? ¿es
   contenido que la carpeta local perdió?) y decidir explícitamente cómo se
   fusionan, en vez de simplemente sobrescribir un lado con el otro.
4. Aplicar el cambio nuevo sobre esa base ya reconciliada.
5. Commit + push a `main`.
6. **Verificar en la URL real** (`https://luna3d.cl`, no solo el estado de
   Vercel) que el cambio esperado esté presente y que nada se haya perdido.
7. **Copiar el resultado final de producción de vuelta a la carpeta montada**
   (styles.css, .html afectados, etc.), respaldando antes la versión anterior
   en `_Papelera/` (skill `papelera-segura`), para que ambas copias queden
   idénticas al cerrar la sesión.

Saltarse el paso 2 (diferenciar antes de tocar nada) es la causa raíz del
incidente del 2026-07-01. Este protocolo es manual — no hay CI/CD que lo haga
solo — porque git no puede vivir de forma confiable dentro de la carpeta
montada en Google Drive. Si en el futuro se resuelve esa limitación técnica,
este protocolo debería reemplazarse por un pipeline automático.

## Corrupción binaria de archivos en el mount (Google Drive) — 2026-07-01

> Esto es DISTINTO de la desincronización de contenido de la sección anterior.
> Acá el archivo queda **dañado en el disco** (bytes), no solo desactualizado.

### Qué pasa

Editar un archivo directamente sobre la carpeta montada en Google Drive con las
herramientas de edición (Read/Edit/Write reescriben el archivo completo, no un
parche) puede dañarlo. Se documentaron dos firmas reales, confirmadas byte a
byte contra las copias guardadas en `_Papelera/2026-07-01_*`:

1. **Truncamiento.** El archivo corrupto es un **prefijo exacto** del bueno,
   cortado a mitad de token, con **cero bytes nulos**. La escritura produjo un
   comienzo correcto y se detuvo. Ej. (incidente 11:17): `styles.css` terminó en
   `…repeat(2,1fr);}\n  .pr` y `app.js` en `…els.forEac`; ambos prefijos exactos
   de la versión buena.
2. **Cola de bytes nulos.** El contenido correcto queda **completo** (byte
   idéntico al bueno) y se le agrega un bloque contiguo de `\x00` al final,
   inflando el tamaño por encima del contenido real. Ej. (11:45 y 12:10):
   `styles.css` real = 163 559 B (idéntico al bueno) + 578 y 241 nulos de cola.

### Dos aclaraciones importantes (correcciones al diagnóstico previo)

- El "punto de corte de siempre" que las sesiones citaban
  (`fin SOBRE NOSOTROS 2026-06-25`) **NO es un truncamiento: es el final normal
  de `styles.css`.** Se leyó el fin natural del archivo como si fuera daño.
- El lote de las 10:40 (`product.js`, `producto.html`, `DEPLOY_Vercel.md`) **no
  estaba truncado** en las copias guardadas — están completos (`DEPLOY_Vercel.md`
  es idéntico al bueno). Eso fue en realidad **desincronización local-vs-GitHub**
  (el problema de la sección anterior) mal leída como corrupción binaria.

### Causa raíz

Carrera entre la escritura del archivo y el **cliente de sincronización de
Google Drive para Escritorio**, que presenta los archivos a través de un sistema
de archivos virtual. La herramienta reescribe el archivo entero (≈160 KB =
muchos bloques) mientras Drive intercepta el mismo archivo para subirlo. Si Drive
gana la carrera antes de que termine la escritura → **truncamiento**; si el
tamaño y los datos se desincronizan → **cola de nulos**. A mayor tamaño de
archivo, mayor ventana de carrera: `styles.css` (el más grande) es 4 de 5
incidentes. **No** depende del contenido, **no** es GitHub/Vercel, **no** es
(principalmente) el antivirus. El workaround de editar en `/tmp` (disco local
real, sin cliente de sync compitiendo) nunca se corrompió — esa es la prueba.

### Guard de integridad (automático): `_tools/verificar_integridad.py`

Herramienta sin dependencias que detecta y previene ambas firmas:

```bash
# Escanear TODO el repo en busca de bytes nulos (corrupción tipo 2).
python3 _tools/verificar_integridad.py scan .

# Copiar al mount con verificación sha256 + reintento (usar en vez de cp).
python3 _tools/verificar_integridad.py safecopy <origen_fuera_del_mount> <destino_en_mount>

# Verificar que un destino ya copiado sea byte-idéntico al origen.
python3 _tools/verificar_integridad.py verify <origen> <destino>
```

Cualquiera de los tres sale con **código 1** si detecta corrupción. Regla:
**si `scan`/`verify`/`safecopy` fallan, NO hacer `git push` ni desplegar.**

### Protocolo de escritura blindado (mientras el repo siga en Drive)

1. Nunca editar archivos grandes (`styles.css`, `app.js`, HTML) in-place sobre
   el mount. Editar sobre un clon FUERA del mount (`/tmp` del sandbox u
   `outputs/`).
2. Traer cada archivo de vuelta con `safecopy` (verifica e reintenta).
3. Al terminar, correr `scan .` y confirmar **0 corruptos** antes de cerrar.
4. Este guard es complementario al "Protocolo obligatorio antes de subir" de
   arriba (que resuelve la desincronización de contenido); ambos se aplican.

### Solución de fondo recomendada: sacar el repo de Google Drive

Aprobada por Daniel el 2026-07-01. GitHub + Vercel ya son la fuente de la
verdad, así que el mount de Drive agrega riesgo de corrupción sin aportar
respaldo. Migración de una sola vez, en el PC de Daniel:

1. Clonar el repo real en una ruta local **fuera** de Google Drive, p. ej.
   `C:\Users\danie\Dev\Luna3D-3.0` (NO bajo `…\AI\01_Estrella3D\…` si esa raíz
   está sincronizada por Drive):
   `git clone https://github.com/DPEStudios/Luna3D-3.0.git`
2. En Cowork, **seleccionar esa carpeta local** como carpeta de trabajo (en vez
   de `Web_Luna3D_v3` de Drive).
3. Trabajar ahí con git normal (`origin` = GitHub real, push directo dispara el
   deploy de Vercel). Desaparece la corrupción y también la desincronización.
4. La carpeta `Web_Luna3D_v3` de Drive queda solo como archivo/referencia
   histórico (no volver a editar código en ella).

Hasta que se complete esa migración, el guard y el protocolo blindado de arriba
son obligatorios en cada sesión.


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
