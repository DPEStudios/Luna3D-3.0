# Prompt de traspaso — Web Luna 3D v3 · Fábrica de Catálogo · FASE B

> Pega este archivo (o su contenido) al inicio de un chat nuevo para retomar sin perder contexto.
> Autor: Claude (Arquitecto de Sistemas Principal) · Para: Daniel Pardo (Estrella 3D SpA) · Fecha: 2026-06-14

---

## 0. Lo primero que debes hacer (Claude, al abrir este chat)

1. Lee la memoria según tu `CLAUDE.md`:
   - `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/INDEX.md`
   - `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/people/daniel-pardo.md`
   - `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/projects/estrella3d.md`  ← busca la entrada "FÁBRICA DE CATÁLOGO — FASE A".
2. Lee el diseño de la fábrica: `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/PROMPT_FabricaCatalogo_Web_Luna3D_v3.md` (es la fuente de verdad del plan; este prompt ejecuta su **Fase B**).
3. Lee el `README.md` del proyecto (sección "Fábrica de Catálogo — Fase A").
4. Trato: **tono formal, español de Chile, profesional.** Llámame **Daniel**. Somos compañeros de trabajo, pero yo estoy a cargo. Sé conciso y directo.

---

## 1. Reglas duras del proyecto (NO romper)

- **No inventar datos** (nombres, precios, reseñas, plazos). Solo lo aprobado por Daniel o derivable de fuente verificable. Lo que falte → placeholder honesto o se omite.
- **Papelera segura:** cualquier borrado/movimiento/reemplazo de archivos del usuario invoca primero la skill `papelera-segura`. Nunca `rm -rf` directo. (En abril 2026 se perdió un Excel con 1.716 fórmulas por un borrado accidental.)
- **Autonomía de proyectos:** `Web_Luna3D_v3/` es autocontenida; no referencia ni comparte assets con otros proyectos.
- **Secretos:** la `SUPABASE_SERVICE_ROLE_KEY` vive SOLO en `Web_Luna3D_v3/.claude-secrets/supabase.env` (gitignored) y en el entorno del hosting. **Nunca** al repo, al cliente, ni al chat. La `anon` y la `URL` sí pueden ir al cliente (es el modelo de seguridad de Supabase: anon + RLS).
- **Trampa del montaje (CRÍTICA, comprobada varias veces):**
  - **git NO puede operar dentro de `/mnt/AI`** (sus escrituras lock+rename quedan con bytes nulos) y `rm` está bloqueado en el montaje.
  - Las **file-tools (Read/Write/Edit) escriben bien** en la carpeta de Daniel, **pero el VM/bash a veces lee una vista vieja/parcial** de esos archivos.
  - **Flujo correcto:** trabajar el repo en `$HOME` (clonar desde el bundle), verificar ahí con node + smoke test, commitear ahí, y copiar al montaje con `cp` de **archivo único** (es fiable, verificar con `md5sum`). Regenerar el bundle al cerrar.

### Flujo git exacto (probado)
```bash
MNT=/sessions/<ID>/mnt/AI/01_Estrella3D/Web_Luna3D_v3   # ajustar <ID> de la sesión
cd $HOME && rm -rf luna3d-repo
git clone -b main "$MNT/Respaldo_Git/luna3d_main.bundle" luna3d-repo
cd luna3d-repo
git config user.email "danielpardoestrella@gmail.com"
git config user.name "Daniel Pardo (via Claude)"
# ... copiar los archivos nuevos/cambiados al work-tree de $HOME, verificar, luego:
git add -A && git commit -m "..."
git bundle create $HOME/luna3d_main.bundle --all
git bundle verify $HOME/luna3d_main.bundle
cp -f $HOME/luna3d_main.bundle "$MNT/Respaldo_Git/luna3d_main.bundle"   # y md5sum para confirmar
```

---

## 2. Estado ACTUAL (cerrado el 2026-06-14) — qué ya está hecho

### Canales de venta (sesiones previas)
- **WhatsApp (sesión 4):** carrito → pedido por `wa.me/56983357145`. Operativo. Función pura `buildWhatsappOrder` + UI `checkoutWhatsapp` en `app.js`.
- **MercadoPago (sesión 5):** preparado, no integrado. Wrapper `paymentGateway.js` (`window.LUNA_PAY`, modo mock), `api/create-preference.js` (serverless Vercel/Netlify) y `.php` alterno. Botón "Pagar con tarjeta" deshabilitado ("pronto"). Falta integración = **sesión 6**.

### FASE A Supabase — HECHA Y VERIFICADA EN VIVO (2026-06-14)
- **Proyecto Supabase creado por Daniel.** Region São Paulo. Project ref: **`dlvechohqlwysryxguqm`**. URL: `https://dlvechohqlwysryxguqm.supabase.co`.
- **Llaves** en `Web_Luna3D_v3/.claude-secrets/supabase.env` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Léelas de ahí; no las repitas en el chat.
- **SQL ejecutado** (los 3 archivos de `Web_Luna3D_v3/supabase/`, en orden 01→02→03):
  - `01_schema.sql`: tabla `public.products` (esquema §3: campos web + internos), vista pública `public.products_public` (solo columnas seguras + `estado='publicado'`), RLS activo (anon sin acceso a la tabla base; escritura solo `service_role`), trigger `updated_at`, y CHECK **`products_publish_guard`** (bloquea publicar si `riesgo_ip<>'verde'`, o curado sin `licencia.comercial=true`; reforzado con `coalesce` por la lógica de 3 valores de SQL).
  - `02_seed.sql`: 20 productos migrados de `data.js`, todos `estado='borrador'`, `fuente='original'`, `riesgo_ip='verde'`. Idempotente.
  - `03_storage.sql`: bucket público `productos` (lectura pública / escritura solo `service_role`).
- **Verificación en vivo (curl a la API REST):** service_role ve 20 filas todas borrador ✓; anon recibe *permission denied* en la tabla base ✓; anon lee `products_public` y devuelve `[]` (no hay publicados) ✓; bucket `productos` existe y es público ✓.
- **Git:** commit `61d3055`; bundle regenerado/verificado/copiado al montaje (md5 ok).

### Esquema `products` (columnas — para referencia)
`id` (text PK, slug) · `cat` · `name` · `price` (int, null=Precio a confirmar) · `img` · `gallery` (jsonb) · `tag` ('Nuevo'|'Oferta'|null) · `featured` (bool) · `rating` · `reviews` · `colors` (jsonb) · `sizes` (jsonb) · `desc` · **internos:** `estado` ('borrador'|'publicado'|'archivado') · `fuente` ('curado'|'original') · `riesgo_ip` ('verde'|'rojo') · `licencia` (jsonb) · `costo` · `gramos` · `tiempo_min` · `margen` · `modelo_3d_url` · `created_at` · `updated_at`.
La **vista pública expone solo:** `id, cat, name, price, img, gallery, tag, featured, rating, reviews, colors, sizes, desc`.

---

## 3. TAREA DE ESTA SESIÓN — FASE B: que la web lea de Supabase

**Objetivo:** la web obtiene el catálogo desde la vista pública de Supabase (solo productos `publicado`), en vez de los datos en memoria de `data.js`. Sin tocar carrito ni venta por WhatsApp. Como todo está en borrador, **la web se verá vacía/igual hasta publicar el primer producto** (eso es lo correcto y esperado).

### Diseño (según §5 del doc de la fábrica)
1. **`catalogData.js`** (nuevo): consulta `GET {URL}/rest/v1/products_public?select=*` con la **anon key**, y **mapea cada fila a la MISMA forma de objeto** que hoy consumen `home.js`, `catalog.js`, `product.js` (incluye `catName` desde `CATEGORIES`/`CAT_NAME` de `data.js`, y aplica defaults: `colors→DEFAULT_COLORS`, `sizes→DEFAULT_SIZES`, `desc→PROD_DESC`).
2. **Wrapper agnóstico** `window.LUNA_DATA` (igual estilo que `window.LUNA_PAY`): expone `getCatalog()` que devuelve una Promesa. Si mañana se cambia Supabase por otra DB, se toca un solo archivo.
3. **La URL + anon key** van en una pequeña config del cliente (son públicas y seguras). Léelas de `.claude-secrets/supabase.env` y colócalas en la config del cliente (p. ej. al inicio de `catalogData.js` o un `config.js`). **No** pongas la service_role en el cliente.
4. **Resiliencia visual obligatoria — Loading / Error / Empty:**
   - *Loading:* mientras llega la respuesta.
   - *Error:* si Supabase no responde → estado vacío honesto + **fallback a `data.js`** (que queda como semilla), nunca se rompe la página.
   - *Empty:* si no hay publicados → mensaje honesto ("pronto nuevos productos"), sin tarjetas falsas.
5. **Reto técnico clave:** hoy las páginas leen `PRODUCTS`/`PROD_BY_ID` de forma **síncrona** al cargar. Hay que adaptarlas a un arranque **asíncrono** (`await LUNA_DATA.getCatalog()` y luego renderizar), manteniendo el mapeo idéntico para no reescribir la lógica de render. Decide el patrón más limpio (p. ej. render con loading → hidratar al resolver) respetando SoC: UI tonta, lógica ciega.
6. **`data.js` permanece** como fallback/semilla y como fuente de las constantes de presentación (`CLP`, `DEFAULT_COLORS`, `DEFAULT_SIZES`, `PROD_DESC`, `CATEGORIES`, `TESTIMONIALS`). Las categorías y testimonios **no** están en la DB en Fase A (siguen en `data.js`).
7. **No tocar:** `app.js` (carrito/WhatsApp/drawer), `paymentGateway.js`, ni la lógica de MercadoPago.

### Verificación obligatoria al cerrar (igual que sesiones previas)
- `node --check` en todos los `.js`.
- **Smoke test jsdom** de las 3 páginas (que rendericen Loading/Empty sin errores; con un producto sembrado, que aparezca).
- **Prueba en vivo** contra Supabase: publicar un producto de prueba (UPDATE `estado='publicado'` con service_role), confirmar que `products_public` lo devuelve y que la web lo muestra; luego volverlo a `borrador`.
- Cerrar con: commit git (flujo $HOME→bundle→cp) + actualizar README + actualizar memoria `estrella3d.md`.

### Demo para Daniel al terminar
Mostrar el flujo completo **borrador → "OK" → aparece en la web**: publicar un producto de prueba con service_role y verlo aparecer; bajarlo de nuevo a borrador. Así Daniel ve cómo funcionará el "OK" de la fábrica.

---

## 4. Cómo verificar Supabase desde el sandbox (recetas listas)

**Leer llaves y consultar la API REST:**
```bash
ENVF=/sessions/<ID>/mnt/AI/01_Estrella3D/Web_Luna3D_v3/.claude-secrets/supabase.env
set -a; source "$ENVF"; set +a
# service_role (ve todo):
curl -s "$SUPABASE_URL/rest/v1/products?select=id,estado" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
# anon (solo vista pública):
curl -s "$SUPABASE_URL/rest/v1/products_public?select=*" \
  -H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

**Publicar/despublicar un producto de prueba (service_role):**
```bash
curl -s -X PATCH "$SUPABASE_URL/rest/v1/products?id=eq.maceteros-1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"estado":"publicado"}'
# (la regla products_publish_guard exige riesgo_ip='verde'; los del seed ya lo tienen)
```

**Postgres real en espacio de usuario (si necesitas validar SQL sin tocar la nube):** Ubuntu 22.04 (jammy), sin root. Descargar e instalar en `$HOME`:
```bash
cd $HOME && mkdir -p pg/debs && cd pg/debs
apt-get download postgresql-14 postgresql-client-14 postgresql-common postgresql-client-common libpq5 ssl-cert
cd .. && for d in debs/*.deb; do dpkg-deb -x "$d" root; done
export PATH=$HOME/pg/root/usr/lib/postgresql/14/bin:$PATH
export LD_LIBRARY_PATH=$HOME/pg/root/usr/lib/x86_64-linux-gnu:$HOME/pg/root/usr/lib
initdb -D $HOME/pg/data -U dani -A trust
pg_ctl -D $HOME/pg/data -o "-k $HOME/pg/sock -p 5433 -c listen_addresses=''" -l /tmp/pg.log start
# crear roles anon/authenticated/service_role(bypassrls) + stub schema storage para validar 03.
```
Recuerda: cada llamada bash es independiente (arranca el server y corre las pruebas en la MISMA llamada).

---

## 5. Pendientes (no perder de vista)

- [ ] **FASE B** (esta sesión): web lee de Supabase con Loading/Error/Empty + fallback a `data.js`.
- [ ] **Rotar la `service_role`** de Supabase (se reveló al copiarla en el setup). Settings → API → rotar; actualizar `.claude-secrets/supabase.env` y el entorno del hosting. *Daniel lo pidió; recordárselo al cerrar la Fase B.*
- [ ] **Sesión 3 — contenido real:** cargar 10–20 productos con foto y precio según `Pauta_Fotos_y_Precios_Web_Luna3D_v3_2026-06-12.(md/pdf)`. Con la DB lista, esto pasa a ser INSERT/UPDATE en `products` (no editar `data.js`). Reemplazar testimonios/FAQ por contenido real.
- [ ] **Páginas legales:** términos, despacho, devoluciones (prompt listo en `PROMPT_Legales_Web_Luna3D_v3.md`).
- [ ] **Sesión 6 — MercadoPago:** cablear "Pagar con tarjeta" a `LUNA_PAY.createCheckout`, páginas `pago-exito/fallido/pendiente.html`, re-validar precios server-side, sandbox. (Daniel debe: cuenta vendedor MP + Access Token TEST, confirmar hosting Vercel/Netlify, dominio para back_urls.)
- [ ] **FASES C–E** (fábrica autónoma): pipeline de descubrimiento + filtro IP/licencia + análisis económico (Excel Maestro) + generación de imagen + alta como borrador + aprobación en chat + agendar tarea recurrente.
- [ ] **Publicación en luna3d.cl (sesión 8):** revisar rutas/imagen Open Graph; confirmar hosting; configurar las variables de entorno (incl. `SUPABASE_*` y `MP_ACCESS_TOKEN`) en el panel del host.

---

## 6. Rutas y datos clave (resumen)

- **Proyecto:** `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/`
- **Diseño fábrica:** `PROMPT_FabricaCatalogo_Web_Luna3D_v3.md`
- **SQL Fase A:** `supabase/01_schema.sql`, `02_seed.sql`, `03_storage.sql`, `SETUP_Supabase_Fase_A.md`, `ENV_TEMPLATE.txt`
- **Llaves (secreto):** `.claude-secrets/supabase.env`  ·  **Supabase URL:** `https://dlvechohqlwysryxguqm.supabase.co`
- **Repo/bundle:** `Respaldo_Git/luna3d_main.bundle` (rama `main`, último commit `61d3055`)
- **WhatsApp comercial:** `56983357145`
- **Excel Maestro:** `/mnt/AI/01_Estrella3D/Finanzas/00_Control_Financiero/Estrella3D_Maestro.xlsx` (hoja `🧮 Calculadora_Costo`)
- **Servir local:** `cd Web_Luna3D_v3 && python3 -m http.server 8080` → `http://localhost:8080/index.html`
```
```
