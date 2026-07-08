# PLAN DE SESIONES — Web Luna 3D v3 (hoja de ruta post-auditoría 18-jun-2026)

> Se usa junto con `CONTEXTO_BASE_Web_Luna3D_v3.md`. Las sesiones siguen las
> fases de la auditoría (`AUDITORIA_Web_Luna3D_v3_2026-06-18.md`), de lo más
> rápido y seguro a lo más complejo.

## CÓMO INICIAR UNA SESIÓN (lanzador reutilizable)
Abre un chat nuevo y pega esto, cambiando SOLO el número de sesión:

```
Trabajaremos en el proyecto Web Luna 3D v3. Antes de actuar:
1) Lee /mnt/AI/01_Estrella3D/Web_Luna3D_v3/CONTEXTO_BASE_Web_Luna3D_v3.md
2) Lee /mnt/AI/01_Estrella3D/Web_Luna3D_v3/PLAN_SESIONES_Web_Luna3D_v3.md y ejecuta la SESIÓN 1.
Sigue las reglas del contexto base. Confírmame un plan breve antes de editar.
```

Para la siguiente, cambia `SESIÓN 1` por `SESIÓN 2`, y así. Eso es todo lo que repites.

## ¿PUEDO CORRER DOS SESIONES EN PARALELO (en chats distintos)?
**Para EDITAR código: no es recomendable.** El proyecto usa **un solo repositorio** con un **bundle** como fuente de verdad; dos chats editando a la vez se pisarían (el último en cerrar sobrescribe al otro y se pierde trabajo). **Modelo seguro y profesional: SECUENCIAL** — termina una sesión (commit + bundle + redeploy) y recién entonces abre la siguiente; así el nuevo chat clona el bundle ya actualizado.
- Sí puedes tener varios chats abiertos para **leer/planificar/preguntar**, pero que **solo UNO edite y cierre a la vez**.
- Las sesiones están ordenadas por dependencia: respétalas. Si algún día quieres paralelizar de verdad, se haría con ramas git por sesión y un merge coordinado (avanzado; no necesario hoy).

## MAPA DE SESIONES
| Sesión | Fase auditoría | Tema | Depende de |
|---|---|---|---|
| 1 | Fase 1 | Correcciones rápidas y estabilidad | — |
| 2 | Fase 2 | UX, navegación, contenido y confianza | 1 (mismos archivos) |
| 3 | Fase 3 | Carrito y flujo de compra (afinamiento) | 1–2 |
| 4 | Fase 4 | Optimización y preparación para producción | 1–3 |
| 5 | Fase 5 | Carga de catálogo real (productos/imágenes) | fotos/precios de Daniel |
| 6 | Fase 6 | Cuentas de usuario | base estable |
| 7 | Fase 7 | Pagos MercadoPago + pruebas finales | cuenta/token MP |

> **PROGRESO (actualizado 2026-06-20):** Sesiones **1, 2, 3, 4 y 6 ✅ COMPLETADAS y EN VIVO** en https://luna3d.cl
> (Fase 4 = imágenes PNG→WebP −94 %/−3 MB + lazy-load, logos del nav optimizados −91 %, `robots.txt` + `sitemap.xml`,
> `canonical`/`og:url` a URL limpia, QA responsive emulado 390/768/1280 px sin overflow; 2 redeploys a Vercel por Claude).
> **PRÓXIMA: SESIÓN 5** (catálogo real; requiere fotos/precios de Daniel) y **SESIÓN 7** (MercadoPago). La **Sesión 6 (cuentas) ✅** quedó en vivo; falta solo encender Google OAuth con credenciales de Daniel. Capacidades autónomas (deploy + migraciones)
> y credenciales documentadas en `CONTEXTO_BASE_Web_Luna3D_v3.md` §7 y en `decisions/2026-06-19-autonomia-operativa-luna3d.md`.

---

## SESIÓN 1 — Fase 1: Correcciones rápidas y estabilidad
**Objetivo:** eliminar riesgos de credibilidad/normativos y arreglar navegación, sin tocar carrito/WhatsApp/Supabase.
- **T2 — Quitar descuento ficticio.** `product.js`: hoy `was = price × 1.25` y `-off%` para todos. Mostrar **solo el precio real** (`priceHtml` = solo `.now`). Dejar "antes/%" solo si el producto trae un campo de descuento REAL (p. ej. `p.compareAt`).
- **T3 — Enlaces/anclas rotos.** `#catalogo` y `#nosotros` no existen. En `app.js → buildFooter()` columna "Catálogo": "Todos los productos"→`catalogo.html`, "Categorías"→`catalogo.html`, "Más vendidos"→`catalogo.html?col=featured`, "Nuevos lanzamientos"→`catalogo.html?col=new`. CTA del carrito vacío (`renderDrawer`)→`catalogo.html`. `product.js` breadcrumb: `index.html?cat=…#catalogo`→`catalogo.html?cat=${p.cat}`. "Sobre Nosotros" (`#nosotros`): **decisión de Daniel** → quitar el enlace (recomendado) o crear sección `id="nosotros"`.
- **T5 — Búsqueda fuera del catálogo.** `app.js` handler `onkeydown` Enter: si no estás en `catalogo.html`, `location.href='catalogo.html?search='+encodeURIComponent(query)`. Verifica que `buildNav` precarga el input y `catalog.js` filtra con ese valor.
- **T10 — Versión pie.** `app.js → buildFooter` `footer-bottom`: `v2.0.0`→`v3.0.0`.
- **T16 — Higiene + seguridad.** `.vercelignore`: añadir `*.bak`, `*.bak_*`, `_editor/`, `preview/`, `graphify-out/`, `_fabrica_skills/`, `_Borradores_Productos/`, `_Futuros_Productos/`, `_Papelera/`, `Respaldo_Git/`, `supabase/`, `*.md`. **CRÍTICO:** verifica que `https://www.luna3d.cl/.claude-secrets/supabase.env` dé **404** (si no, avisar a Daniel y rotar la secret).

**Aceptación:** ficha muestra solo precio real; pie/breadcrumb/CTA llevan a `catalogo.html`; buscar desde la home aterriza en el catálogo filtrado; pie dice v3.0.0; `.claude-secrets/` no accesible; `node --check`+jsdom OK; commit+bundle+redeploy+memoria.

---

## SESIÓN 2 — Fase 2: UX, navegación, contenido y confianza
**Objetivo:** coherencia de contenido, páginas legales y bases de SEO/accesibilidad.
- **T1 — Carrusel promo (`luna3d-promo.js`).** Trae 18 productos **inventados** (precios/valoraciones ficticios) con enlaces a IDs inexistentes. **Reemplazarlo por productos reales de Supabase** (alimentarlo desde `PRODUCTS`) **o retirar la sección** hasta tener catálogo. Prioridad alta (es lo primero que se ve).
- **T4 — Páginas legales.** Crear y enlazar Términos, Privacidad, Cambios y Garantía/Devolución, Despacho/Seguimiento. **Usa el prompt existente** `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/PROMPT_Legales_Web_Luna3D_v3.md`. Reemplaza los `href="#"` del footer/sidebar.
- **T6 — Redes sociales.** Crear cuentas `@luna3d` o, mientras tanto, ocultar/deshabilitar los enlaces (hoy van a 404).
- **T13 — SEO.** Agregar `robots.txt` y `sitemap.xml`, `<link rel="canonical">`, y unificar URLs limpias (`og:url` usa `/catalogo.html` vs canónica `/catalogo`).
- **T14 — Accesibilidad.** Contraste en modo claro (botón "Añadir al carrito" + etiquetas magenta), foco de teclado, `alt`.
- **T15 — Escape XSS.** Escapar nombre/desc de producto al inyectarlos (defensa en profundidad).
- **T12 — Cuentas (stub).** Aclarar el "pronto" o reducir controles muertos (perfil/compras/notificaciones/historial/ajustes/ayuda).

**Aceptación:** home sin productos inventados; legales creadas y enlazadas; sin enlaces a 404; SEO base presente; contraste AA en modo claro; verificación + cierre estándar.

---

## SESIÓN 3 — Fase 3: Carrito y flujo de compra (afinamiento)
**Objetivo:** pulir la experiencia de compra (la base ya funciona).
- **T17 — Miniatura del producto en cada ítem del carrito** (hoy el recuadro va vacío).
- **T18 — Specs por producto** (hoy Material/Resolución/Despacho son fijos para todos).
- **T11 — Newsletter** conectado a destino real (Supabase/Resend) o marcado como no operativo (hoy valida pero no guarda el correo).
- **QA del flujo** completo por WhatsApp con varios productos y comunas.

**Aceptación:** carrito con miniatura; specs reales; newsletter operativo o claramente desactivado; QA de compra sin sorpresas; cierre estándar.

---

## SESIÓN 4 — Fase 4: Optimización y preparación para producción
**Objetivo:** rendimiento, responsive real y revisión final.
- Optimizar peso de imágenes/posters (varios > 0,5 MB) y revisar `lazy-load`.
- **QA responsive en dispositivo real** (móvil/tablet/escritorio) — pendiente declarado en la auditoría.
- Revisión final de SEO y de textos (testimonios/FAQ).

**Aceptación:** métricas de carga sanas; layout correcto en móvil real; textos revisados; cierre estándar.

> **✅ COMPLETADA y EN VIVO (2026-06-19):** 5 imágenes PNG→WebP (−94 %/−3 MB) + lazy-load en posters; logos del nav optimizados in-place 1,5 MB→132 KB (−91 %); assets no usados fuera del deploy; `robots.txt` + `sitemap.xml`; `canonical`/`og:url` a URL limpia; FAQ revisado (sin inventar); testimonios MANTENIDOS por decisión de Daniel. QA responsive emulado (iframe 390/768/1280) sin overflow horizontal; nav adapta a hamburguesa ≤768. `node --check` 9/9 + smoke jsdom 21/21. Commits `cb3572a` + `3b37208`; 2 redeploys a Vercel. **Sobre los "20 % OFF"/"10 %" de los banners:** decisión de Daniel = se revisan junto con los precios y ofertas reales en la Sesión 5; no es pendiente abierto.

---

## SESIÓN 5 — Fase 5: Carga de catálogo real (etapa final) · requiere fotos/precios de Daniel
**Objetivo:** poblar la tienda a 15–20 productos reales.
- Usar las skills **`producto-borrador`** (captura fotos → ficha) y **`publicar-producto`** (sube a Supabase y publica con el OK). Ver también `PROMPT_FabricaCatalogo_Web_Luna3D_v3.md`.
- **T8 — Galería de la home** con catálogo poblado (menos placeholders).
- Reemplazar testimonios/FAQ provisorios por contenido real.

**Aceptación:** catálogo poblado y publicado; home sin placeholders vacíos; cierre estándar. **Insumo de Daniel:** fotos + precios (ver `Pauta_Fotos_y_Precios_Web_Luna3D_v3_2026-06-12.pdf`).

---

## SESIÓN 6 — Fase 6: Cuentas de usuario ✅ COMPLETADA Y EN VIVO (2026-06-20, commit `0356bda`)
**Objetivo:** registro/login/direcciones/historial reales (hoy es solo UI).
> **HECHO:** Supabase Auth (correo/contraseña, confirmación desactivada), tablas `profiles`+`orders` con RLS por usuario + trigger de alta, wrapper `LUNA_AUTH` (`authGateway.js`), modal real, `cuenta.html` (perfil + historial), pedido WhatsApp registrado si hay sesión. **Google OAuth** cableado tras `GOOGLE_ENABLED` (pendiente: Daniel crea credenciales en Google Cloud → Supabase Auth → Providers → Google → `GOOGLE_ENABLED=true` + redeploy). Verificación: node 13/13, jsdom 45/45, e2e real Supabase 11/11.
- Implementar con Supabase Auth; cablear el modal existente (`buildAuth` en `app.js`) al backend.
- Manejar sesión, perfil y pedidos del usuario.

**Aceptación:** alta/login funcional; datos persistentes; sin romper compra por WhatsApp; cierre estándar.

---

## SESIÓN 7 — Fase 7: Pagos MercadoPago + pruebas finales (etapa final)
**Objetivo:** activar el pago con tarjeta (segundo canal).
- **Usa el prompt existente** `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/PROMPT_Sesion6_MercadoPago.md` y el ADR `PAGOS_MercadoPago_Web_Luna3D_v3.md`.
- Cablear "Pagar con tarjeta" a `LUNA_PAY.createCheckout`; crear páginas de resultado (éxito/fallo/pendiente); **validar precios server-side**; probar en **sandbox** y luego producción.
- **Insumo de Daniel:** cuenta vendedor MP + Access Token (TEST primero) + confirmar dominio para `back_urls`.

**Aceptación:** compra con tarjeta de prueba completa en sandbox; precios validados en servidor; cierre estándar.
