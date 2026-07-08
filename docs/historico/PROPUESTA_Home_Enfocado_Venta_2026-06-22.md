# Propuesta — Home enfocado en vender (Web Luna 3D v3)

**Proyecto:** Web_Luna3D_v3 · **Fecha:** 22 de junio de 2026 · **Para:** Daniel Pardo (a cargo)
**Autor técnico:** Claude (Arquitecto de Sistemas) · **Estado:** Propuesta para aprobación — *aún no se modifica código*
**Alcance:** solo el Home (`index.html` + `home.js` + estilos asociados). No se toca carrito, WhatsApp, pagos, Supabase ni `catalogData.js`.

---

## 1. Resumen ejecutivo

El Home hoy tiene **8 bloques** y mucho de su espacio está dedicado a productos que aún no existen (placeholders "FOTO") y a contenido que no vende (Sobre nosotros, FAQ completa). El visitante baja por una página larga sin un foco claro de compra, ve muchas tarjetas vacías y termina sin un llamado a la acción final.

La propuesta reduce el Home a **7 bloques con una sola intención: vender**. Se elimina la duplicación, se mueve el contenido informativo a sus propias páginas, se reduce drásticamente la cantidad de slots vacíos y se agregan los tres bloques que hoy faltan y que más empujan la conversión: **categorías destacadas, beneficios y CTA final**.

**Principio que respeto en todo:** no inventar datos. Donde la propuesta toca reseñas o stock, lo dejo marcado como decisión tuya (sección 6), no lo relleno con contenido ficticio.

---

## 2. Inventario del Home actual

| # | Bloque actual | ¿Qué hace? | Veredicto |
|---|---|---|---|
| 1 | **Hero banner** (slider 2 slides) | 2 banners que linkean al catálogo | ✅ **Conservar** (es el bloque más valioso) |
| 2 | **Promo `l3d-promo`** (3 posters: best / gift / offer + mini-carrusel) | 3 imágenes con productos en miniatura | ⚠️ **Reemplazar** — duplica los bloques 4, 5 y 6 |
| 3 | **Galería — Nuevos** (poster + 6 productos) | Recién llegados | 🔁 **Fusionar/reducir** (casi todo placeholder) |
| 4 | **Galería — Más vendidos** (poster + 6) | Top ventas | ✅ **Conservar** (núcleo de venta) |
| 5 | **Galería — Regalos** (poster + 6) | Ideas de regalo | 🔁 **Convertir** en "Categorías destacadas" |
| 6 | **Galería — Ofertas** (banner + 6 + contador) | Oferta semanal con timer | ✅ **Conservar** (es la "oferta semanal" que pides) |
| 7 | **Nosotros** (texto Sobre Luna 3D) | 2 párrafos institucionales | ➡️ **Mover** a página propia |
| 8 | **FAQ** (lista colapsada tras botón "?") | 6 preguntas frecuentes | ➡️ **Condensar** + mover el resto |

**Lectura rápida:** de 8 bloques, 4 generan ruido o están fuera de lugar para un Home que vende.

---

## 3. Lo que hoy mata la conversión

1. **Duplicación de mensajes.** El bloque `l3d-promo` (más vendido / regalo / oferta) repite exactamente lo que ya muestran las galerías 4, 5 y 6 más abajo. El visitante ve dos veces lo mismo → ruido, no valor.
2. **Demasiados slots vacíos.** Hay **4 grillas de 6 productos = 24 espacios**, pero solo existen **3 productos reales publicados**. El resto se rellena con tarjetas "FOTO" rayadas. Una tienda mayormente vacía resta confianza y diluye los pocos productos buenos que sí hay.
3. **Faltan los bloques que más venden.** No existe una sección de **categorías destacadas** (las categorías solo viven en el megamenú), ni de **beneficios** (envío, garantía, fabricación a pedido), ni un **CTA final**. La página termina en la FAQ, en frío.
4. **Contenido informativo ocupando el centro.** "Sobre nosotros" y la FAQ completa empujan los productos hacia arriba y alargan la página sin acercar la venta.
5. **Sin prueba social visible.** Existe la estructura CSS de testimonios, pero no se muestra en el Home. Hoy no hay ningún elemento de confianza (reseñas, sellos, garantía) a la vista.

---

## 4. Estructura propuesta (7 bloques, en este orden)

> Cada bloque tiene una sola función. El orden lleva al visitante desde el gancho hasta la compra.

**1. Hero principal** *(conservar y afinar)*
Se mantiene el slider. Recomendación: máximo 2 slides con mensaje claro y un botón visible ("Ver catálogo" / "Oferta de la semana"). El hero debe cargar con un CTA evidente, no solo una imagen clickeable.

**2. Categorías destacadas** *(nuevo — reutiliza las 5 categorías reales)*
Fila de tarjetas con las categorías que ya existen en datos: Maceteros y jardín, Decoración hogar, Llaveros y accesorios, Cultura pop y coleccionables, Organización y oficina. Cada una linkea a `catalogo.html?cat=…`. Ayuda al visitante a auto-segmentarse en el primer pantallazo. Ocupa el espacio que hoy gasta el bloque `l3d-promo` duplicado.

**3. Productos destacados / más vendidos** *(conservar, reducir)*
Un único bloque fuerte de destacados (los 3 reales primero). Mientras el catálogo sea chico, mostrar **4 productos**, no 6, para no exhibir placeholders. "Nuevos" se integra aquí con un badge en vez de ser un bloque aparte.

**4. Oferta semanal** *(conservar)*
Se mantiene el bloque de ofertas con el contador regresivo (ya funciona y se ve premium). Es exactamente la "oferta semanal" que pides. Misma regla: mostrar solo ofertas reales; si no hay, ocultar el bloque en vez de llenarlo con descuentos de muestra.

**5. Beneficios de comprar con nosotros** *(nuevo)*
Tira horizontal de 4 sellos con ícono: **Envío a todo Chile · Garantía de reimpresión · Fabricación a pedido en Chile · Atención directa por WhatsApp**. Todo esto ya es verdad del negocio (está en la FAQ y en Nosotros), solo lo subimos a un formato escaneable. Responde las objeciones antes de que frenen la compra.

**6. Reseñas o confianza** *(nuevo — DECIDIDO: maquetar y dejar OCULTO)*
Banda de prueba social. **Decisión de Daniel:** se conserva el diseño (le gusta cómo se ven las reseñas actuales), pero el bloque se deja **oculto en producción** porque las reseñas de `data.js` son de ejemplo y la regla es no inventar. Cuando Daniel entregue reseñas reales (capturas de clientes/WhatsApp), se reemplazan y se activa el bloque sin rehacer el diseño.

**7. CTA final** *(nuevo)*
Cierre con un llamado claro sobre fondo Aurora: por ejemplo *"¿Tienes una idea propia? La imprimimos para ti"* con dos botones — **Cotizar por WhatsApp** y **Ver catálogo**. Hoy la página muere en la FAQ; este bloque la cierra empujando a la acción.

---

## 5. Qué se mueve fuera del Home (y a dónde)

| Contenido | Hoy | Destino propuesto | Nota |
|---|---|---|---|
| **Sobre nosotros** | Sección `#nosotros` en el Home | **Página `nosotros.html` completa** (DECIDIDO) | El nav ya apunta a `index.html#nosotros`; se redirige a la nueva página. El Home queda 100% comercial |
| **Contacto** | `mailto:` en el menú lateral | Mantener en menú/footer; opcional página `contacto.html` | El canal real de venta es WhatsApp, conviene reforzarlo |
| **Cambios y garantías** | FAQ + menú | Ya existe en `legal.html#devoluciones` ✅ | Solo se enlaza desde Beneficios/footer; no ocupa Home |
| **Términos y condiciones** | Menú | Ya existe en `legal.html#terminos` ✅ | Queda solo en footer |
| **FAQ (6 preguntas)** | Bloque completo en el Home | Dejar **3 preguntas clave** en el Home + "Ver todas" → página/sección FAQ | Las dudas de compra (garantía, envío, cómo comprar) sí ayudan a vender; el resto se mueve |

Resultado: el Home queda **solo con bloques que venden**; lo informativo vive en páginas dedicadas, enlazadas desde el menú y el footer.

---

## 6. Decisiones tomadas (22-jun-2026)

1. **Reseñas (bloque 6).** ✅ Maquetar el bloque conservando el diseño actual, pero dejarlo **oculto** en producción. Se activará cuando Daniel entregue reseñas reales. No se publican las de ejemplo.
2. **Sobre nosotros.** ✅ **Página `nosotros.html` completa.** Se saca del Home y se redirige el enlace del menú.
3. **Productos por grilla.** ✅ Mostrar **solo productos reales** (hoy 3) y **ocultar los placeholders "FOTO"**, para que la tienda se vea curada y no a medio llenar. A medida que se suban productos a Supabase, las secciones se llenan solas.

---

## 7. Plan de implementación (no destructivo, por fases)

Una vez aprobada la propuesta y resueltas las 3 decisiones:

1. **Respaldo primero** (papelera-segura + backup de `index.html`, `home.js`, `styles.css`).
2. **Fase A — quitar ruido:** eliminar `l3d-promo` y consolidar las 4 galerías en destacados + ofertas.
3. **Fase B — bloques nuevos:** categorías destacadas, beneficios y CTA final (reutilizando tokens de marca, sin magic numbers).
4. **Fase C — mover contenido:** crear `nosotros.html`, condensar FAQ, redirigir enlaces del nav.
5. **Verificación:** `node --check` + smoke test jsdom (carrito/WhatsApp/Supabase intactos) + QA responsive 390/768/1280 px.
6. **Deploy** a Vercel y revisión en vivo en https://luna3d.cl.
7. **Memoria:** registrar la sesión en `projects/estrella3d.md` + auditoría.

Cada fase es un cambio atómico y reversible. No avanzo a la siguiente sin que la anterior esté verificada.

---

*Esperando tu OK y tus respuestas a las 3 decisiones de la sección 6 para comenzar.*
