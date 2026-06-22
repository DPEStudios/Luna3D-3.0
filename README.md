# Luna3D — Web v3 (rediseño)

Sitio **estático autocontenido** (HTML/CSS/JS, sin build) del rediseño moderno de Luna3D.
Basado en el Manual de Marca v1.0 y reutilizando el contenido de luna3d.cl.

Carpeta independiente: no referencia assets ni código de otros proyectos. Se puede zippear y entregar tal cual.

## Cómo abrirlo

Necesita servirse por HTTP (no `file://`) porque las páginas cargan datos y chrome vía JS.

```bash
cd Web_Luna3D_v3
python3 -m http.server 8080
# luego abrir http://localhost:8080/index.html
```

## Estructura

| Archivo | Rol |
|---|---|
| `index.html` | Home — hero, destacados, categorías, "cómo funciona", novedades, opiniones, CTA |
| `catalogo.html` | Catálogo con filtros funcionales (categoría, colección, precio) y orden |
| `producto.html` | Detalle de producto (galería, color/tamaño, cantidad, specs, relacionados) |
| `styles.css` | Sistema visual completo (tokens de marca en `:root`) |
| `data.js` | Catálogo, categorías, testimonios (contenido) |
| `app.js` | Motor compartido: fondo cósmico, carrito (localStorage), nav, footer, drawer, toasts |
| `home.js` / `catalog.js` / `product.js` | Lógica específica de cada página |
| `tweaks.jsx` / `tweaks-panel.jsx` | Panel "Tweaks" — herramienta de diseño (ver nota) |
| `assets/` | Logos oficiales (color, blanco, navy) |

## Sistema de marca aplicado

- **Color:** Azul Espacial (`#070C20`…) + degradado Aurora (`#E81F9D → #8E2BE6`).
- **Tipografías:** Space Grotesk (títulos), Manrope (texto), Space Mono (detalles).
- Todos los colores y medidas son tokens CSS en `:root` — no hay magic numbers en los componentes.

## Estado / pendientes

- **Imágenes:** placeholders con estilo de marca. Reemplazar por fotos reales de producto.
- **Checkout / login / búsqueda:** visuales, aún no transaccionales.
- **Panel "Tweaks":** ver nota abajo — pendiente decidir si se mantiene.

## Nota sobre el panel "Tweaks"

Los archivos `tweaks.jsx` y `tweaks-panel.jsx` montan un pequeño panel (React + Babel desde CDN)
que aparece sobre la Home y permite **previsualizar variaciones del hero en vivo**: disposición
(Centrado / Dividido / Inmersivo), titular alternativo e intensidad del fondo cósmico.

Es una **herramienta de diseño**, no parte de la tienda. Sirve para que tú elijas la versión del
hero que más te gusta; una vez decidida, se puede quitar para dejar el sitio más liviano (sin la
dependencia de React/Babel). Está activo por ahora para que lo pruebes y lo conversemos.

## Control de versiones (IMPORTANTE — leer antes de tocar git)

**git NO puede operar directamente en esta carpeta** (montaje Google Drive): sus escrituras
lock+rename quedan corruptas con bytes nulos (comprobado 2x el 11 y 12-jun-2026). Además el
montaje bloquea `rm`, así que un `.git` roto solo puede moverse a `_Papelera/`, no borrarse.

**LECCIÓN SESIÓN 2 (crítica):** las ediciones hechas con las *file-tools* (Read/Write/Edit) escriben bien en la carpeta de Daniel, pero **NO son visibles para el VM/bash** (bash lee una vista vieja del montaje). Si se comitea con `WORK_TREE=/mnt`, git tomaría las versiones truncadas/viejas. Regla: **trabaja el repo en `$HOME` con `WORK_TREE=$HOME/luna3d-repo`** (reconstruyendo ahí los cambios y verificándolos con node + smoke test), commitea desde ahí, y copia el bundle al montaje con `cp` (las escrituras de archivo único bash→montaje sí son fiables, md5 verificado). Alternativa: hacer las ediciones directamente con bash para que el VM las vea.

**Flujo correcto en cada sesión de Claude:**

```bash
# 1. Restaurar el repo en disco local de la VM (NO en /mnt)
git clone -b main Respaldo_Git/luna3d_main.bundle $HOME/luna3d-repo
# (o usar bare: git init --bare $HOME/luna3d-repo.git + fetch desde el bundle)

# 2. Trabajar con GIT_DIR apuntando al repo local y WORK_TREE a esta carpeta
export GIT_DIR=$HOME/luna3d-repo/.git GIT_WORK_TREE=/ruta/a/Web_Luna3D_v3
git add -A && git commit -m "..."

# 3. Al cerrar la sesión, regenerar el bundle (archivo único, se escribe bien)
git bundle create Respaldo_Git/luna3d_main.bundle main
git bundle verify Respaldo_Git/luna3d_main.bundle
```

`Respaldo_Git/luna3d_main.bundle` contiene la historia completa y vive en el disco de Daniel.
Para restaurar a cualquier commit: clonar el bundle y copiar los archivos.

## Estado al cierre de la sesión 1 (12-jun-2026)

- Archivos reparados tras corrupción del 11-jun (NULs de cola): app.js, index.html, styles.css.
- home.js reconstruido (estaba truncado): gift finder completo, ofertas + countdown, FAQ, testimonios.
- Panel Tweaks retirado (sin React/Babel). Los .jsx están en `_Papelera/2026-06-12_0045_.../`.
- Smoke test jsdom: las 3 páginas renderizan todas sus secciones sin errores.
- Pendiente próximo (sesión 2): estructura de catálogo real en data.js + pauta de fotos/precios.

## Estado al cierre de la sesión 2 (12-jun-2026)

- **Catálogo real:** `data.js` reescrito con **5 categorías reales** (Maceteros y jardín, Decoración
  hogar, Llaveros y accesorios, Cultura pop y coleccionables, Organización y oficina) y **20 slots**
  placeholder con schema de contenido real: `name, price, img, tag, featured, rating, reviews,
  colors, sizes, desc`. Sin precios ni reseñas inventadas (`price`/`rating` = null, `reviews` = 0).
- **Gift finder por datos:** el mapeo persona→categoría se lee del campo `personas` de cada categoría
  (ya no hay IDs `cat-N` hardcodeados).
- **Páginas null-safe:** sin precio → "Precio a confirmar" y botón de compra desactivado; foto real o
  placeholder `FOTO`; selector de tamaño solo si hay variantes; colecciones por `featured`/`tag`.
- **Verificación:** `node --check` en los 5 JS + smoke test jsdom de las 3 páginas (catálogo = 20
  productos, 6 filtros, persona→categoría, etc.) → **0 fallos**.
- **Pauta entregada:** `Pauta_Fotos_y_Precios_Web_Luna3D_v3_2026-06-12.(md|pdf)` — fotografía
  (fondo/luz/encuadre/formato/nombres por ID) + plantilla de precios (desde el Excel maestro) + cómo
  se carga en `data.js`. Tarea de Daniel antes de la sesión 3.
- **Commits sesión 2:** `1256d4b` (catálogo real) + commit de docs. Bundle regenerado y verificado.
- **Pendiente próximo (sesión 3):** cargar 10–20 productos reales con foto y precio según la pauta,
  reemplazar testimonios/FAQ por contenido verdadero y redactar textos legales.

## Estado al cierre de la sesión 4 (13-jun-2026)

- **Venta por WhatsApp (primera versión vendible):** el carrito ya genera el pedido por WhatsApp.
  - `buildWhatsappOrder(cart, total)` — función **pura** (no toca el DOM): arma la URL
    `https://wa.me/<n>?text=<pedido>` URL-encoded con saludo, una línea por ítem
    `• {qty}× {nombre} — {CLP(precio×qty)}`, `Total:` y cierre pidiendo nombre y comuna.
  - `checkoutWhatsapp()` (capa UI) abre el pedido en pestaña nueva. Edge cases: carrito vacío
    (o sin ítems con precio) → toast y no abre; ítems con `price==null` se saltan.
  - Botón primario **"Pedir por WhatsApp"** en el pie del drawer. El "Pagar con tarjeta" quedó
    como botón secundario **deshabilitado** ("pronto") hasta integrar MercadoPago (sesiones 5–6).
- **Número centralizado:** una sola constante `WHATSAPP_NUMERO` en `app.js`, reutilizada por footer,
  botón flotante y checkout. Reemplaza el antiguo placeholder `56912345678`; el footer muestra el
  número legible vía `waDisplay()`. **Número real configurado: `56983357145` (+56 9 8335 7145).**
- **SEO/Open Graph (extra):** `title`/`description` + Open Graph y Twitter Card en las 3 páginas,
  con `og:image` = logo de `assets/`. Base `https://luna3d.cl/` (revisar al publicar, sesión 8).
  De paso se corrigió la `description` inventada del catálogo ("más de 300 piezas").
- **Verificación:** `node --check` en los 5 JS + smoke test jsdom (3 páginas + 5 pruebas del pedido
  WhatsApp con carrito sembrado) → **27/27, 0 fallos**.
- **Commits sesión 4:** `317adef` (WhatsApp) + `675e75e` (SEO). Bundle regenerado y verificado
  (verify + clon de prueba + `node --check`).
- **Cómo probarlo:** servir la carpeta (`python3 -m http.server 8080`), abrir un producto **con
  precio** (los del catálogo aún son placeholder sin precio), añadirlo al carrito y pulsar
  "Pedir por WhatsApp": abre WhatsApp con el pedido hacia +56 9 8335 7145.
- **Pendientes:** (1) **carga de contenido real (sesión 3)** sigue pendiente — sin productos con
  precio no se puede añadir nada al carrito en la web real; (2) **pago con tarjeta / MercadoPago**
  (sesiones 5–6); (3) revisar rutas/imagen social de Open Graph al publicar en luna3d.cl (sesión 8).


## Estado al cierre de la sesión 5 (13-jun-2026)

- **MercadoPago — preparación (canal de venta 2, base lista).** Investigación + decisión de
  arquitectura + wrapper de pago, **sin tocar** la lógica del sitio ni la venta por WhatsApp.
- **Hosting investigado:** la v2 en producción de `luna3d.cl` corre **Next.js / Node**
  (optimizador `/_next/image`), así que el entorno ya soporta **funciones serverless** (probable
  Vercel). *Daniel debe confirmarlo con acceso al panel del host.*
- **Decisión (ADR 2026-06-13):** el endpoint que crea la preferencia MercadoPago vive como
  **función serverless** junto al sitio estático (el "Plan B" del plan resulta el camino natural).
  El Access Token va como variable de entorno, **nunca** en el repo ni en el cliente.
- **Construido:**
  - `paymentGateway.js` — wrapper de cliente **agnóstico** (`window.LUNA_PAY`): `buildOrderPayload`
    (pura) + `createCheckout`. En **modo `mock`** prueba el flujo sin backend.
  - `api/create-preference.js` — función serverless (Vercel/Netlify, Node) con `MP_ACCESS_TOKEN`
    del entorno. **Recomendado.**
  - `api/create-preference.php` — equivalente PHP (solo si el hosting fuese cPanel).
  - `PAGOS_MercadoPago_Web_Luna3D_v3.md` — ADR + flujo + despliegue + lo que falta.
- **Verificación:** `node --check` en los 7 JS (incl. wrapper y endpoint) + smoke test jsdom
  (3 páginas intactas + pruebas del wrapper de pago) → **16/16, 0 fallos**.
- **Commits sesión 5:** `eae7d23` (código + doc/ADR) + commit de README. Bundle regenerado y verificado.
- **Pendiente de Daniel (antes de la sesión 6):** cuenta vendedor MercadoPago + **Access Token TEST**,
  confirmar el hosting (Vercel/Netlify vs PHP) y el dominio para `back_urls`.
- **Próxima sesión (6 — integración):** cablear el botón "Pagar con tarjeta" del carrito a
  `LUNA_PAY.createCheckout`, crear `pago-exito/fallido/pendiente.html`, re-validar precios
  server-side y probar el flujo completo en **sandbox**. (Siguen pendientes la carga de contenido
  real — sesión 3 — y las páginas legales.)


## Fábrica de Catálogo — Fase A (Supabase) preparada (14-jun-2026)

Track paralelo a las sesiones de venta (ver `PROMPT_FabricaCatalogo_Web_Luna3D_v3.md`). Objetivo:
que el alta de un producto pase de "editar código + redeploy" a **un INSERT por API**, con la
publicación controlada por el "OK" de Daniel.

- **Artefactos pegar-y-ejecutar en `supabase/`** (Daniel aún no creó el proyecto; queda listo para
  cuando pegue las llaves):
  - `01_schema.sql` — tabla `products` (esquema §3: campos web + internos), vista pública
    `products_public` (solo columnas seguras + solo `estado='publicado'`), RLS (anon no toca la
    tabla base; escritura solo `service_role`), trigger `updated_at` y la **regla dura de
    publicación** como CHECK (`products_publish_guard`).
  - `02_seed.sql` — migra los 20 slots actuales de `data.js` como **borradores** (invisibles en la
    web), `fuente='original'`, `riesgo_ip='verde'`. Idempotente (`ON CONFLICT DO NOTHING`).
  - `03_storage.sql` — bucket público `productos` + lectura pública / escritura solo `service_role`.
  - `ENV_TEMPLATE.txt` + `SETUP_Supabase_Fase_A.md` — molde de llaves y guía paso a paso.
- **Seguridad:** la `service_role` va solo a `.claude-secrets/` y al entorno del hosting, nunca al
  repo ni al chat (decisión de Daniel). La `anon` (solo lectura de la vista) sí puede ir al cliente.
- **Verificación (Postgres 14 real en el sandbox):** los 3 SQL ejecutan sin error; seed = 20
  borradores; la regla de publicación se probó en 5 casos → permite original/curado válidos y
  **bloquea** riesgo `rojo`, `riesgo_ip` nulo y curado sin licencia comercial (se reforzó con
  `coalesce` porque con SQL de 3 valores un dato faltante evaluaba a NULL y el CHECK lo dejaba pasar);
  la vista pública no expone ningún campo interno (`costo/margen/licencia/...`); bucket creado público.
- **Pendiente de Daniel:** crear el proyecto en supabase.com y pegar `URL` + `anon` + `service_role`
  en `.claude-secrets/supabase.env` (pasos en `SETUP_Supabase_Fase_A.md`). Con eso arranca la
  **Fase B** (la web lee de la vista pública vía `catalogData.js` + wrapper `LUNA_DATA`, con
  Loading/Error/Empty; WhatsApp y carrito intactos).


## Fábrica de Catálogo — Fase B (la web lee de Supabase) completada (14-jun-2026)

La web ya obtiene el catálogo desde la **vista pública `products_public`** (solo `estado='publicado'`)
con la **anon key**, en vez de los datos en memoria de `data.js`. Como hoy todo está en borrador, la
web se ve **vacía** (Empty) hasta publicar el primer producto — es lo correcto y esperado.

- **`catalogData.js` (nuevo):** wrapper **agnóstico** `window.LUNA_DATA` (mismo estilo que
  `LUNA_PAY`). `getCatalog()` consulta `/rest/v1/products_public?select=*` (timeout 8s con
  AbortController) y `bootstrap()` orquesta y **nunca rechaza**. `mapRow()` mapea cada fila a la
  **misma forma de objeto** que ya consumen home/catalog/product (incluye `catName` desde `CAT_NAME`,
  conserva nulos para que la UI aplique sus defaults `DEFAULT_COLORS/SIZES/PROD_DESC`).
- **Config del cliente:** `URL` + `anon` embebidas en `catalogData.js` (públicas y seguras por el
  modelo anon + RLS). La `service_role` **jamás** vive en el cliente.
- **Arranque asíncrono** en las 3 páginas (`await LUNA_DATA.bootstrap()` -> render). Hidrata
  **en su lugar** los `const PRODUCTS` / `PROD_BY_ID` (splice/push + delete/assign) para que
  `app.js` (megamenú, carrito, favoritos — que los lee **perezosamente**) siga consistente **sin
  tocar `app.js`**.
- **Resiliencia visual:** *Loading* en los grids; *Empty* (mensajes honestos + guard "Producto no
  disponible" en producto.html); *Error* -> **fallback a la semilla `data.js`** (la página nunca se
  rompe). `data.js` permanece como semilla/fallback y fuente de constantes de presentación.
- **No se tocó** `app.js`, `paymentGateway.js` ni la lógica de MercadoPago.
- **Verificación:** `node --check` (7 JS); **smoke jsdom 18/18** (Loading/Empty/Error/seed en las 3
  páginas); **e2e con red REAL contra Supabase** (publicar `maceteros-1` con service_role -> la web lo
  renderiza `source:supabase` -> revertir a borrador); curl confirmó que la vista no expone `estado`.
- **Commit:** `b53991a`. Bundle regenerado, verificado y clonado de prueba; 7 archivos copiados al
  montaje con md5 ok.
- **Demo del "OK" de la fábrica:** publicar un producto con service_role
  (`PATCH products?id=eq.<id> -d '{"estado":"publicado"}'`) -> aparece en la web; bajarlo a borrador
  -> desaparece. Así funcionará la aprobación en chat de las fases siguientes.
- **PENDIENTE DE DANIEL (recordatorio):** **rotar la `service_role` key** (se reveló al copiarla en el
  setup): Supabase -> Settings -> API -> rotar; actualizar `.claude-secrets/supabase.env` y el entorno
  del hosting.
- **Próximo:** la carga de contenido real pasa a ser **INSERT/UPDATE en `products`** (no editar
  `data.js`) + subir fotos al bucket `productos`; luego publicar con el "OK".
