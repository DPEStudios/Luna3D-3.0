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

