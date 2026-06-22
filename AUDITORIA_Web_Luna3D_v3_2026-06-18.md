---
title: "Auditoría Técnica y Funcional — Web Luna 3D (v3)"
author: "Preparado para Daniel Pardo · Estrella 3D SpA"
date: "18 de junio de 2026"
lang: es-CL
---

# Auditoría Técnica y Funcional — Tienda Luna 3D (v3)

**Proyecto auditado:** `Web_Luna3D_v3` (repositorio local) y sitio en producción **https://www.luna3d.cl/**
**Tipo de sitio:** tienda e-commerce estática (HTML/CSS/JavaScript vanilla, sin build) desplegada en Vercel, con catálogo en Supabase y venta por WhatsApp.
**Fecha de auditoría:** 18 de junio de 2026
**Metodología:** revisión de desarrollador senior + QA de e-commerce. Se revisó el 100% del código fuente, se ejecutó el sitio real en el navegador y se verificó cada función (no se asumió nada): navegación, carrito, WhatsApp, catálogo conectado a Supabase, consola, red, responsive (CSS), SEO y accesibilidad.

> **Nota de alcance.** Por instrucción de Daniel, NO se consideran prioritarios en esta etapa: (1) sistema de pagos, (2) cuentas de usuario, (3) carga definitiva de productos y (4) carga definitiva de imágenes. Esos cuatro puntos se tratan como **etapa final** del proyecto. La auditoría sí verifica que la **infraestructura** que los soportará funcione.

---

## Resumen ejecutivo

La tienda está **mucho más avanzada de lo que su estado "en desarrollo" sugiere**: el sitio v3 ya está **publicado y operativo** en luna3d.cl, con una arquitectura limpia, un catálogo **real conectado a Supabase** (3 productos publicados con foto y precio reales, traídos desde la base de datos en vivo) y un **flujo de compra por WhatsApp 100% funcional**. La carga de red es impecable (23/23 peticiones en estado 200, sin errores 404 ni de consola).

El proyecto **no tiene fallas técnicas que rompan el sitio**. Los problemas detectados son de **coherencia de contenido, credibilidad comercial y navegación** — todos corregibles con esfuerzo bajo o medio. Los tres más importantes son: (1) un **carrusel de promociones con 18 productos inventados** (precios y valoraciones ficticios, enlaces que no llevan a ningún producto real); (2) un **descuento "-20%" ficticio** que se calcula automáticamente para todos los productos (riesgo de credibilidad y normativo); y (3) **enlaces de navegación rotos** en el pie de página y el menú (varios apuntan a anclas que no existen y no llevan al catálogo).

**Veredicto:** el "MVP vendible" (venta por WhatsApp con catálogo real) está **~85% terminado**; el avance hacia una **tienda 100% lista para producción** (incluyendo pagos con tarjeta, cuentas y catálogo completo) se estima en **~70%**. Con una sesión de correcciones rápidas, el sitio queda en condiciones de promocionarse con confianza.

---

# 1. Estado general del proyecto

## 1.1 Porcentaje estimado de avance

| Área | Avance | Comentario |
|---|---|---|
| Front-end / UX / diseño | **90%** | Pulido, coherente con el manual de marca, modo claro/oscuro, animaciones con respeto a `prefers-reduced-motion`. |
| Infraestructura de catálogo (Supabase) | **95%** | Probada end-to-end en producción: lee `products_public` con llave publishable; fotos desde Storage. Solo falta contenido. |
| Carrito + venta por WhatsApp | **95%** | Agregar, cantidades, persistencia y pedido por WhatsApp verificados en vivo. |
| Navegación y enlaces | **60%** | Páginas principales OK, pero hay anclas rotas, enlaces muertos y búsqueda inconsistente fuera del catálogo. |
| Contenido real (productos/fotos/textos) | **20%** | 3 productos publicados de ~15–20 deseables; testimonios y FAQ aún provisorios. *(Etapa final.)* |
| Páginas legales | **0%** | No existen Términos, Privacidad, Devolución ni Despacho; los enlaces van a `#`. |
| SEO / Accesibilidad / Rendimiento | **75%** | Buen `<head>` (meta/OG/favicon/manifest); faltan `robots.txt`, `sitemap.xml` y mejoras de contraste en modo claro. |
| Pagos con tarjeta (MercadoPago) | **40%** | Wrapper y endpoint listos; falta integrar. *(Etapa final.)* |
| Cuentas de usuario | **90%** | Solo UI (modal y toasts "pronto"). *(Etapa final.)* |

**Avance global hacia producción total: ~70%.** **Avance del MVP vendible actual (WhatsApp): ~85%.**

## 1.2 Funcionalidades completas (verificadas en vivo)

- **Despliegue v3 en producción:** las 3 páginas (`index`, `catalogo`, `producto`) se sirven en estado 200. Vercel con `cleanUrls` (las `.html` redirigen a URL limpia).
- **Catálogo conectado a Supabase:** la web lee en vivo la vista pública `products_public`. Al momento de la auditoría hay **3 productos reales publicados** con imagen (Supabase Storage) y precio: *Héroe del Tiempo — Figura Coleccionable* ($13.990), *Organizador Poké Ball para juegos Switch* ($7.990) y *Macetero Espiral Dune* ($12.990). La "fábrica de catálogo" funciona de punta a punta.
- **Carrito (localStorage):** agregar, aumentar/disminuir cantidad, eliminar, total y **persistencia entre páginas** (el contador del carrito se mantuvo al navegar) — todo verificado.
- **Venta por WhatsApp:** botón primario "Pedir por WhatsApp" en el carrito y la ficha. Genera correctamente `https://wa.me/56983357145` con el pedido formateado (ítems, total y plantilla de datos). Verificado.
- **Botón "Pagar con tarjeta · pronto"** correctamente **deshabilitado** (MercadoPago aún no integrado).
- **Catálogo con filtros reales:** categorías con contadores exactos (Todo 3, Decoración 1, Cultura pop 2, resto 0), filtro por precio, colecciones (Destacados/Novedades), orden y "ver más".
- **Ficha de producto:** breadcrumb, imagen real, selección de color/tamaño, cantidad, specs, "Añadir al carrito" y carrusel de relacionados.
- **Chrome del sitio:** megamenú por hover, menú lateral móvil (burger), buscador con animación, favoritos (localStorage) con popover, notificaciones tipo toast, **modo claro/oscuro persistente**, fondo cósmico con estrellas fugaces, loader y botones flotantes (WhatsApp / volver arriba).
- **Calidad técnica de carga:** 23/23 peticiones en 200; sin 404; sin errores de consola; Supabase responde 200; fuentes, favicon completo y manifest cargan.
- **Arquitectura limpia:** separación de responsabilidades real (wrappers agnósticos `LUNA_DATA` para datos y `LUNA_PAY` para pagos), diseño null-safe, resiliencia Loading/Empty/Error con *fallback* a semilla local, tokens CSS de marca y **sin secretos en el cliente** (solo la llave publishable, segura por diseño).

## 1.3 Funcionalidades incompletas

- **Contenido del catálogo:** 3 de ~15–20 productos; el resto de la home se rellena con placeholders "FOTO / Próximamente". *(Etapa final, pero impacta la percepción de tienda poblada.)*
- **Páginas legales:** inexistentes; los enlaces de Términos, Privacidad, Devolución y Despacho apuntan a `#`.
- **Búsqueda:** solo funciona dentro de `catalogo.html`; desde la home o la ficha no entrega resultados.
- **Cuentas de usuario:** modal de login/registro es solo visual; todas las acciones de cuenta muestran un toast "pronto". *(Etapa final.)*
- **Pagos con tarjeta:** preparados pero no integrados. *(Etapa final.)*
- **Newsletter:** valida el correo en pantalla pero **no lo guarda** en ningún lado.
- **Redes sociales:** los enlaces apuntan a cuentas `@luna3d` que aún no existen.

## 1.4 Riesgos detectados

- **Riesgo de credibilidad (alto):** el carrusel de "promociones" de la home muestra 18 productos **inventados** con precios y valoraciones ficticios; conviven con los 3 productos reales y los placeholders, dando una imagen contradictoria. Además, sus enlaces **no llevan a un producto real**.
- **Riesgo normativo / de confianza (medio-alto):** el "antes" tachado y el **"-20%" se generan automáticamente** (precio × 1.25) para todos los productos. Mostrar un precio de referencia que nunca existió puede ser objetado (en Chile, el SERNAC fiscaliza descuentos de referencia falsos).
- **Riesgo de conversión (medio):** la navegación principal (pie de página, "Sobre Nosotros", breadcrumb de categoría) **no lleva al catálogo** por anclas inexistentes; el usuario que quiere "ver todos los productos" puede quedarse en la home.
- **Riesgo de confianza (medio):** enlaces legales y de redes sociales que no llevan a ningún lado restan profesionalismo y son esperados por compradores chilenos.
- **Riesgo operativo (bajo):** el newsletter da feedback de éxito sin capturar el correo (se pierde el dato).

## 1.5 Problemas críticos

No se detectaron problemas que **rompan** el sitio (sin errores de consola, sin 404, el flujo de compra funciona). Los "críticos" de esta auditoría son de coherencia comercial, no de estabilidad:

1. **Carrusel promo con 18 productos inventados** (precios/valoraciones ficticios + enlaces rotos a productos inexistentes).
2. **Descuento "-20%" ficticio** aplicado a todos los productos.
3. **Enlaces de navegación rotos** (anclas `#catalogo` y `#nosotros` que no existen; el pie "Catálogo" y el breadcrumb de categoría no llegan al catálogo).

---

# 2. Lista completa de tareas pendientes

Cada tarea indica **prioridad** (Alta / Media / Baja), **impacto en el negocio**, **complejidad** estimada y **dependencias**. Las tareas T19–T20 corresponden a la **etapa final** que Daniel definió como no prioritaria por ahora.

## Prioridad ALTA

| ID | Tarea | Impacto en el negocio | Complejidad | Dependencias |
|---|---|---|---|---|
| **T1** | Reemplazar (o retirar) el carrusel de "promociones" de la home que muestra 18 productos inventados con precios y valoraciones ficticios y enlaces que no llevan a productos reales (`luna3d-promo.js`). | Alto — es lo primero que ve el visitante; hoy contradice al catálogo real y lleva a páginas erróneas. | Baja (retirar) / Media (cablearlo al catálogo real de Supabase) | Ideal: T7 (catálogo real). Puede retirarse ya sin dependencias. |
| **T2** | Eliminar el descuento "-20%" y el precio "antes" ficticios calculados automáticamente (`product.js`: `was = price × 1.25`). | Alto — credibilidad y riesgo normativo (precio de referencia falso). | Baja | Ninguna. Opcional: definir descuentos reales por producto. |
| **T3** | Corregir enlaces/anclas de navegación rotos: pie "Catálogo" (4 enlaces a `index.html#catalogo`), "Sobre Nosotros" (`#nosotros`), breadcrumb de categoría (`index.html?cat=…#catalogo`) y CTA del carrito vacío. Deben apuntar a `catalogo.html` (y `catalogo.html?cat=…`). | Alto — hoy la navegación principal no lleva al catálogo. | Baja | Ninguna. |
| **T4** | Crear y enlazar las páginas legales: Términos y Condiciones, Privacidad, Cambios y Garantía/Devolución, y Despacho/Seguimiento. | Alto — confianza del comprador y práctica estándar de e-commerce en Chile. | Media | Contenido legal (el prompt `PROMPT_Legales_Web_Luna3D_v3.md` ya existe). |

## Prioridad MEDIA

| ID | Tarea | Impacto en el negocio | Complejidad | Dependencias |
|---|---|---|---|---|
| **T5** | Hacer que la búsqueda funcione fuera del catálogo: que `Enter` redirija a `catalogo.html?search=…` y que el catálogo lea ese parámetro. | Medio — hoy buscar desde la home o la ficha no entrega resultados. | Baja | Ninguna. |
| **T6** | Redes sociales: crear las cuentas `@luna3d` o, mientras tanto, ocultar/deshabilitar los enlaces para no mandar a 404. | Medio — credibilidad de marca. | Baja (ocultar) / Media (crear RRSS) | Decisión de marca. |
| **T7** | Cargar catálogo real: pasar de 3 a 15–20 productos con foto y precio, usando las skills `producto-borrador` y `publicar-producto`. | Alto — una tienda con 3 productos se ve incompleta. *(Etapa final según Daniel.)* | Media (las skills ya existen) | Fotos y precios de Daniel. |
| **T8** | Galería de la home: manejar el caso de pocos productos (reducir los placeholders "FOTO/Próximamente" o mostrar secciones reales). | Medio — percepción de tienda activa. | Baja-Media | T7. |
| **T9** | Miniaturas reales en la ficha de producto (usar el campo `gallery`; hoy hay 4 miniaturas placeholder fijas aunque exista una sola foto). | Bajo-Medio | Media | Fotos múltiples por producto. |
| **T10** | Corregir la versión del pie de página: dice **"v2.0.0"** y el proyecto es **v3** (`package.json` 3.0.0). | Bajo (imagen/consistencia) | Trivial | Ninguna. |
| **T11** | Newsletter: conectar el correo a un destino real (Supabase/Resend) o marcarlo como no operativo para no perder el dato. | Bajo-Medio | Media | Servicio de correo/almacenamiento. |
| **T12** | Cuentas de usuario (UI stub): aclarar el estado "pronto" o reducir los controles que hoy no hacen nada (perfil, compras, notificaciones, historial, ajustes, ayuda). | Medio — muchos clics sin función confunden. | Baja (ocultar) / Alta (implementar) | Decisión; implementación es etapa final (T20). |

## Prioridad BAJA / técnica

| ID | Tarea | Impacto en el negocio | Complejidad | Dependencias |
|---|---|---|---|---|
| **T13** | SEO: agregar `robots.txt` y `sitemap.xml`, `<link rel="canonical">`, y unificar las URLs limpias (hoy `og:url` usa `/catalogo.html` mientras la canónica es `/catalogo`). | Medio — descubribilidad en buscadores. | Baja | Ninguna. |
| **T14** | Accesibilidad: mejorar contraste en modo claro (botón "Añadir al carrito" rosa pálido + etiquetas magenta), revisar foco de teclado y textos `alt`. | Medio — accesibilidad y SEO. | Baja-Media | Ninguna. |
| **T15** | Escapar el HTML de los datos de producto (nombre/desc) al inyectarlos (defensa en profundidad ante XSS, aunque hoy el dato lo controla Daniel). | Bajo | Baja | Ninguna. |
| **T16** | Higiene de despliegue: excluir del deploy los archivos de trabajo (`*.bak`, `_editor/`, `preview/`, `graphify-out/`, `_fabrica_skills/`, `catalog.js.bak…`) vía `.vercelignore`. | Bajo (limpieza/peso) | Baja | Ninguna. |
| **T17** | Mostrar la miniatura del producto en cada ítem del carrito (hoy el recuadro va vacío). | Bajo | Baja | Fotos del producto. |
| **T18** | Specs por producto (hoy Material/Resolución/Despacho son fijos e iguales para todos). | Bajo | Media | Datos por producto. |

## Etapa final (diferida por decisión de Daniel)

| ID | Tarea | Impacto en el negocio | Complejidad | Dependencias |
|---|---|---|---|---|
| **T19** | Integrar MercadoPago: cablear "Pagar con tarjeta" a `LUNA_PAY.createCheckout`, crear páginas de resultado (éxito/fallo/pendiente), validar precios server-side y probar en sandbox. | Alto — segundo canal de pago. | Alta | Cuenta vendedor MP + Access Token + confirmar hosting/dominio. |
| **T20** | Cuentas de usuario reales (registro, login, direcciones, historial de pedidos). | Alto — fidelización y autoservicio. | Alta | Backend de autenticación (Supabase Auth). |

---

# 3. Plan de trabajo por fases

Las fases van de lo **más rápido y de menor riesgo** a lo **más complejo**, dejando para el final lo que Daniel definió como etapa final.

**Fase 1 — Correcciones rápidas y estabilidad (riesgo mínimo, alto valor). ✅ COMPLETADA (2026-06-18, commit f8855f7; pendiente redeploy a Vercel por Daniel).**
Tareas T2, T3, T10, T5, T16. Quitar el descuento ficticio, arreglar la navegación rota, corregir la versión del pie, hacer funcionar la búsqueda y limpiar el deploy. Todo es de complejidad baja/trivial y no depende de nada externo. Resultado: el sitio deja de tener riesgo normativo y la navegación principal vuelve a llevar al catálogo.

**Fase 2 — UX, navegación y consistencia / confianza.**
Tareas T1, T4, T6, T13, T14, T15, T12. Reemplazar o retirar el carrusel de productos inventados, crear y enlazar las páginas legales, resolver las redes sociales, agregar `robots.txt`/`sitemap.xml`/canónica, mejorar contraste y accesibilidad, escapar datos y ordenar el estado de "cuentas". Resultado: la tienda se ve coherente, legal y confiable.

**Fase 3 — Carrito y flujo de compra (afinamiento). ✅ COMPLETADA Y EN VIVO (2026-06-19, commit 3d619c6; redeploy a Vercel hecho + migración `05_newsletter.sql` aplicada y verificada end-to-end → newsletter operativo en producción).**
Tareas T17, T18, T11, y QA del flujo completo de compra por WhatsApp con varios productos y comunas. El flujo ya funciona; aquí se pule (miniatura en el carrito, specs por producto, newsletter operativo).

**Fase 4 — Optimización y preparación para producción. ✅ COMPLETADA Y EN VIVO (2026-06-19, commits `cb3572a` + `3b37208`; 2 redeploys a Vercel).**
Rendimiento (peso de imágenes/posters, *lazy-load*), QA responsive en dispositivos reales (móvil/tablet/escritorio), revisión final de SEO y de los textos. Punto de control antes de promocionar. **Hecho:** 5 imágenes que carga el sitio PNG→WebP (3.266 KB → 190 KB, −94 %) conservando alpha; `lazy-load` en los 3 posters promo (héroe queda *eager* = LCP); logos del nav optimizados in-place (1,5 MB/1,13 MB → ~132 KB c/u, −91 %) y assets pesados no usados (`boceto.png`, `logo_color - simbolo luna.png`, PNG ya reemplazados) excluidos del deploy; `robots.txt` + `sitemap.xml` creados; `canonical`/`og:url` de catálogo/producto alineados a URL limpia (resuelve el mismatch de T13). **QA responsive** emulado en Chrome con iframe del propio sitio a 390/768/1280 px (la captura del navegador no reduce el viewport, limitación ya conocida): sin overflow horizontal en ningún ancho, nav colapsa a hamburguesa ≤768 y completa en 1280, las 5 WebP cargan a dimensión nativa. **Revisión de textos:** FAQ honesto y consistente con `legal.html` (sin cambios); testimonios ficticios MANTENIDOS por decisión explícita de Daniel. *Decisión de Daniel (2026-06-19):* los "20 % OFF"/"10 %" rotulados en los banners se ajustarán al cargar precios y ofertas reales (Sesión 5); no es un pendiente abierto. El spot-check en dispositivo físico real queda para Daniel.

**Fase 5 — Carga definitiva de productos, imágenes y contenido (etapa final).**
Tarea T7 y T8: poblar el catálogo a 15–20 productos con foto y precio reales, reemplazar testimonios y FAQ provisorios por contenido verdadero.

**Fase 6 — Sistema de cuentas de usuario. ✅ COMPLETADA Y EN VIVO (2026-06-20, commit `0356bda`; redeploy a Vercel).**
Tarea T20: registro, login, direcciones e historial de pedidos. **Hecho:** Supabase Auth (correo/contraseña, confirmación de correo desactivada), tablas `profiles`+`orders` con RLS por usuario + trigger de alta, wrapper agnóstico `LUNA_AUTH` (`authGateway.js`, sin SDK), modal de login real, `cuenta.html` (perfil editable + historial), y el pedido por WhatsApp se registra en `orders` si hay sesión (sin romper la venta). **Google OAuth** cableado tras flag `GOOGLE_ENABLED` (pendiente encender con credenciales de Daniel). Verificación: `node --check` 13/13, smoke jsdom 45/45, e2e real contra Supabase 11/11.

**Fase 7 — Integración de pagos y pruebas finales (etapa final).**
Tarea T19: MercadoPago Checkout Pro, páginas de resultado, validación server-side y pruebas en sandbox y producción.

---

# 4. Orden de ejecución recomendado

1. **Fase 1 completa, primero.** Son cambios de minutos y eliminan de inmediato los dos riesgos más sensibles: el **descuento ficticio** (T2, riesgo normativo) y la **navegación rota** (T3, el usuario no llega al catálogo). Sumar T10, T5 y T16 porque están en los mismos archivos y no cuestan casi nada. *Justificación: máximo retorno por hora invertida y cero dependencias.*

2. **T1 (carrusel promo).** Apenas pasada la Fase 1, decidir entre **retirar** la sección de 18 productos inventados (rápido) o **cablearla al catálogo real** de Supabase. Mientras esté, es lo primero que ve el visitante y contradice todo lo demás. *Justificación: es el problema de credibilidad más visible y está "arriba del fold".*

3. **T4 (páginas legales).** Necesarias para vender con confianza y ya existe el prompt que las genera. *Justificación: requisito de e-commerce y desbloquea los enlaces muertos del pie.*

4. **Resto de Fase 2 (T6, T13, T14, T15, T12).** Redes, SEO, accesibilidad, escape de datos y ordenar "cuentas". *Justificación: consolidan profesionalismo y descubribilidad sin tocar el flujo de compra.*

5. **Fase 3 (T17, T18, T11) + QA de compra.** Afinar el carrito y dejar el newsletter operativo. *Justificación: mejoras de experiencia sobre una base que ya funciona.*

6. **Fase 4 (optimización + QA responsive en dispositivo real).** Punto de control de calidad antes de promocionar. *Justificación: asegura que lo construido rinde bien en móvil real, donde comprará la mayoría.*

7. **Fase 5 — Cargar catálogo real (T7, T8).** Cuando Daniel tenga las fotos y precios. *Justificación: poblar la tienda multiplica el efecto de todo lo anterior; depende de un insumo externo (fotos).*

8. **Fase 6 — Cuentas (T20)** y **9. Fase 7 — Pagos MercadoPago (T19)**, al final, como definió Daniel. *Justificación: son los módulos de mayor complejidad y dependen de servicios externos; conviene activarlos sobre una tienda ya pulida y con tráfico validado.*

> **Recomendación de orden global:** Fase 1 → T1 → T4 → resto Fase 2 → Fase 3 → Fase 4 → (Fase 5 cuando haya fotos) → Fase 6 → Fase 7.

---

# Anexo A — Evidencia y metodología

**Qué se revisó en el código (100%):** `index.html`, `catalogo.html`, `producto.html`; `app.js` (1.134 líneas: carrito, chrome, drawer, toasts, auth, WhatsApp, favoritos, megamenú, búsqueda), `home.js`, `catalog.js`, `product.js`, `data.js`, `catalogData.js` (wrapper Supabase), `paymentGateway.js` (wrapper MercadoPago), `luna3d-promo.js`; `styles.css` (2.573 líneas, 23 media queries); `vercel.json`, `package.json`, `.vercelignore`, y los SQL de `supabase/`.

**Qué se verificó en vivo (navegador real sobre luna3d.cl):**

- Carga de las 3 páginas con captura de pantalla en escritorio.
- **Red:** 23 peticiones, todas 200; Supabase `products_public` responde 200; sin 404.
- **Consola:** sin errores ni excepciones.
- **Catálogo real:** 3 productos publicados leídos desde Supabase, con imágenes desde Storage (verificado que cargan: 709×791, 512×385, 1000×750 px).
- **Compra:** se agregó un producto al carrito, se abrió el drawer (total correcto), se confirmó el botón "Pedir por WhatsApp" y la URL `wa.me/56983357145` con el pedido formateado; el botón "Pagar con tarjeta" aparece deshabilitado. El contador del carrito **persistió** al navegar.
- **Ficha de producto** real renderizada completa (galería, variantes, specs, relacionados).
- **Modo claro/oscuro** funcionando.
- **Verificación de enlaces:** se confirmó por inspección que `#catalogo` y `#nosotros` no existen como destino, y que los IDs del carrusel promo (p. ej. `soporte-celular`) no existen en el catálogo real.

**Limitaciones de esta auditoría:**

- **Responsive:** se evaluó por análisis del CSS (breakpoints en 1180/1080/980/900/768/600/560/520 px, colapso de grillas y menú "burger" en móvil) y por comportamiento funcional. La herramienta de captura del navegador entregó siempre el ancho de escritorio, por lo que **no se obtuvieron capturas pixel-perfect en móvil/tablet**; se recomienda un *spot-check* visual en un dispositivo real (incluido en la Fase 4).
- La verificación del estado del catálogo en vivo se hizo desde el propio navegador (no por consulta directa a la API, restringida por la red del entorno).

# Anexo B — Detalle de hallazgos por categoría solicitada

- **Botones y elementos interactivos:** funcionales (carrito, cantidades, favoritos, filtros, orden, megamenú, tema, drawer, flotantes). Sin función real (por diseño/etapa): login/registro, compras, notificaciones, historial, ajustes, ayuda, idioma (muestran toast "pronto").
- **Navegación:** correcta entre Home ↔ Catálogo ↔ Producto. Rota hacia anclas inexistentes (`#catalogo`, `#nosotros`) y breadcrumb de categoría (T3).
- **Carrito:** correcto y persistente. Mejora menor: miniatura del producto (T17).
- **Notificaciones/mensajes:** sistema de toasts consistente y claro.
- **Formularios y validaciones:** newsletter valida formato de correo en vivo (no persiste, T11); modal de cuenta valida campos pero no autentica (etapa final).
- **Consistencia de textos:** buena en general; inconsistencias puntuales: "v2.0.0" en el pie (T10), testimonios/FAQ provisorios, productos inventados del carrusel (T1).
- **Responsive:** infraestructura presente y correcta (ver limitaciones).
- **Errores de consola/red:** ninguno detectado.
- **Rendimiento:** carga limpia; oportunidad de optimizar el peso de logos/posters (algunos > 0,5 MB) en la Fase 4.
- **SEO:** `<head>` sólido (title, description, Open Graph, Twitter, favicon completo, manifest, theme-color). Faltan `robots.txt`, `sitemap.xml` y canónica (T13).
- **Accesibilidad:** buena base (`aria-label`, `aria-pressed`, respeto a `prefers-reduced-motion`); revisar contraste en modo claro (T14).
- **Coherencia del flujo de compra:** sólida por WhatsApp; el único punto que confunde es el carrusel de productos inventados y el descuento ficticio (T1, T2).

*Fin del informe.*
