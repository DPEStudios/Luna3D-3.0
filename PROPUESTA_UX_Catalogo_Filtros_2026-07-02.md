# Propuesta UX — Catálogo Luna 3D (Ordenar, filtros y texto redundante)

**Fecha:** 2 de julio de 2026
**Alcance revisado:** `catalogo.html`, `styles.css` (bloque `.catalog-*`, `.sortsel`, `.filter-*`), `catalog.js`
**Preparado para:** Daniel Pardo — Estrella 3D SpA

Revisé el código real de la página de catálogo (no una captura) para que el diagnóstico y la propuesta calcen exactamente con lo que hoy está desplegado y con el sistema de diseño existente (tokens de `:root` en `styles.css`: paleta Aurora Lunar, tipografías Space Grotesk / Manrope / Space Mono, superficies "glass").

---

## 1. Selector "Ordenar por": diagnóstico del problema de contraste

El selector está definido así en `styles.css` (línea 818):

```css
.sortsel select{background:var(--glass);border:1px solid var(--line);border-radius:11px;color:var(--star);padding:10px 14px;font-size:14px;cursor:pointer;}
```

El problema no es el selector cerrado —ese sí se ve bien, texto casi blanco (`--star: #F5F6FB`) sobre fondo glass oscuro—. El problema es la **lista desplegable de opciones** (`<option>`), que no tiene ningún estilo propio en todo el archivo. Cuando el navegador abre esa lista, no respeta el fondo "glass" translúcido (los navegadores renderizan el panel de opciones nativo con colores de sistema, casi siempre fondo claro), pero sí hereda el color de texto casi blanco del `<select>`. Resultado: texto casi blanco sobre un panel casi blanco → exactamente el problema que describes ("las opciones casi no se leen"). Es un bug clásico de `<select>` nativo en sitios con tema oscuro, no un error de diseño visual.

### Solución propuesta

Recomiendo resolverlo en dos capas, sin salir del sistema de tokens existente:

**Capa 1 — fix mínimo y robusto (soluciona el problema hoy, en todos los navegadores):**

```css
.sortsel select{
  background:var(--navy-800);
  border:1px solid var(--line);
  border-radius:11px;
  color:var(--star);
  padding:10px 34px 10px 14px;
  font-size:14px;
  cursor:pointer;
  color-scheme:dark;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A93B6' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat:no-repeat;
  background-position:right 14px center;
}
.sortsel select option{
  background:var(--navy-800);
  color:var(--star);
}
.sortsel select:focus{outline:none;border-color:var(--magenta);}
body.light-mode .sortsel select{background:#fff;color:var(--navy-800);color-scheme:light;}
body.light-mode .sortsel select option{background:#fff;color:var(--navy-800);}
```

Puntos clave del fix:
- `background:var(--navy-800)` en vez de `var(--glass)` porque el translúcido no se puede sostener dentro de un `<option>` nativo — necesita un color sólido para garantizar contraste.
- `color-scheme:dark` le indica al navegador que use su UI nativa de tema oscuro para scrollbars y controles del `<select>`, en vez de asumir claro por defecto.
- Estilo explícito en `option` (Chrome, Edge y Firefox sí lo respetan, a diferencia del fondo translúcido).
- Se agrega la variante `body.light-mode` porque vi que el sitio ya tiene modo claro implementado (línea 2684 y otras) pero el selector no tenía ninguna regla condicional — quedaría roto también ahí si no se cubre.
- Reemplacé la flecha nativa del navegador (que en varios navegadores también hereda mal el color) por un chevron SVG propio en `var(--muted)`, coherente con el resto de iconografía del sitio.

**Capa 2 — opcional, más "premium":** si más adelante quieres que el propio panel de opciones tenga blur/glass real (no solo el trigger), la única forma confiable entre navegadores es reemplazar el `<select>` nativo por un dropdown custom (botón + lista `<ul>` propia, con `position:absolute` y el mismo `.glass` que ya usas en `.filter-chips`). Lo dejo como mejora de fase 2 porque el fix de Capa 1 ya resuelve el problema de legibilidad reportado con cero riesgo y cero JS nuevo.

---

## 2. Eliminar "Catálogo Luna3D"

Es el `<span class="kicker">Catálogo Luna3D</span>` en la línea 49 de `catalogo.html`, justo antes del `<h1>Todo el catálogo</h1>`. Coincido en que es redundante: el `<title>`, el breadcrumb implícito de navegación y el propio `<h1>` ya comunican dónde está el usuario.

Cambio propuesto: eliminar ese `<span>` completo. El `<h1>` queda como primer elemento visible del bloque, con el mismo `margin-top` que ya trae de `.catalog-head h1`, así que no se necesita ningún ajuste adicional de espaciado — el layout no se rompe al sacarlo.

Si en algún momento quieres mantener una señal de contexto ahí (por ejemplo, para SEO/jerarquía visual), la alternativa más útil no es un texto decorativo sino un breadcrumb funcional (`Inicio / Catálogo`), pero no lo agregaría a menos que lo pidas explícitamente — por ahora, quitarlo y dejar el `<h1>` solo es lo más limpio.

---

## 3. Rediseño del sistema de filtros

### Qué hay hoy

`.filters` es una columna lateral fija de 248px (`grid-template-columns:248px 1fr`), sticky, con dos grupos siempre expandidos: **Categorías** y **Precio**, cada uno como lista vertical de botones (`.filter-chips`, `flex-direction:column`). En móvil colapsa a un drawer (`.filters.open`), lo cual ya está bien resuelto. El problema que describes es específico de desktop: la columna ocupa espacio fijo todo el tiempo, incluso cuando el usuario no está filtrando, y crece verticalmente sin límite a medida que se agregan categorías, subcategorías (ya inyectadas dinámicamente por `catalog.js`) y rangos de precio.

### Propuesta: filtros compactos por popover, no por columna fija

Reemplazar la columna lateral persistente por una **barra horizontal de filtros** encima de la grilla de productos (donde hoy vive `.chiprow` de colecciones), con un botón por grupo de filtro que abre un popover compacto al hacer clic:

```
[ Categoría ▾ ]  [ Precio ▾ ]  [ Material ▾ ]  [ Ordenar: Relevancia ▾ ]
```

Ventajas concretas sobre el layout actual:
- Recupera los 248px que hoy están permanentemente ocupados por la columna, dándoselos a la grilla de productos (más productos visibles por fila en pantallas medianas).
- Escala mejor: agregar un filtro nuevo (Material, y los que propongo en la sección 4) es agregar un botón más a la fila, no una columna que crece sin fin.
- Unifica el patrón visual: hoy tienes dos sistemas de filtro conviviendo (`.filter-chips` vertical en la columna + `.chiprow` horizontal para colecciones); con este cambio todo el catálogo usa un solo lenguaje visual.
- El estado activo se resume con **chips debajo de la barra** ("Categoría: Decoración ✕", "Precio: $6.000–$12.000 ✕") + un link "Limpiar todo" — así el usuario ve de un vistazo qué está filtrando sin tener que reabrir cada popover, y puede quitar un filtro con un clic sin perder los demás.

Implementación con lo que ya existe en el sistema de diseño: cada popover reutiliza `.glass` + `border-radius` + `--blur` que ya están definidos como tokens, y las opciones dentro del popover pueden ser los mismos botones `.filter-chips button` que ya tienes, solo que ahora viven dentro de un panel flotante en vez de una columna fija. Es decir: no es una librería nueva ni un patrón ajeno al sitio, es reorganizar los mismos componentes en un contenedor distinto.

En móvil, el botón "Filtros" (`#filter-toggle`) que ya existe se mantiene igual — sigue abriendo el drawer de siempre — porque en pantallas angostas el popover-por-grupo no aporta (no hay espacio horizontal para una barra de botones).

### Filtro de Precio: rangos solicitados

Buena noticia: los tres rangos que pediste ya existen tal cual en `catalog.js` (línea 22-26):

- Hasta $6.000 → `p.price<6000`
- $6.000 a $12.000 → `>=6000 && <12000`
- Más de $12.000 → `>=12000`

No hay que crearlos, solo migrarlos del `.filter-chips` vertical al popover "Precio ▾" propuesto arriba.

Lo que sí falta y pediste explícitamente es el **precio mínimo/máximo personalizado**. Propongo agregarlo como segunda sección dentro del mismo popover "Precio", debajo de los tres botones de rango:

```
Precio
○ Hasta $6.000
○ $6.000 – $12.000
○ Más de $12.000
──────────────
Rango personalizado
[ Mín. $ ____ ]   [ Máx. $ ____ ]     [Aplicar]
```

Funcionalmente, seleccionar un rango predefinido y escribir un rango personalizado deberían ser mutuamente excluyentes (elegir uno limpia el otro), para que `state.price` en `catalog.js` no reciba dos criterios contradictorios a la vez. Es un cambio pequeño en el mismo archivo: agregar dos inputs numéricos y una función de filtro nueva (`test:p=>p.price>=min&&p.price<=max`), sin tocar la arquitectura de datos.

### Filtro de Material

Aquí hay una dependencia que vale la pena que sepas antes de que lo pidamos como "listo para mañana": revisé `catalogData.js` (la capa que trae los productos desde Supabase) y **hoy el material no es un campo estructurado del catálogo** — solo aparece como texto libre dentro de las especificaciones de la ficha de producto individual (`{k:'Material', v:'PLA+ premium'}` en `data.js`). Para poder filtrar por material en la grilla completa, primero hay que:

1. Agregar una columna `material` (o normalizar los valores existentes) en la tabla de productos de Supabase.
2. Exponerla en la vista pública `products_public` que ya consume `catalogData.js`.
3. Recién ahí se puede armar el popover "Material ▾" con las opciones reales (PLA+, PETG, resina, etc.) siguiendo el mismo patrón que "Precio".

No es un bloqueador grande, pero es trabajo de datos antes que de UI — te lo marco para que no se planifique como si fuera solo CSS.

---

## 4. Lluvia de ideas: filtros adicionales por tipo de producto

Pensando en tus cuatro categorías objetivo (regalos, decoración, funcionales, coleccionables) y priorizando lo que más mueve la aguja en conversión — no cantidad de filtros por agregar cantidad—, los agrupo por impacto esperado:

**Alto impacto en conversión (recomendado agregar primero):**

- **Ocasión / para quién es el regalo** (cumpleaños, aniversario, día de la madre/padre, "para él", "para ella", "para niños", "para mascota"): en categoría regalos, este es históricamente el filtro que más reduce fricción de decisión — el usuario no busca "un producto", busca "algo para mi mamá".
- **Disponibilidad inmediata / stock**: un chip "Disponible ahora" filtra fuera lo que tiene tiempo de espera largo, evita frustración en checkout.
- **Más vendidos / Novedades** como chips rápidos arriba de la grilla (no solo dentro de "Ordenar"), porque funcionan como atajo de confianza social sin que el usuario tenga que pensar en criterios.
- **Licencia / franquicia** para coleccionables (anime, videojuegos, películas, series): es el criterio de búsqueda #1 de quien compra figuras coleccionables — hoy solo existe si está modelado como subcategoría; vale la pena confirmar que esté visible como filtro propio y no escondido dentro de "Categoría".

**Impacto medio (buenos para fase 2):**

- **Color** (si aplica a piezas donde el color es decisión estética, no solo el material).
- **Tamaño** (pequeño / mediano / grande, o dimensiones en cm) — relevante en decoración y funcionales, donde el espacio disponible en la casa condiciona la compra.
- **Personalizable** (con nombre grabado, texto custom): diferenciador fuerte para regalos, y ya es un producto que impresión 3D resuelve naturalmente.
- **Uso / ambiente** (escritorio, cocina, velador, jardín): ayuda en decoración y funcionales a que el usuario proyecte el producto en su espacio.
- **En oferta / descuento activo.**

**Impacto bajo o nice-to-have (no priorizar todavía):**

- Material eco/reciclado como filtro de sostenibilidad (útil como mensaje de marca, pero bajo volumen de búsqueda real salvo que tu audiencia lo pida).
- Tiempo de impresión / fabricación bajo pedido vs. stock — más relevante como información en la ficha de producto que como filtro de catálogo.

Mi recomendación concreta: de esta lista, empezaría por **Ocasión/destinatario** y **Licencia/franquicia**, porque son los dos que en catálogos de regalos y coleccionables típicamente más mueven la tasa de conversión, y porque probablemente ya tienes esa información implícita en el nombre o la subcategoría de varios productos — se podría lanzar una primera versión sin esperar cambios de base de datos, curando manualmente las franquicias/ocasiones más frecuentes como un nuevo grupo de chips, igual que hoy haces con "Colecciones".

---

## Resumen de próximos pasos

| Ítem | Esfuerzo | Bloqueadores |
|---|---|---|
| Fix contraste selector Ordenar | Bajo — solo CSS | Ninguno |
| Quitar "Catálogo Luna3D" | Trivial — una línea en HTML | Ninguno |
| Migrar Categoría/Precio a popovers horizontales | Medio — CSS + reestructurar `catalog.js` | Ninguno |
| Rango de precio personalizado (mín/máx) | Bajo-medio — 2 inputs + lógica de filtro | Ninguno |
| Filtro por Material | Medio | Requiere columna `material` en Supabase |
| Filtro Ocasión/destinatario | Medio | Ninguno (curado manual, como Colecciones) |
| Filtro Licencia/franquicia | Medio | Ninguno si ya existe en subcategoría; si no, curado manual |

Quedo atento a qué prioricemos primero — el fix del selector y quitar el texto redundante los puedo dejar implementados hoy mismo si me das luz verde.
