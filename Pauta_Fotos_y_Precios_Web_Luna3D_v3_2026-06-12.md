# Pauta de Fotos y Precios — Web Luna 3D v3

**Estrella 3D SpA · Marca Luna 3D (B2C)**
**Sesión 2 · 12 de junio de 2026 · Documento interno (Daniel / Claude)**

Esta pauta prepara la **Sesión 3 (carga de contenido real)**. La estructura del catálogo
ya quedó lista en la web con 5 categorías reales y 20 espacios (slots) de producto.
Tu trabajo en paralelo es entregar, para cada slot: **nombre real, foto y precio**.
Mientras no haya precio, la web muestra "Precio a confirmar" y desactiva el botón de compra,
así que nada se vende a medias.

---

## 1. Qué necesito de ti (resumen)

- **20 productos** = 5 categorías × 4 espacios.
- Por cada producto: **1 foto principal** (obligatoria) + hasta 3 fotos de detalle (opcional),
  un **nombre real** y un **precio**.
- Plazo: **antes de la Sesión 3** (carga de contenido). Si alcanzas menos de 20, cargamos los que estén:
  el catálogo funciona con cualquier cantidad.

---

## 2. Categorías y productos a capturar (20 espacios)

La columna **ID web** es el identificador interno en `data.js`: sirve para nombrar las fotos
y para que yo cargue cada producto en su lugar exacto.

| # | Categoría | ID web | Nombre actual (placeholder) | Marca | Nombre real (defínelo tú) |
|---|-----------|--------|------------------------------|-------|----------------------------|
| 1 | Maceteros y jardín | `maceteros-1` | Macetero 1 | ⭐ Destacado | |
| 2 | Maceteros y jardín | `maceteros-2` | Macetero 2 | ⭐ Destacado | |
| 3 | Maceteros y jardín | `maceteros-3` | Macetero 3 | 🆕 Nuevo | |
| 4 | Maceteros y jardín | `maceteros-4` | Macetero 4 | — | |
| 5 | Decoración hogar | `decoracion-1` | Decoración 1 | ⭐ Destacado | |
| 6 | Decoración hogar | `decoracion-2` | Decoración 2 | 🆕 Nuevo | |
| 7 | Decoración hogar | `decoracion-3` | Decoración 3 | — | |
| 8 | Decoración hogar | `decoracion-4` | Decoración 4 | — | |
| 9 | Llaveros y accesorios | `llaveros-1` | Llavero 1 | ⭐ Destacado | |
| 10 | Llaveros y accesorios | `llaveros-2` | Llavero 2 | — | |
| 11 | Llaveros y accesorios | `llaveros-3` | Llavero 3 | — | |
| 12 | Llaveros y accesorios | `llaveros-4` | Llavero 4 | — | |
| 13 | Cultura pop y coleccionables | `cultura-pop-1` | Coleccionable 1 | ⭐ Destacado | |
| 14 | Cultura pop y coleccionables | `cultura-pop-2` | Coleccionable 2 | 🆕 Nuevo | |
| 15 | Cultura pop y coleccionables | `cultura-pop-3` | Coleccionable 3 | — | |
| 16 | Cultura pop y coleccionables | `cultura-pop-4` | Coleccionable 4 | — | |
| 17 | Organización y oficina | `oficina-1` | Organizador 1 | ⭐ Destacado | |
| 18 | Organización y oficina | `oficina-2` | Organizador 2 | — | |
| 19 | Organización y oficina | `oficina-3` | Organizador 3 | — | |
| 20 | Organización y oficina | `oficina-4` | Organizador 4 | — | |

Los **⭐ Destacados** aparecen en la portada (carrusel y franja de inicio) y los **🆕 Nuevos**
en la sección de novedades. Son marcas editables: si prefieres destacar otros productos, lo ajustamos.

---

## 3. Pauta de fotografía

El objetivo es que las 20 fotos se vean como una **familia**: mismo fondo, misma luz, mismo encuadre.
La consistencia importa más que el equipo: un celular con buena luz natural basta.

### Fondo
- **Liso y uniforme**, sin distracciones. Dos opciones, elige UNA y úsala en todas:
  - **A (recomendado):** fondo **claro neutro** (blanco o gris muy claro) → fichas limpias y luminosas.
  - **B:** fondo **oscuro liso** (negro/gris carbón) → combina con la estética espacial de la marca.
- Usa una cartulina o tela sin arrugas que suba por detrás (fondo "infinito"), sin líneas ni objetos.

### Iluminación
- **Luz difusa**, nunca flash directo. Luz de ventana de día (sin sol directo) o una lámpara con difusor.
- Evita **sombras duras** y reflejos fuertes; si hay brillos, suaviza con una cartulina blanca como rebote.
- Misma hora / misma luz para toda la tanda, para que los colores no varíen entre fotos.

### Encuadre y ángulos
- **Foto principal: cuadrada (1:1)**, producto centrado, ocupando ~80% del cuadro, vista en 3/4 (ligeramente de arriba).
- **Fotos de detalle (opcionales):** acercamiento a la textura/capa de impresión, vista lateral, y el producto "en contexto" (la planta en el macetero, el llavero en una mochila, etc.).
- Producto **limpio**: sin hilos de impresión, polvo ni soportes visibles.

### Formato técnico
- **Proporción 1:1** (cuadrada). La web recorta a cuadrado, así que dispara o recorta cuadrado.
- **Tamaño:** mínimo **1600 × 1600 px**.
- **Formato:** **JPG** o **WebP**. **Peso < 400 KB** por foto (comprime sin que se note).
- **Color:** sRGB. No le pongas marcos, textos ni logos encima.

### Nombres de archivo (importante — calza con la web)
Nombra cada archivo con el **ID web** del producto + número de foto:

```
<ID web>-1.jpg   → foto principal   (ej: maceteros-1-1.jpg)
<ID web>-2.jpg   → detalle 1         (ej: maceteros-1-2.jpg)
<ID web>-3.jpg   → detalle 2
```

Guárdalas todas en una carpeta **`fotos_sesion3/`** (yo creo la carpeta definitiva `assets/productos/` al cargarlas).
Con ese nombre, conectar cada foto a su producto en la web es automático.

### Cuántas fotos
- **Mínimo:** 1 principal por producto (20 fotos).
- **Ideal:** principal + 1–3 detalles por producto.

---

## 4. Pauta de precios

### De dónde sale el costo
Usa el **Excel maestro** de Estrella 3D para no inventar precios:
`01_Estrella3D/Finanzas/00_Control_Financiero/Estrella3D_Maestro.xlsx`
→ hoja **🧮 Calculadora_Costo** (costo unitario: material + energía + depreciación + % de falla)
→ hoja **📦 Productos** (catálogo de costos).
También puedes pedirme el costo con la skill de finanzas (`estrella-3d-finanzas`).

### Margen y redondeo
- Define un **margen objetivo** por producto (ej: 60–70% sobre costo, o el que uses en el Excel).
- Considera la **comisión del canal** (hoja 🛒 Canales) si vendes por Mercado Libre / redes.
- Redondea el precio final a una cifra "comercial" (terminada en **$90 o $990**, ej: $5.990).

### Plantilla a llenar
Completa una fila por producto y me la pasas (o la dejas en el Excel):

| ID web | Nombre real | Costo $ (Excel) | Margen % | Precio sugerido $ | **Precio final $** |
|--------|-------------|-----------------|----------|-------------------|--------------------|
| `maceteros-1` | | | | | |
| `maceteros-2` | | | | | |
| `maceteros-3` | | | | | |
| `maceteros-4` | | | | | |
| `decoracion-1` | | | | | |
| … (resto de los 20) | | | | | |

---

## 5. Cómo se carga en la web (lo hago yo en la Sesión 3)

Cada producto es un registro en `data.js`. Con tu foto + nombre + precio, lo dejo así:

```js
{
  id: "maceteros-1",
  name: "Macetero Luna media",            // tu nombre real
  price: 7990,                              // tu precio final (número, sin puntos)
  img: "assets/productos/maceteros-1-1.jpg",// tu foto principal
  tag: "Nuevo",                             // o null
  featured: true,                           // ⭐ aparece en portada
  colors: null,                             // o lista de colores reales de filamento
  sizes: null,                              // o ["Chico","Mediano","Grande"]
  desc: null                                // o una descripción real del producto
}
```

- **Colores / acabados:** si quieres ofrecer variantes, dime los **colores reales de filamento** que tienes en stock (por producto o generales). Si no, la web usa la paleta de marca por defecto.
- **Tamaños:** si un producto viene en varios tamaños, indícalos; si no, queda "Único".

---

## 6. Checklist antes de la Sesión 3

- [ ] Fondo y luz elegidos y usados igual en toda la tanda.
- [ ] 1 foto principal cuadrada por producto (ideal + detalles).
- [ ] Fotos nombradas con el ID web (`maceteros-1-1.jpg`, …) en `fotos_sesion3/`.
- [ ] Nombre real de cada producto.
- [ ] Precio final de cada producto (desde el Excel maestro).
- [ ] (Opcional) Colores y tamaños reales por producto.

Con esto, la Sesión 3 es "rellenar": cargo los 20 productos reales y el catálogo queda navegable de verdad.
