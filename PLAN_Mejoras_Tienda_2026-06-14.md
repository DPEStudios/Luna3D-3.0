# PLAN DE MEJORAS — Web Luna 3D v3 (rediseño "tienda real")

> **Norte permanente (filosofía Daniel, 2026-06-14):** la página debe sentirse como una
> **tienda online real** (Amazon, Falabella, Mercado Libre, Etsy): más productos visibles,
> menos espacios vacíos, protagonismo al producto y menos a lo decorativo, y aprovechar el
> ancho de pantalla. Todo conserva el Manual de Marca (Azul Espacial + gradiente Aurora
> `#E81F9D→#8E2BE6`, Space Grotesk / Manrope / Space Mono = tokens en `:root` de `styles.css`).
>
> **Cómo usar este plan:** cada sesión es independiente y se ejecuta en un chat aparte.
> Al abrir un chat nuevo, decir: *"sigamos con la Web Luna 3D, hagamos la SESIÓN N de
> `PLAN_Mejoras_Tienda_2026-06-14.md`"*. Al cerrar cada sesión: sitio funcionando + commit +
> actualizar memoria + marcar la sesión como ✅ aquí.

## Lista de arranque de CADA sesión (leer SIEMPRE, en este orden)
1. `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/INDEX.md` → `people/daniel-pardo.md` →
   `glossary.md` (lo exige el CLAUDE.md).
2. `projects/estrella3d.md` → sección **Web Luna3D v3** + **FILOSOFÍA DE DISEÑO** + **PLAN**.
3. **Este plan** (la sesión que toca) y la **Bitácora de avance** al final.
4. `MARCA_Luna3D_referencia.md` (colores, tipos, tokens día — sin abrir el PDF).
5. `README.md` del proyecto (**REGLA GIT DURA** y flujo de montaje).
6. Los archivos que toque la sesión (`styles.css`, `app.js`, `index.html`, `home.js`, etc.).
> Con esto la sesión hereda: filosofía, marca, estado del proyecto, reglas de seguridad y git.
> No depende de la memoria de conversación de ningún chat anterior.

---

## Estado actual relevante (para no romper lo hecho)
- Home ya tiene: hero slider con 2 banners, **feature strip** (Más vendidos / Regalo / Oferta /
  FAQ), Sección 1 **Hot Sale + Nuevos lanzamientos** (carruseles), Sección 2 **Gift Finder**,
  Sección 3 **Ofertas + contador**, Sección 4 **FAQ**, **CTA "¿Tienes una idea?"**, Testimonios.
- Catálogo lee de **Supabase** (`products_public`) con fallback a `data.js`. **No romper** ese flujo.
- `app.js` = nav + footer + carrito + drawer + favoritos + megamenú + flotantes (global a las 3 págs).
- **REGLA GIT DURA:** git no opera dentro del montaje; trabajar repo en `$HOME`, exportar bundle.
- **PAPELERA:** nada se borra sin respaldo (skill `papelera-segura`).

---

## SESIÓN 1 — Fundaciones globales: layout ancho + Modo Claro  ✅
**Archivo principal:** `styles.css` (tokens y media).
Es la base que hace que TODO se vea más "tienda". Hacer primero.
- **Ancho / márgenes:** ampliar `.wrap` (max-width mayor) y reducir márgenes laterales globales;
  más ancho aprovechado en escritorio.
- **Modo claro — contraste y profundidad:** subir contraste general; tonos intermedios más
  oscuros para dar profundidad (hoy se ve plano y brillante).
- **Header oscuro también en claro:** mantener el header oscuro en modo claro (identidad +
  contraste con acentos rosados).
- **Barra de búsqueda (claro):** dejar de heredar colores oscuros; integrarla al tema claro.
- **Bloques de acceso rápido (claro):** "Más vendidos / Busca un regalo / Oferta" hoy quedan
  con fondo oscuro en claro → versión clara legible.
- **Dropdown del catálogo (claro):** versión adaptada al tema claro (hoy queda oscuro).
- **Botón "subir" (claro):** oscurecerlo levemente, elegante y discreto (hoy bajo contraste).

## SESIÓN 2 — Header / Navegación (`app.js` + estilos del nav)  ✅
- **Menú Catálogo hover:** que vuelva a desplegarse al pasar el mouse **también dentro de
  `catalogo.html`** (hoy desactivado).
- **Dropdown Catálogo clickeable:** click en categoría principal (ej. "Cultura Pop y
  Coleccionables") → redirige a `catalogo.html?cat=…`; mantener para principales y subcategorías.
- **Botón Catálogo (CTA):** mantener brillo/destello; reforzar jerarquía (borde rosado /
  tratamiento distintivo) como CTA principal del header.
- **Botón Favoritos:** quitar el brillo por completo; ícono de corazón más moderno; reducir
  protagonismo (acción secundaria).
- **Favoritos desplegable:** mostrar **miniatura + nombre + precio** (hoy solo nombre y precio).
- **Barra de búsqueda:** revisar apariencia en claro (coordinar con Sesión 1).

## SESIÓN 3 — Home: reorganizar accesos rápidos + secciones de producto  ✅
**Archivos:** `index.html` + `home.js` (+ estilos).
- **Strip de accesos rápidos:** pasar de 4 a 3 bloques → **Más vendidos (ocupa 2 bloques)**,
  **Busca un regalo**, **Oferta de la semana**. **Eliminar "Preguntas frecuentes"** del strip.
- **Más vendidos (strip):** mucho más grande, con **mini carrusel** de productos populares
  rotando; al hacer clic → **scroll** a la sección "Productos más vendidos".
- **Sección Más Vendidos (reforzar la actual Hot Sale):** mitad izquierda **banner grande**
  promocional; mitad derecha **grid de 6 productos** compactos; CTA "Ver todos los más vendidos".
- **Sección Nuevos Lanzamientos:** mismo patrón, destacando recién agregados.
- **Gift Finder:** productos en formato **más compacto** (imagen, nombre, precio, "ver más");
  quitar tarjetas demasiado grandes.

## SESIÓN 4 — Recuadros de categorías estilo "Encuentra tu producto"  ✅
**Ref. visual:** imagen enviada por Daniel (hero dividido: izquierda título "Encuentra tu
producto" + botón Explorar; derecha **grid 2×3 de 6 recuadros de categoría** grandes, con glow
por categoría). Prioridad al **tamaño** de los recuadros y que **converse con el manual de marca**.
- Implementar el bloque de categorías grande y vistoso (Decoración, Llaveros, Maceteros, Cultura
  pop, Funcional, Custom — ajustar a las 5 categorías reales + Custom).
- Cada recuadro → `catalogo.html?cat=…`.

## SESIÓN 5 — Oferta de la semana + FAQ + quitar CTA + Newsletter catálogo  ✅
- **Oferta de la semana:** banner/imagen promocional con **contador visible dentro de la imagen**
  (esquina sup. derecha o zona reservada); transmitir urgencia.
- **FAQ:** mantener contenido "¿Qué ocurre después de comprar?"; reducir alto, **centrar**,
  más elegante y compacta.
- **Eliminar** la sección CTA **"¿Tienes una idea?"** (no se reciben propuestas personalizadas por ahora).
- **Newsletter (catálogo):** reducir tamaño, más discreto, mejor integrado al footer.

## SESIÓN 6 — Footer + botones flotantes (WhatsApp / subir)  ✅
- **Footer WhatsApp:** mantener el acceso, **quitar el número** visible; reemplazar por texto
  amigable ("¿Tienes consultas? Escríbenos." / "Contáctanos por WhatsApp.").
- **Footer inferior:** eliminar el logo pequeño junto a "Luna 3D SPA © …"; mover el texto a la
  **izquierda** y simplificar.
- **Flotantes:** WhatsApp más abajo por defecto; **botón subir aparece solo tras cierto scroll**;
  al aparecer, WhatsApp **se desplaza hacia arriba** con animación suave (WhatsApp abajo → subir
  debajo → WhatsApp sube para dejar espacio).

## SESIÓN 7 (FUTURA) — Notificaciones y Cuentas reales  ⬜
- **Notificaciones:** hoy el ícono no hace nada → definir tipos y dar funcionalidad real.
- **Autenticación real:** registro, inicio de sesión, recuperación de contraseña, login con
  Google. (Hoy "Iniciar sesión" y "Crear cuenta" abren el mismo panel solo visual.)
- Se hace **al finalizar** la web principal.

---

## Sin cambios (confirmado por Daniel)
Hero (estructura), Logo, Perfil/Cuenta (queda futuro), Encabezado y Filtros y Grid del catálogo,
Ficha de producto, Drawer carrito, Fondo cósmico, Testimonios (carrusel/marquee ok).

## Bitácora de avance
- 2026-06-14: plan creado. Memoria de filosofía guardada en `projects/estrella3d.md`. Pendiente
  ejecutar Sesiones 1→6 (7 futura).
- 2026-06-14: **SESIÓN 1 ✅** — `styles.css` (1759→1893 líneas). Decisiones:
  - `--maxw` 1280→1400px; `.wrap` padding 40→32px; hero `min(1336px,…-64px)`;
    megamenu `calc(100%-64px)`.
  - Tokens light-mode: `--line` .10→.14, `--glass` .03→.05, etc. (+profundidad y contraste).
  - Nuevos tokens: `--shadow-day` y `--shadow-day-lg` (sombras azuladas para tarjetas en claro).
  - `.nav.scrolled` en modo claro: fondo oscuro `rgba(8,13,33,.88)` (header siempre oscuro).
  - Overrides de componentes en claro: nav texto blanco, búsqueda noche, megamenú blanco,
    feature-strip/tarjetas con sombra azulada, sidebar oscuro, scroll-top oscuro discreto.
  - Commit `3dd0529`, bundle regenerado y verificado.
- 2026-06-14: **SESIÓN 2 ✅** — `app.js` + `styles.css` (2017 líneas). Decisiones:
  - Megamenú hover reactivo también dentro de `catalogo.html` (isOnCatalog → solo marca
    `catalog-active`; hover del panel sigue funcionando en todas las páginas).
  - Click en categoría principal del megamenú → `catalogo.html?cat=…`.
  - Botón Favoritos: clase `btn-fav` (sin shimmer); corazón moderno Feather stroke+fill.
  - Popover favoritos: miniatura 38px + nombre + precio (antes solo texto).
  - Light-mode overrides para `btn-fav` (scrolled + hover). Commit `646a70e`.
- 2026-06-14: **SESIÓN 4+5 ✅** — `index.html` + `home.js` + `styles.css`. Commit `2da6f75`. Decisiones:
  - **S4 — Cat-hero:** sección #seccion-cats entre S1 y S2; `.cat-hero` grid 1fr/1.65fr
    (texto+CTA izquierda, `.cat-grid` 2×3 derecha). 5 categorías reales + tile Custom → WA.
    Glow por categoría via `--cat-glow`/`--cat-glow-sh` + `data-cat`. `renderCatGrid()` en
    `home.js` sincrónico (usa `CATEGORIES` de `data.js`, no depende de Supabase).
  - **S5 — Oferta:** `.offer-hero-banner` con `.offer-hero-timer` embebido (countdown visual
    integrado al banner, no separado). Mantiene `#timer-clock` para `initCountdown()`.
  - **S5 — FAQ:** clase `faq-section` + `block-head` centrado; `.faq-list` centrada (760px +
    `margin:0 auto` via override CSS).
  - **S5 — CTA:** sección "¿Tienes una idea?" eliminada completamente.
  - **S5 — Newsletter:** `.footer-newsletter` padding/margin reducido; `.fn-title` 20px.
  - Light-mode overrides para cat-tile y offer-hero-banner. Responsive: cat-grid 3 cols en
    900px, 2 cols en 560px. Offer-hero: columna en 600px. node --check 7/7 OK.
- 2026-06-14: **SESIÓN 6 ✅** — `app.js` + `styles.css` (2336 líneas). Commit `d429cf0`. Decisiones:
  - **Footer WA:** `soc-handle` → "Contáctanos por WhatsApp" (oculta número real).
  - **footer-bottom:** `<img>` logo eliminado de `fb-left`; copyright queda solo, alineado izquierda.
  - **Flotantes WA-up:** `buildFloatingActions` agrega `wa = d.querySelector('.whatsapp-float')`;
    `onScroll` toglea `.wa-up` junto a `.show` en scroll > 500px.
  - **CSS flotantes:** `--wa-y: 66px` (54px btn + 12px gap) → WA arranca abajo via `translateY`.
    `.wa-up` → `--wa-y: 0px` (slide up suave). Hover: `translateY(calc(--wa-y - 3px)) scale(1.02)`.
  - **scroll-top:** entrada con `scale(.75)+translateY(10px)` → `scale(1)+translateY(0)` (cubic-bezier).
  - **Responsive 560px:** `--wa-y: 60px` (btn 48px + gap 12px = 60px en mobile).
- 2026-06-14: **SESIÓN 3 ✅** — `index.html` + `home.js` + `styles.css` (2065 líneas). Decisiones:
  - Feature strip 4→3 bloques; primer bloque `.fs--wide` ocupa `grid-column:span 2`.
    Clic → `scrollIntoView` suave a `#seccion-1`.
  - Mini-carousel (`.mini-slide`, `.mini-carousel-wrapper`) con rotación cada 3 s.
  - Sección 1: `hot-sale-carousel`/`new-carousel` → `#mas-vendidos-split`/`#nuevos-split`
    con layout `showcase-split` (banner promo 200 px + compact grid 3 cols).
  - `compactCard()` + `renderShowcaseSplit()` en `home.js`; gift finder slice 4→6 items.
  - Responsive: 900 px → split 1 col + compact-grid 2 cols + `fs--wide` desactivado;
    600 px → compact-grid 2 cols, gift-grid 2 cols.
  - Light-mode: compact-card, promo-banner, mini-slide. Commit `d56014b`, bundle verificado.
