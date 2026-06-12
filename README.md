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
