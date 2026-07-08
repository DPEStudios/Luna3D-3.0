# Propuesta estratégica — Página "Sobre Nosotros" Luna 3D

**Fecha:** 2026-06-25 · **Archivo objetivo:** `nosotros.html` + bloque CSS `.about-page` en `styles.css`
**Autor:** Asesoría UX / UI / Marketing / Copy / Ecommerce
**Para:** Daniel Pardo

---

## 0. Diagnóstico de fondo (leer primero)

Antes de los cinco puntos, una observación que condiciona todo lo demás:

**Hoy la página vende lo contrario a lo que quieres comunicar.** El `nosotros.html` actual está construido alrededor de un solo concepto —"fabricamos a pedido y hacemos diseños personalizados"— y lo repite en el Hero, en "Nuestra Historia" y en las tarjetas de valor. Frases textuales actuales:

- Hero: *"cada pieza se imprime cuando la pides"*.
- Historia: *"colores a elección y diseños personalizados… Si tienes una idea propia, también la fabricamos"*.
- Tarjeta 1: *"Hecho a pedido — Imprimimos tu pieza cuando la pides"*.

Tú quieres dejar de transmitir "diseños personalizados" y, en cambio, comunicar **catálogo vivo, productos decorativos atractivos, regalos originales, objetos funcionales, fechas especiales, tendencias, calidad de impresión y buenas terminaciones**. Eso no es un ajuste de copy: es un **cambio de posicionamiento**. Pasamos de vender *"un taller que fabrica lo que imagines"* a vender *"una tienda con un catálogo curado, fresco y bien hecho"*.

Implicancia estratégica clave (mi recomendación): conserva la idea de **calidad y cuidado pieza por pieza** —es tu mejor activo de confianza— pero **elimina del mensaje el "trae tu idea / personalizado"**. El "hecho a pedido" puede mantenerse, pero degradado: ya no es el héroe del relato, sino una nota de respaldo (explica por qué hay variedad de colores y por qué cuidas la calidad), nunca una invitación a encargar diseños propios.

**Decisión que necesito de ti** (la dejo planteada, no bloquea el resto): ¿quieres conservar la mención "se imprime cuando lo pides" como argumento de frescura/variedad, o eliminarla por completo para que nadie infiera encargos personalizados? Mi recomendación: conservarla en letra chica, reformulada como *"sumamos productos nuevos seguido"*, sin la palabra "personalizado" en ninguna parte.

---

## 1. Aire visual: el contenido está pegado al header

**Causa real (no es percepción tuya, es un bug de espaciado).** En `styles.css`:

- El nav está fijo: `--nav-h: 74px` (y en móvil sube a `118px`).
- El primer bloque de la página usa `section.block{ padding: 80px 0; }` **sin compensar el nav fijo**.

Otras páginas del sitio sí compensan ese nav: el home usa `padding: calc(var(--nav-h) + 70px)`, catálogo `calc(var(--nav-h) + 56px)` y producto `calc(var(--nav-h) + 34px)`. La página Nosotros quedó fuera de ese patrón, por eso "se pega". El header de 74px se come casi todo el aire de 80px.

**Fix recomendado (concreto y atómico):**

```css
/* Aire bajo el header en páginas institucionales: el primer bloque respeta el nav fijo.
   Unifica el patrón ya usado en home/catálogo/producto. */
.about-page > .block:first-of-type{
  padding-top: calc(var(--nav-h) + 48px);   /* hoy: 80px sin compensar 74px de nav */
}
@media (max-width: 720px){
  .about-page > .block:first-of-type{
    padding-top: calc(var(--nav-h) + 28px);  /* nav móvil = 118px */
  }
}
```

Esto baja toda la sección ~48px (desktop) por debajo del header y da el respiro que buscas, **sin tocar el resto de los bloques** ni romper el ritmo de 8px de la marca. Es el cambio más barato y de mayor impacto inmediato de toda la lista.

---

## 2. Reemplazar la imagen lateral por un bloque visual animado (+10%)

### 2.1 Recomendación técnica: video en loop, no GIF

Pediste un GIF; como experto te recomiendo **un `<video>` en bucle en vez de un GIF**, por tres razones de ecommerce:

1. **Peso.** Un GIF de taller con 4 escenas pesa fácil 8–15 MB. El mismo clip en `.webm`/`.mp4` pesa 0,5–1,5 MB. En una página de confianza, un GIF pesado retrasa la carga y juega en contra justo donde quieres generar credibilidad.
2. **Calidad.** El GIF está limitado a 256 colores → bandeo y suciedad sobre tu fondo navy. El video conserva el degradado y el detalle de la impresión.
3. **Accesibilidad.** El video respeta `prefers-reduced-motion` (puedes pausarlo) y permite `poster` (primer cuadro nítido mientras carga). Tu `styles.css` ya maneja `prefers-reduced-motion` en varios lugares; sería coherente.

Si prefieres mantener GIF por simplicidad de edición, optimízalo: máx. ~800px de ancho, 12–15 fps, < 3 MB.

### 2.2 Contenido del clip (8–14 s en loop, sin audio)

Cuatro escenas cortas encadenadas, en este orden narrativo:

1. **Impresión 3D** — timelapse de la pieza creciendo capa a capa (la toma más hipnótica, va primero).
2. **Preparación del pedido** — manos seleccionando/organizando piezas.
3. **Empaque** — la pieza protegiéndose para el viaje.
4. **Plano del taller** — una panorámica corta del espacio real trabajando.

Tip de producción: grábalo con la estética de marca (fondos oscuros, luz lateral, acento magenta/violeta) para que combine con el `:root` dark-first. Un clip vertical/retrato funciona mejor en este Hero porque la columna es alta.

### 2.3 Aumentar ~10% el bloque visual

Hoy: `.about-hero{ grid-template-columns: 1.05fr .95fr; }` (el texto pesa más que el media) y `.media-ph-portrait{ min-height: 380px; }`.

```css
/* Más peso y altura al bloque visual (~+10%) */
.about-hero{ grid-template-columns: 1fr 1.05fr; gap: 44px; }   /* invierte el peso hacia el media */
.media-ph-portrait,
.about-hero-media video{ min-height: 420px; }                  /* 380 → 420 ≈ +11% */
.about-hero-media video{
  width: 100%; height: 100%; object-fit: cover; border-radius: 16px;
  display: block;
}
```

HTML del media (reemplaza el placeholder actual dentro de `.about-hero-media`):

```html
<div class="about-hero-media">
  <video class="about-loop" autoplay muted loop playsinline
         poster="assets/taller-poster.webp" aria-label="Taller Luna 3D en funcionamiento">
    <source src="assets/taller-loop.webm" type="video/webm">
    <source src="assets/taller-loop.mp4"  type="video/mp4">
  </video>
</div>
```

> Nota: mientras no tengas el clip real, el placeholder actual sirve. Lo más valioso para la conversión de toda esta página es **reemplazar los placeholders por medios reales** —hoy hay 9 placeholders "pendiente" visibles, lo que resta credibilidad. El video del Hero es el primero que conviene producir.

---

## 3. Replantear el mensaje principal (varias propuestas de copy)

**Objetivo del nuevo mensaje:** comunicar catálogo vivo + decoración + regalos + funcionales + fechas especiales + tendencias + calidad + terminaciones. **Cero "personalizado".**

Te dejo 5 ángulos distintos para el Hero (kicker + título + bajada). Puedes elegir uno o mezclar título de uno con bajada de otro.

### Opción A — Catálogo fresco / siempre algo nuevo *(mi recomendada)*
> **Kicker:** Decoración y regalos en 3D · Hecho en Chile
> **Título:** Piezas con estilo para tu hogar, listas para sorprender
> **Bajada:** Luna 3D es una tienda chilena de impresión 3D con catálogo en constante movimiento: decoración llamativa, regalos originales y objetos funcionales, con novedades y tendencias sumándose seguido —y una calidad de impresión y terminaciones que se notan.

### Opción B — Decoración + regalos con personalidad
> **Kicker:** Sobre Luna 3D
> **Título:** Decora, regala y resuelve con piezas que tienen personalidad
> **Bajada:** Diseños 3D pensados para verse bien y durar. Decoración, regalos originales, objetos útiles y ediciones para fechas especiales —siempre con un catálogo que se renueva y terminaciones cuidadas pieza por pieza.

### Opción C — Calidad / oficio (craft)
> **Kicker:** Impresión 3D · Hecho en Chile
> **Título:** Impresión 3D bien hecha, para tu casa y para regalar
> **Bajada:** Cuidamos cada capa y cada terminación. Encuentra decoración con estilo, regalos originales y objetos funcionales con un acabado prolijo, en un catálogo que crece y sigue las tendencias del momento.

### Opción D — Tendencias
> **Kicker:** Lo que está de moda, impreso en 3D
> **Título:** Las tendencias del momento, en tu espacio
> **Bajada:** Seguimos lo que está de moda y lo llevamos a tu hogar: decoración que llama la atención, regalos con onda y piezas funcionales. Catálogo en constante actualización, con impresión de alta resolución y terminaciones que marcan la diferencia.

### Opción E — Cercano / emocional
> **Kicker:** Somos Luna 3D
> **Título:** Objetos que no sabías que necesitabas
> **Bajada:** Marca chilena de impresión 3D. Diseñamos y fabricamos decoración, regalos y cosas útiles con buena terminación, sumando productos nuevos y ediciones especiales durante todo el año. Lindos de tener, fáciles de regalar.

### Microcopy de apoyo (sirve para cualquier opción)
- **Botón primario:** "Ver catálogo" → `catalogo.html`
- **Botón secundario:** "Novedades" (ancla a la sección de nuevos productos) en vez del actual "Ver cómo lo hacemos" (que refuerza el relato de proceso/encargo).
- **Cinta de atributos bajo el Hero** (chips en Space Mono, coherente con tu iconografía): `Catálogo que se renueva · Despacho a todo Chile · Pago seguro · Garantía de fabricación`.

---

## 4. Reemplazo de "Nuestra Historia" — lluvia de ideas completa

La sección actual ("De una idea a tu espacio" + 3 tarjetas: Hecho a pedido / Garantía / Despacho) está, como dices, desaprovechada: es texto de relato + dos datos de confianza sueltos (garantía, envío) mezclados con el mensaje "a pedido" que quieres eliminar. Propuesta: **disolver la sección "Historia" y repartir su valor real en bloques con función clara**. Aquí el menú completo de bloques candidatos, ordenados por impacto en conversión.

### Bloque 1 — "Qué encuentras en Luna 3D" *(reemplazo directo, alta prioridad)*
Cuatro pilares en tarjetas, calcados de tu lista de objetivos. Sustituye las 3 value-cards actuales y reorienta el mensaje al producto:

- **Decoración con estilo** — piezas que le dan carácter a tu espacio.
- **Regalos originales** — para sorprender sin gastar de más.
- **Objetos funcionales** — soluciones útiles para el día a día.
- **Ediciones de temporada** — productos pensados para cada fecha especial.

### Bloque 2 — "Siempre algo nuevo" / Tendencias *(prueba de catálogo vivo, alta prioridad)*
Carrusel o grilla con los últimos productos publicados + badge "NUEVO". Es la **demostración** de que el catálogo se actualiza (mucho más creíble que afirmarlo en texto). CTA: "Ver todas las novedades". Refuerza dos de tus pilares de un golpe: catálogo actualizado + tendencias.

### Bloque 3 — "Por qué se ve y se siente bien" *(calidad + terminaciones, alta prioridad)*
Tres micro-argumentos con fotos macro (acercamientos reales):
- **Alta resolución** — capas finas, superficies parejas.
- **Terminación cuidada** — sin rebabas, bordes limpios, lista para usar.
- **Materiales que rinden** — PLA y PETG según el producto, explicado simple.
Aquí puedes **integrar una versión recortada del proceso** (ver punto 5) en lugar de los 7 pasos actuales.

### Bloque 4 — "Para cada ocasión" *(estacionalidad / regalos, media-alta)*
Grilla de fechas que enlaza a colecciones del catálogo: Día de la Madre, Día del Padre, Navidad, San Valentín, Amigo Secreto, Cumpleaños. Captura intención de compra por ocasión y es tu argumento de "fechas especiales" hecho navegable.

### Bloque 5 — "Compra con confianza" *(banda de confianza, alta prioridad)*
Recupera y ordena lo que hoy está suelto (garantía, envío) y súmale más señales:
- **Garantía de fabricación** — si llega con defecto, se reimprime o se devuelve.
- **Pago seguro** — MercadoPago.
- **Despacho a todo Chile** — con código de seguimiento.
- **Atención cercana** — respondemos rápido por WhatsApp.

### Bloque 6 — "Lo que dicen quienes ya compraron" *(prueba social, alta prioridad)*
Hoy **no hay ni un testimonio en toda la página**, y es el mayor vacío de conversión. 3–6 reseñas reales (nombre + comuna + foto del producto recibido). Si aún no tienes volumen, parte con 2–3 reales; nunca inventadas.

### Bloque 7 — "Síguenos en Instagram" *(comunidad / UGC, media)*
Feed o grilla de fotos reales de productos/clientes. Da vida, prueba social y frescura, y aporta tráfico social.

### Bloque 8 — "Luna 3D en números" *(opcional, media-baja)*
Solo si los números acompañan: productos en catálogo, comunas con despacho, colores disponibles, novedades al mes. Si las cifras son chicas, mejor omitir.

### Bloque 9 — Mini-relato condensado *(opcional)*
Si quieres conservar algo del alma de marca, redúcelo a **dos frases** dentro de otro bloque (p. ej., al pie de "Por qué se ve y se siente bien"), no a una sección entera:
> *"Somos una marca chilena, cercana y creativa. Detrás de cada envío hay una persona revisando que la pieza salga como corresponde."*

### Bloque 10 — FAQ corto *(opcional, alta utilidad)*
4–6 preguntas que destraban la compra: ¿cuánto demora?, ¿hacen envíos a mi comuna?, ¿qué pasa si llega con defecto?, ¿qué materiales usan?, ¿puedo elegir color? Reduce fricción y dudas pre-compra.

> **Mi combinación recomendada para reemplazar "Historia":** Bloque 1 ("Qué encuentras") + Bloque 5 ("Compra con confianza") como reemplazo inmediato; y sumar Bloque 2 (Novedades) y Bloque 6 (Reseñas) más abajo. Esos cuatro convierten una sección de relato pasiva en cuatro secciones que venden.

---

## 5. Blueprint completo de la página (estratégico, sección por sección)

Reordenamiento propuesto del `nosotros.html`, pensado para que se vea profesional, genere confianza y convierta. Cada sección con su **propósito** y **qué debe contener**.

| # | Sección | Propósito | Qué debe contener |
|---|---------|-----------|-------------------|
| 1 | **Hero reposicionado** | Decir en 3 segundos qué es Luna 3D y por qué importa | Copy del punto 3 (sin "personalizado") + **video loop +10%** + cinta de atributos + CTA "Ver catálogo" |
| 2 | **Qué encuentras en Luna 3D** | Mostrar el rango: decoración, regalos, funcionales, ocasiones | 4 pilares (Bloque 1) con ícono + 1 línea cada uno, enlazando a categorías |
| 3 | **Siempre algo nuevo / Tendencias** | Probar que el catálogo está vivo | Grilla de últimos productos con badge "NUEVO" + CTA a catálogo |
| 4 | **Por qué se ve y se siente bien** | Calidad y terminaciones = justificar precio y confianza | 3 micro-argumentos + fotos macro; aquí va el **proceso recortado** (4 pasos, no 7) |
| 5 | **Para cada ocasión** | Capturar intención por fecha especial | Grilla de ocasiones enlazada a colecciones |
| 6 | **Compra con confianza** | Eliminar el miedo a comprar | Garantía · Pago seguro · Despacho · Atención (Bloque 5) |
| 7 | **Reseñas** | Prueba social (el mayor vacío actual) | 3–6 testimonios reales con comuna y foto |
| 8 | **CTA final** | Cerrar hacia la compra | "Explora el catálogo" (primario) + "Contáctanos" (secundario) |

### Qué pasa con el "Proceso de 7 pasos" y el "Video"
- **Proceso:** no lo elimines, **degrádalo**. Para el nuevo posicionamiento (tienda con catálogo), el proceso es *respaldo de confianza*, no el protagonista. Conviértelo en 4 pasos clave (Impresión → Revisión → Terminación → Empaque/Envío) o en un acordeón colapsable dentro de la sección 4. Hoy ocupa el peso visual de la página y refuerza el relato de "taller a pedido" que queremos bajar.
- **Video:** no merece sección propia vacía. Reubícalo **dentro del Hero** (es el bloque animado del punto 2) o como apoyo de la sección 4. Una sección entera que hoy es solo un placeholder resta profesionalismo.

### Brechas de conversión detectadas (resumen)
1. **Sin prueba social** — ni una reseña en toda la página. *(la más crítica)*
2. **Sin presencia de producto** — la página habla de cómo trabajas, pero no muestra qué vendes ni enlaza a productos concretos.
3. **9 placeholders "pendiente"** — restan credibilidad; el sitio se ve "en construcción".
4. **Mensaje desalineado** — vende "personalizado/a pedido" en vez de catálogo/tendencias.
5. **CTAs tibios** — "Ver cómo lo hacemos" invita a leer proceso, no a comprar. El CTA dominante debe empujar al catálogo.

---

## 6. Priorización sugerida (qué hacer primero)

**Quick wins (bajo esfuerzo, alto impacto):**
1. Fix de aire bajo el header (punto 1) — 5 minutos de CSS.
2. Reescribir el copy del Hero con la opción elegida (punto 3) — sin diseño nuevo.
3. Reemplazar las 3 tarjetas "Hecho a pedido/Garantía/Envío" por los 4 pilares "Qué encuentras" + banda "Compra con confianza".
4. Recortar el proceso de 7 a 4 pasos / acordeón.

**Estratégico (requiere material nuevo):**
5. Producir el video loop del taller (punto 2) y reemplazar placeholders por fotos reales.
6. Sumar sección de Novedades y sección de Reseñas.
7. Sumar "Para cada ocasión" enlazada a colecciones del catálogo.

---

## 7. Qué puedo implementar cuando me confirmes

Dime y avanzo en este orden, con cambios atómicos y respaldo previo del archivo:
1. **Aire del header** (CSS) — listo para aplicar ya.
2. **Hero reescrito** — necesito que elijas opción A–E (o mezcla).
3. **Bloque visual +10%** (CSS + HTML del `<video>`) — funciona con placeholder hasta que tengas el clip.
4. **Reemplazo de "Historia"** por los nuevos bloques — necesito tu OK al blueprint de la sección 5.

> Decisiones que me destraban: (a) opción de copy del Hero; (b) ¿conservamos "se imprime cuando lo pides" en letra chica o lo eliminamos del todo?; (c) ¿implemento ya los quick wins de CSS/copy o prefieres revisar este documento primero?
