# Pauta de Fotos y Videos — Web Luna 3D v3

**Estrella 3D SpA · Marca Luna 3D (B2C)**
**Documento interno (Daniel / Claude) · 8 de julio de 2026**

Esta pauta complementa a `Pauta_Fotos_y_Precios_Web_Luna3D_v3_2026-06-12.md` (esa cubría solo
la foto principal por producto). Acá quedan las especificaciones técnicas completas — dimensión,
formato, peso máximo — para **todo** el material audiovisual pendiente: las 3 fotos + 1 video por
producto, y todas las piezas gráficas del sitio (hero, imágenes bajo el hero, posters de galería,
banner de ofertas, y la página Nosotros).

Las medidas de esta pauta **no son inventadas**: se sacaron directamente del código actual del
sitio (`styles.css`, `index.html`, `nosotros.html`) y de las imágenes que ya están cargadas, para
que lo nuevo calce sin distorsión ni recortes raros.

---

## 1. Regla de oro: una sola familia visual

Antes de los números — lo que más importa:

- **Un solo fondo y una sola luz** para las fotos de producto. Blanco/gris claro liso, o negro/gris
  carbón liso — elige uno y úsalo en los ~20 productos, sin mezclar.
- **sRGB siempre.** Sin marcas de agua, sin logos ni texto quemado encima de la foto o el video.
- **WebP como formato preferido** en todo el sitio (mismo detalle visual, hasta 10x menos peso que
  PNG). JPG como alternativa aceptable si exportas directo del celular.
- **Nombra el archivo ANTES de subirlo**, con la convención de cada sección de más abajo — así no
  hay que renombrar todo después.
- **Comprime siempre antes de entregar** (Squoosh, TinyPNG, o la opción "calidad media-alta" al
  exportar del celular).

---

## 2. Producto — 3 fotos + 1 video (ejemplo con un producto)

Uso como ejemplo `maceteros-1` ("Macetero Luna media"), pero **esta misma especificación aplica
igual a los ~20 productos** del catálogo — nada cambia de un producto a otro salvo el nombre del
archivo.

### 2.1 Fotos de producto (3, ideal hasta 4)

La ficha de producto (`producto.html`) tiene 1 foto principal + una grilla de 4 miniaturas, y las
tarjetas del catálogo recortan automáticamente a cuadrado — por eso todo se dispara/exporta
**cuadrado (1:1)**.

| Campo | Especificación |
|---|---|
| Cantidad | 3 fotos (principal + 2 detalle); admite hasta 4 |
| Proporción | **1:1** (cuadrada) |
| Tamaño mínimo | **1600 × 1600 px** |
| Formato | JPG o **WebP** (preferido) |
| Peso máximo | **400 KB** por foto, ya comprimida |
| Color | sRGB, sin marcos ni texto superpuesto |
| Encuadre | Principal: producto centrado, ~80% del cuadro, vista 3/4. Detalle 1: acercamiento a
  textura/capa de impresión. Detalle 2: producto "en contexto" (ej. la planta puesta en el macetero) |
| Producto | Limpio — sin hilos de impresión, polvo ni soportes visibles |

**Nombres de archivo** (usa el ID web del producto):

```
maceteros-1-1.jpg   → foto principal
maceteros-1-2.jpg   → detalle 1
maceteros-1-3.jpg   → detalle 2
maceteros-1-4.jpg   → (opcional) detalle 3 / en contexto
```

### 2.2 Video de producto (1)

| Campo | Especificación |
|---|---|
| Cantidad | 1 video por producto |
| Duración | 6–15 segundos, en loop (giro 360° del producto, o mostrado en uso) |
| Proporción | **1:1** (para ocupar el mismo espacio que las fotos en la ficha) |
| Resolución mínima | 1080 × 1080 px |
| Formato | **MP4 (H.264)** — opcional WebM como respaldo liviano |
| Peso máximo | **8–10 MB** |
| Audio | Sin audio (o silenciado por defecto) |
| Nombre de archivo | `maceteros-1-video.mp4` |

> **Nota técnica importante:** hoy la ficha de producto en la base de datos (Supabase, tabla
> `products`) solo guarda `img` (foto principal) y `gallery` (arreglo de fotos) — el campo para
> video de producto **todavía no existe**. Puedes grabar y preparar los videos igual desde ya; en
> paralelo, cuando quieras activarlos, agrego la columna a la base de datos y a la skill
> `publicar-producto` para que los suba junto con las fotos.

---

## 3. Imágenes del sitio (hero, home, ofertas, Nosotros)

Todas las medidas de esta sección son las que **ya están funcionando en el sitio hoy** — así que
si reemplazas por estas mismas proporciones, no hay que tocar código, solo cambiar el archivo.

### 3.1 Hero — carrusel superior de la portada

Hoy hay 2 slides (`banner_impresiones_utiles.webp`, `banner_maseteros.webp`), a **1713 × 459 px**,
WebP, 50–75 KB cada uno.

| Campo | Especificación |
|---|---|
| Cantidad | 2 o más slides |
| Proporción | **3.73 : 1** (panorámico ancho) |
| Tamaño recomendado | **1713 × 459 px** (o el doble para pantallas retina: 3426 × 918 px) |
| Formato | **WebP** |
| Peso máximo | **200 KB** por slide |
| Nombre de archivo | `banner_<tema>.webp` (ej: `banner_ofertas_julio.webp`) |

### 3.2 Las 3 imágenes bajo el hero ("Top ventas" / "Regalo" / "Oferta de la semana")

Hoy son `promo-best-poster.webp`, `promo-gift-poster.webp`, `promo-offer-poster.webp`, a
**592 × 555 px** (proporción exacta 16:15), 15–30 KB cada una.

| Campo | Especificación |
|---|---|
| Cantidad | 3 (una por tarjeta) |
| Proporción | **16 : 15** (casi cuadrada, apenas más ancha que alta) |
| Tamaño recomendado | **1200 × 1125 px** (mismo 16:15, doble resolución) |
| Formato | **WebP** |
| Peso máximo | **120 KB** por imagen |
| Nombre de archivo | `promo-best-poster.webp` / `promo-gift-poster.webp` / `promo-offer-poster.webp`
  (mismo nombre, reemplaza el archivo actual) |

### 3.3 Posters de la galería home (bloques "Nuevos" / "Más vendidos" / "Regalos")

Hoy son solo fondos de degradado en `styles.css` (`.poster-nuevos`, `.poster-vendidos`,
`.poster-regalos`) — el propio código dice "reemplazable por foto real". Son fotos de ambiente
(producto en contexto/lifestyle), no fondo liso de estudio.

| Campo | Especificación |
|---|---|
| Cantidad | 3 (una por bloque) |
| Proporción | **8 : 5** (paisaje ancho) |
| Tamaño recomendado | **1600 × 1000 px** |
| Formato | **WebP** |
| Peso máximo | **250 KB** por imagen |
| Nombre de archivo | `poster-nuevos.webp` / `poster-vendidos.webp` / `poster-regalos.webp` |

### 3.4 Banner de ofertas ("Promociones de la semana")

Hoy es solo texto + degradado, sin foto. Si quieres ponerle una imagen de fondo:

| Campo | Especificación |
|---|---|
| Cantidad | 1 |
| Proporción | ~3.2 : 1 (franja ancha y baja) |
| Tamaño recomendado | **1600 × 500 px** |
| Formato | **WebP** |
| Peso máximo | **200 KB** |

### 3.5 Página "Nosotros" — hero del taller (video o foto)

El contenedor es **vertical (retrato)** — hay que grabar/fotografiar en vertical, no horizontal, o
se recorta mal. El código ya tiene el `<video>` listo, comentado, esperando el archivo real
(`taller-loop.mp4` / `taller-loop.webm`).

| Campo | Especificación |
|---|---|
| Formato preferido | Video en loop, 10–20 seg, sin audio |
| Proporción | **4:5** (1080×1350) o **9:16** (1080×1920) — vertical |
| Formato de archivo | **MP4 (H.264)** + opcional **WebM** de respaldo |
| Peso máximo | **10 MB** |
| Alternativa (si prefieres foto fija) | Misma proporción vertical, 1600 × 2000 px, WebP, <300 KB |
| Nombre de archivo | `taller-loop.mp4` / `taller-loop.webm` (ya está así en el código) |

### 3.6 Página "Nosotros" — 6 fotos del proceso (paso 1 a 6)

Hoy son 6 placeholders ("Foto pendiente") en la sección de proceso.

| Campo | Especificación |
|---|---|
| Cantidad | 6 (una por paso) |
| Proporción | **4 : 3** (horizontal) |
| Tamaño recomendado | **1200 × 900 px** |
| Formato | **WebP** |
| Peso máximo | **150 KB** por foto |
| Nombre de archivo | `proceso-paso-1.webp` … `proceso-paso-6.webp` |

---

## 4. Tabla resumen (para tener a mano en terreno)

| Elemento | Cantidad | Proporción | Tamaño recomendado | Peso máx | Formato |
|---|---|---|---|---|---|
| Foto de producto (principal + detalle) | 3 (hasta 4) por producto | 1:1 | 1600×1600 px | 400 KB | JPG/WebP |
| Video de producto | 1 por producto | 1:1 | 1080×1080 px | 8–10 MB | MP4 |
| Hero portada (carrusel) | 2+ | 3.73:1 | 1713×459 px (o 3426×918) | 200 KB | WebP |
| 3 imágenes bajo el hero | 3 | 16:15 | 1200×1125 px | 120 KB | WebP |
| Posters galería home | 3 | 8:5 | 1600×1000 px | 250 KB | WebP |
| Banner de ofertas | 1 | ~3.2:1 | 1600×500 px | 200 KB | WebP |
| Hero "Nosotros" (video) | 1 | 4:5 o 9:16 | 1080×1350–1920 px | 10 MB | MP4/WebM |
| Hero "Nosotros" (si es foto) | 1 | 4:5 o 9:16 | 1600×2000 px | 300 KB | WebP |
| Fotos proceso "Nosotros" | 6 | 4:3 | 1200×900 px | 150 KB | WebP |

---

## 5. Pendiente de decisión (para cuando retomemos)

- **Video de producto:** confirmar si lo activamos ahora en la base de datos/skill, o se prepara
  el material y se conecta más adelante.
- **Fondo de estudio:** definir UNA vez el fondo (claro u oscuro) para que quede fijo en las ~20
  fichas de producto.
- **Posters de galería y banner de ofertas:** hoy son diseño con degradado; confirmar si se
  reemplazan por foto real o se mantienen como diseño (no es obligatorio cambiarlos).
