# Informe de Auditoría Responsive — Web Luna 3D

**Proyecto:** Web_Luna3D_v3 · **Fecha:** 24 de junio de 2026 · **Responsable técnico:** Claude (Arquitecto de Sistemas) · **A cargo:** Daniel Pardo
**Archivo intervenido:** `styles.css` (un solo bloque nuevo al final). **NO se tocó** `app.js`, ni la lógica de carrito, WhatsApp, pagos, Supabase ni `catalogData.js`.
**Estado:** Desplegado en producción → https://luna3d.cl (Vercel, ✓ Ready) · Respaldo previo en `_Papelera/20260625_020133_pre-auditoria-responsive/`

---

## 1. Resumen ejecutivo

Se auditó la experiencia responsive completa del sitio en seis anchos reales (**320, 375, 768, 1024, 1440 y 1920 px**), verificando en vivo en el navegador, no solo por código. El diagnóstico confirmó que la **vista de escritorio estaba correcta**, pero existían fallas relevantes en **móvil y tablet**, concentradas en el header.

El cambio se hizo **solo en CSS**, en un bloque acotado por media queries que **no altera la vista de escritorio (≥901 px)** —verificado comparando antes/después a 1440 px—. Por eso, conforme a tu criterio, se publicó directo a producción tras validarlo primero en un *preview*.

El resultado: header móvil reorganizado en dos filas (marca + buscador a todo el ancho), buscador siempre usable, logo nunca recortado, selector de apariencia trasladado al menú hamburguesa, eliminación del scroll horizontal en todas las páginas y formularios en una sola columna en celular.

---

## 2. Metodología

Como Chrome en este equipo no permite reducir la ventana por debajo de ~1536 px, la verificación se hizo con **viewports simulados por iframe** (que respetan las media queries según su ancho real) sobre el sitio en vivo, midiendo el desbordamiento horizontal real (`scrollWidth − clientWidth`) y capturando cada breakpoint. Se validó primero en *preview* de Vercel y luego en producción.

---

## 3. Problemas encontrados y soluciones implementadas

### Header

| # | Problema (antes) | Causa raíz | Solución |
|---|---|---|---|
| H1 | **Logo "Luna 3D" recortado** en móvil (se veía solo un trozo del glifo) | La columna izquierda del grid se exprimía porque el buscador central (`1fr`) le robaba el espacio | Header reorganizado en **dos filas**; el logo deja de competir con el buscador y se muestra íntegro |
| H2 | **Buscador inusable**: quedaba reducido a una lupa de ~38 px donde no se podía escribir | Era la columna central `1fr`, exprimida entre logo y acciones | El buscador pasa a una **segunda fila a todo el ancho**, siempre usable |
| H3 | **Selector de apariencia visible** en móvil/tablet | No se ocultaba en anchos pequeños | Se **oculta a ≤900 px** y queda disponible en el menú hamburguesa (sección "Apariencia", ya existente y funcional) |
| H4 | **La hamburguesa se salía de pantalla a 320 px** (quedabas sin acceso al menú) | Demasiados controles compitiendo en una sola fila | Con el buscador en otra fila y el selector oculto, la fila principal queda holgada: logo · Catálogo · carrito · menú |
| H5 | Botón "Catálogo" poco claro / espacio mal aprovechado | — | Catálogo queda como **icono compacto** (texto solo en escritorio), coherente con el resto |

### Cuerpo (body)

| # | Problema (antes) | Causa raíz | Solución |
|---|---|---|---|
| B1 | **Hero (banner) se veía como una tira fina** e ilegible en móvil | Las imágenes son apaisadas (1713×459, proporción 3.73) con texto incrustado | Banner a **sangre completa** en móvil para darle más presencia (ver recomendación §5) |
| B2 | **Scroll horizontal en `/producto`** (+83 px a 320 px) | El grid del detalle (`1fr`) no permitía encoger bajo el ancho de la galería/miniaturas | `grid-template-columns: minmax(0,1fr)` + `min-width:0` → **0 desbordamiento** |
| B3 | **Formulario de contacto en 2 columnas apretadas** en celular | `.contact-layout` y `.cf-row` no colapsaban | Pasan a **una sola columna desde ≤900 px** |
| B4 | **Scroll horizontal en `/contacto`** (+153 px a 320 px) | Drawer del carrito fuera de lienzo + formulario ancho | Guarda global (G1) + formulario a una columna → **0 desbordamiento** |

### Footer

| # | Problema (antes) | Solución |
|---|---|---|
| F1 | Footer correcto pero mejorable en móvil | Adaptación pulida: espaciados, márgenes de marca (Luna 3D / Solar 3D), tarjetas sociales a todo el ancho y barra inferior apilada |

### Global

| # | Problema (antes) | Solución |
|---|---|---|
| G1 | Sin protección contra **scroll horizontal** por elementos fuera de lienzo (drawer, megamenú) | `overflow-x: clip` en `html, body` (no rompe `position:sticky`, a diferencia de `overflow:hidden`) |
| G2 | Algunos controles del header bajo el tamaño táctil cómodo | Áreas táctiles llevadas a ≥42 px en móvil |

---

## 4. Verificación (antes → después)

Desbordamiento horizontal medido en vivo a 320 px (negativo = sin scroll horizontal):

| Página | Antes | Después |
|---|---|---|
| Home | sin overflow | sin overflow |
| **Producto** | **+83 px** | **sin overflow** |
| **Contacto** | **+153 px** | **sin overflow** |
| Cuenta | sin overflow | sin overflow |

Comprobaciones adicionales: header a dos filas correcto en 320 y 375 px · selector de apariencia oculto y operativo dentro del menú (probado el cambio de tema) · tablet 768 px limpio · **escritorio 1440 px idéntico al original** · integridad de código: `node --check` OK en todos los `.js`, llaves CSS balanceadas (1367/1367), JS del sitio sin cambios.

---

## 5. Recomendaciones (pendientes, no bloquean)

1. **Arte de banner para móvil.** Los banners del hero son apaisados (proporción 3.73) con texto incrustado, por lo que en celular se ven pequeños inevitablemente. Lo ideal es generar **versiones verticales o cuadradas** del banner para móvil (con `<picture>`/`srcset`). Quedo disponible para implementarlo cuando tengas (o aprobemos) ese arte.
2. **Node 24 en Vercel.** El build avisa que **Node 20.x quedará obsoleto el 2026-10-01**. Conviene actualizar `engines` a `"node": "24.x"` en `package.json` antes de esa fecha (cambio menor, lo puedo hacer y verificar).

---

## 6. Despliegue

Respaldo previo a `_Papelera/`. Cambios aplicados solo en `styles.css`. Validado en *preview* de Vercel en los seis anchos, luego publicado a producción y **verificado en vivo en https://luna3d.cl**. Como no se modificó la vista de escritorio, la publicación directa a producción cumplió tu criterio acordado.
