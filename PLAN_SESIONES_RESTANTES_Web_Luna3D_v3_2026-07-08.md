---
title: "Plan de Sesiones Restantes — Web Luna 3D v3"
subtitle: "Hoja de ruta vigente hacia el lanzamiento comercial de luna3d.cl"
author: "Estrella 3D SpA — Daniel Pardo · preparado con Claude"
date: "8 de julio de 2026"
lang: es
---

# Plan de Sesiones Restantes — Web Luna 3D v3

**Fecha de emisión:** 8 de julio de 2026
**Estado:** VIGENTE — este documento **reemplaza** como hoja de ruta a `PLAN_SESIONES_Web_Luna3D_v3.md` (18-jun), `RESUMEN_Estado_y_Proximos_Pasos_Web_Luna3D_v3_2026-06-20.md`, `Plan_Trabajo_Web_Luna3D_v3_2026-06-11.pdf` y `PLAN_Mejoras_Tienda_2026-06-14.md`. Esos archivos quedan como histórico.
**Fuente de verdad editable:** la copia `.md` de este documento (misma carpeta). El PDF se regenera desde ella.

---

## 0. Cómo usar este documento (instrucciones para Daniel)

Para trabajar una sesión, abre un chat nuevo y pega esto, cambiando solo el número:

```
Trabajaremos en el proyecto Web Luna 3D v3 (tienda luna3d.cl).
Antes de actuar, lee en este orden:
1) C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0\CLAUDE.md  (reglas duras, OBLIGATORIO)
2) C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0\PLAN_SESIONES_RESTANTES_Web_Luna3D_v3_2026-07-08.md
   (este plan; revisa el contexto de la seccion 1, las reglas de la seccion 2 y la bitacora de la seccion 8)
Ejecuta la SESION N de ese plan. Confirmame un plan breve antes de editar nada.
Trato formal, espanol de Chile, llamame Daniel.
```

Reglas de uso:

- **Las sesiones son secuenciales** (ver dependencias en la sección 7). Solo un chat edita a la vez.
- Si una sesión queda a medias, la IA debe registrarlo en la **bitácora (sección 8)** del `.md` antes de cerrar, para que el próximo chat retome sin perder contexto.
- Una sesión solo se marca COMPLETADA cuando cumple sus **criterios de aceptación** y el **cierre estándar** (sección 6).

---

## 1. Contexto esencial del proyecto (lectura obligatoria para la IA)

### 1.1 Qué es

- **Luna 3D** (luna3d.cl): tienda B2C de productos impresos en 3D. Marca de **Estrella 3D SpA** (RUT 78.426.412-2, constituida 18-05-2026, Renca RM; representante legal Daniel Pardo). Marca hermana B2B futura: Solar 3D.
- La tienda **ya está publicada y vendible** por WhatsApp (+56 9 8335 7145). Estas sesiones la llevan a su lanzamiento comercial completo (catálogo real + pago con tarjeta).

### 1.2 Dónde vive

| Cosa | Ubicación |
|---|---|
| **Carpeta de trabajo ÚNICA** | `C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0` |
| Copia vieja OBSOLETA (no tocar) | `...\AI\01_Estrella3D\Web_Luna3D_v3` (Google Drive) — se archiva en la Sesión 2 |
| Repositorio real | `https://github.com/DPEStudios/Luna3D-3.0`, rama `main` |
| Hosting | Vercel, proyecto `luna3-d-2-0-7t94` (org `estrella3ds-projects`), auto-deploy al hacer push a `main`, alias `https://luna3d.cl` |
| Base de datos | Supabase, proyecto ref `dlvechohqlwysryxguqm` (Sao Paulo) |
| Credenciales | `.claude-secrets/` dentro de la carpeta de trabajo: `vercel-token`, `supabase-pat.txt`, `supabase.env`, `github-pat`. **NUNCA** al repo, al chat ni al cliente |

### 1.3 Stack y archivos clave

Sitio **estático multi-página en JavaScript vanilla** (sin framework), con Supabase como backend y una función serverless para pagos.

| Archivo | Rol |
|---|---|
| `index.html`, `catalogo.html`, `producto.html`, `nosotros.html`, `contacto.html`, `cuenta.html`, `legal.html`, `seguimiento.html` | Páginas |
| `app.js` (~75 KB) | Núcleo: nav, footer, carrito (drawer), modal de auth, búsqueda, tema claro/oscuro |
| `catalog.js`, `catalogData.js` | Catálogo: filtros popover, orden, chips |
| `product.js` | Ficha de producto |
| `data.js` | Capa de datos: lee `products` desde Supabase (solo `estado='publicado'`) |
| `authGateway.js` | Wrapper `LUNA_AUTH` (Supabase Auth). Contiene flag `GOOGLE_ENABLED` y la publishable key (pública por diseño) |
| `paymentGateway.js` | Wrapper `LUNA_PAY` (agnóstico de pasarela) |
| `api/create-preference.js` | Función serverless: crea preferencia MercadoPago (`MP_ACCESS_TOKEN` por variable de entorno) |
| `supabase/*.sql` | Esquema versionado: products, RLS, storage, newsletter, auth (profiles/orders), seguimiento |
| `styles.css` (~169 KB) | Todo el CSS. Tokens en `:root` (paleta Aurora Lunar; tipografías Space Grotesk / Manrope / Space Mono) |
| `_tools/` | Guard de integridad (`verificar_integridad.py`), hook pre-commit, `subir_cambios.ps1` (publicación oficial) |

### 1.4 Marca

Referencia visual para cualquier decisión de diseño: `MARCA_Luna3D_referencia.md` (resumen operativo) y `Luna3D — Manual de Marca.pdf` (documento completo, consultar solo si el resumen no basta). **No inventar colores ni tipografías fuera de los tokens existentes.**

### 1.5 Capacidades autónomas de la IA (ya probadas)

- **Migraciones DDL en Supabase** vía Management API: `curl` con User-Agent de navegador (python-urllib es bloqueado por Cloudflare, error 1010). PAT en `.claude-secrets/supabase-pat.txt`. HTTP 201 + `[]` = aplicada.
- **Verificación end-to-end** del plano de datos (`*.supabase.co` sí acepta cualquier cliente).
- **Deploy**: lo dispara Daniel con `_tools\subir_cambios.ps1` (push a `main` → Vercel). La IA **no** ejecuta git (ver sección 2).

---

## 2. Reglas duras de trabajo (resumen — el detalle manda en `CLAUDE.md` del repo)

1. **La IA NUNCA ejecuta git en esta carpeta** (`add/commit/push/reset/checkout`). El puente de las sesiones de agente corrompe el index y deja locks pegados. Git corre solo en el PowerShell nativo de Daniel.
2. **La IA NUNCA usa Edit/Write directo sobre archivos del repo** (evidencia: truncamientos y colas de bytes nulos, incluso en ediciones que agrandaban el archivo). Método obligatorio: generar el archivo COMPLETO vía python a `<archivo>.nuevo` con `flush()+os.fsync()`, verificar (tamaño + sha256 + 0 bytes nulos + cola correcta), y recién ahí `mv` (rename) sobre el destino. Verificar de nuevo después del rename.
3. **Publicar SIEMPRE con** `cd C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0` y luego `_tools\subir_cambios.ps1` (lo corre Daniel). Nada se sube a mano.
4. **Verificaciones mínimas tras tocar código:** `node --check` en cada JS tocado; balance de llaves si se tocó CSS; `python3 _tools/verificar_integridad.py scan .` con 0 corruptos antes de publicar.
5. **Papelera segura:** nada se elimina ni se reemplaza sin respaldo previo (skill `papelera-segura` / carpeta `_Papelera/`).
6. **No inventar datos** (regla suprema): precios, testimonios, plazos, reseñas y textos legales solo con fuente verificable o aprobación explícita de Daniel. Placeholder honesto antes que dato falso.
7. **Verificar en producción** (https://luna3d.cl) después de cada publicación: páginas afectadas + consola del navegador.
8. Los locks de git pegados se mueven con `mv` a `_Papelera/` (nunca `rm`). Index corrupto: Daniel corre `Remove-Item .git\index -Force; git reset` en PowerShell.

---

## 3. Estado del proyecto al 8 de julio de 2026

### 3.1 Hecho y en vivo (NO rehacer)

- Tienda estática en Vercel (luna3d.cl): responsive, modo claro/oscuro, carga optimizada (WebP, lazy-load), SEO base (robots, sitemap, canonical).
- Catálogo conectado a Supabase (hoy ~3 productos reales publicados; el resto espacios "Próximamente"). Filtros popover por categoría/precio, chips activos, selector Ordenar corregido.
- **Venta por WhatsApp 100% funcional** (canal 1).
- **Cuentas de usuario reales** (Supabase Auth correo/contraseña, página Mi cuenta con perfil e historial, pedidos WhatsApp registrados con sesión). Botón Google visible pero en "muy pronto" (flag `GOOGLE_ENABLED=false`).
- Newsletter operativo (tabla + RPC con RLS insert-only). Páginas legales con datos reales de la SpA (faltan 2 campos, ver Sesión 7).
- Página Nosotros con contenido real. Protocolo anti-corrupción + hook pre-commit + CI de integridad activos.
- **Auditoría de seguridad 2026-07-08:** sin secretos en repo ni historial git; `.claude-secrets/`, `*.md` y `supabase/` dan 404 en producción; RLS habilitado en todas las tablas; cliente expone solo la publishable key (correcto).

### 3.2 Pendiente (lo que cubren estas sesiones)

| # | Pendiente | Sesión |
|---|---|---|
| 1 | Headers de seguridad HTTP (solo existe HSTS) | S1 |
| 2 | Copia obsoleta en Drive + docs con rutas viejas | S2 |
| 3 | Login con Google (falta credencial OAuth de Daniel) | S3 |
| 4 | Definir productos, costos y precios (no existe aún Excel maestro consolidado; hay borradores) | S4 |
| 5 | Catálogo real: fotos + carga + banners de oferta + testimonios/FAQ | S5 |
| 6 | MercadoPago: cuenta, validación server-side de precios (CRÍTICO), webhook, sandbox | S6 |
| 7 | Legales (despacho + correo), QA integral en dispositivo real, paso a producción | S7 |

**Decisiones ya tomadas (2026-07-08, no volver a preguntar):** los íconos de RRSS del footer **se quedan como están** hasta que Daniel cree las cuentas (queda en backlog); el manual de marca se usa **solo como referencia**; el alcance del plan es **lanzamiento + robustez**.

---

## 4. Las sesiones

> Formato de cada sesión: Objetivo · Prerrequisitos · Quién hace qué · Pasos · Criterios de aceptación. Toda sesión termina con el **cierre estándar** (sección 6).

### SESIÓN 1 — Hardening de seguridad del hosting

**Objetivo:** que luna3d.cl responda con los headers de seguridad estándar de una tienda profesional, sin romper ninguna página.
**Prerrequisitos:** ninguno. **Daniel:** solo publica y prueba. **IA:** todo lo demás.

Pasos:

1. La IA inventaría los orígenes externos reales del sitio (revisando los 8 HTML + JS): Supabase (`*.supabase.co`, XHR e imágenes del bucket), Google Fonts si aplica, y cualquier CDN. Este inventario se documenta en el chat antes de escribir nada.
2. Editar `vercel.json` (método de escritura seguro, regla 2.2) agregando headers globales `source: "/(.*)"`:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
   - `Content-Security-Policy-Report-Only`: política construida desde el inventario del paso 1 (el sitio usa scripts/estilos inline, así que partirá con `'unsafe-inline'`; endurecerla es backlog).
3. Daniel publica (`subir_cambios.ps1`). La IA verifica en vivo: `curl -sI` sobre `/`, `/catalogo`, `/producto`, `/cuenta`, `/legal` + navegación real revisando la consola (violaciones CSP).
4. Si la CSP en modo Report-Only no reporta violaciones tras probar el flujo completo (home → catálogo → ficha → carrito → login → newsletter), promoverla a `Content-Security-Policy` efectiva en una segunda publicación. **Si algo se rompe o hay dudas, la CSP se queda en Report-Only y se anota en la bitácora — los otros 4 headers no se negocian.**
5. Re-verificar los 404 de rutas sensibles: `/.claude-secrets/supabase.env`, `/CLAUDE.md`, `/supabase/01_schema.sql`.

**Aceptación:** los 4 headers básicos presentes en producción; CSP efectiva o Report-Only documentada; ninguna página ni flujo roto; rutas sensibles en 404; cierre estándar.

### SESIÓN 2 — Saneamiento documental: una sola fuente de verdad

**Objetivo:** eliminar la ambigüedad entre la carpeta nueva y la copia vieja de Google Drive, y que ningún documento vigente apunte a rutas obsoletas.
**Prerrequisitos:** ninguno. **Daniel:** aprueba el archivado y commitea. **IA:** ejecuta con papelera segura.

Pasos:

1. Con la skill `papelera-segura`: renombrar la carpeta obsoleta de Drive `AI\01_Estrella3D\Web_Luna3D_v3` a `AI\01_Estrella3D\_OBSOLETO_Web_Luna3D_v3_archivado_2026-07` (rename, NO borrado) y dejar dentro un `LEEME_OBSOLETO.txt` que apunte a la carpeta de trabajo real. Nada se elimina.
2. En el repo: mover los documentos superados (`PLAN_SESIONES_Web_Luna3D_v3.md`, `RESUMEN_Estado_..._2026-06-20.md`, `Plan_Trabajo_..._2026-06-11.pdf`, `PLAN_Mejoras_Tienda_2026-06-14.md`, prompts de sesiones ya ejecutadas) a `docs/historico/` usando solo renames (operación confiable del puente). Los documentos de referencia vigentes (`CONTEXTO_BASE`, `DEPLOY_Vercel.md`, `MARCA_Luna3D_referencia.md`, pautas, ADRs de pagos/SKU) se quedan o se mueven a `docs/` según prefiera Daniel.
3. Actualizar `CONTEXTO_BASE_Web_Luna3D_v3.md` (escritura segura): rutas nuevas, referencia a este plan como hoja de ruta vigente y al protocolo de `CLAUDE.md`.
4. Actualizar la memoria persistente (`INDEX.md` + `projects/estrella3d.md`): nueva hoja de ruta, ruta de trabajo única, decisiones del 2026-07-08.
5. Daniel commitea con `subir_cambios.ps1` (los renames del repo). Verificar que el sitio no cambió (los `.md` no se despliegan).

**Aceptación:** carpeta Drive archivada con LEEME; ningún documento vigente apunta a rutas de Drive; memoria actualizada; sitio intacto; cierre estándar.

### SESIÓN 3 — Encender "Continuar con Google" (guiada paso a paso)

**Objetivo:** que el botón "Continuar con Google" funcione de verdad en luna3d.cl.
**Prerrequisitos:** ~15 minutos de Daniel con su cuenta Google. **El código ya está listo** — solo falta la credencial y encender el flag.

**Qué es esto (explicación para Daniel):** OAuth es el mecanismo de "iniciar sesión con Google": el cliente se identifica con Google y Google le confirma a la web quién es, sin que la web vea jamás su contraseña. Para usarlo, Google exige que la web esté registrada: eso genera un **Client ID** y un **Client Secret** (la "credencial OAuth"). Esa credencial se pega en Supabase (que gestiona el login), no en el código. Es gratis y no requiere tarjeta.

Pasos (la IA acompaña en vivo, pantalla por pantalla):

1. Daniel entra a `console.cloud.google.com` con su cuenta Google → crear proyecto "Luna3D".
2. Menú → **APIs y servicios → Pantalla de consentimiento OAuth** → tipo **Externo** → nombre "Luna 3D" + correo de soporte → guardar (modo prueba está bien).
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web.**
4. En **URIs de redireccionamiento autorizados**, pegar EXACTAMENTE: `https://dlvechohqlwysryxguqm.supabase.co/auth/v1/callback`
5. (Opcional) En Orígenes JavaScript autorizados: `https://luna3d.cl`
6. Crear → Google entrega Client ID y Client Secret. **No pegarlos en el chat.**
7. Daniel los pega directamente en **Supabase → Authentication → Providers → Google** → activar → guardar.
8. La IA cambia `GOOGLE_ENABLED` a `true` en `authGateway.js` (escritura segura) y Daniel publica.
9. Verificación real: login con Google en luna3d.cl con la cuenta de Daniel; confirmar que se crea el perfil en `profiles` y que Mi cuenta carga; confirmar que el login por correo sigue intacto.

**Aceptación:** login con Google operativo end-to-end en producción; login por correo sin regresión; cierre estándar.

### SESIÓN 4 — Definición del catálogo: productos, costos y precios (sesión de trabajo conjunta)

**Objetivo:** salir de la sesión con la lista definitiva de 10–20 productos, cada uno con nombre real, precio comercial y pauta de fotos — aunque las fotos se tomen después, con calma.
**Prerrequisitos:** Daniel presente para decidir. No se necesita nada técnico previo.
**Contexto importante:** hoy NO existe un Excel maestro consolidado; hay borradores dispersos. Esta sesión NO debe bloquearse esperando el sistema financiero completo: se crea una hoja mínima de costeo y basta.

Pasos:

1. **Inventario de candidatos:** revisar `_Borradores_Productos/` y `_Futuros_Productos/` del repo, los borradores de Excel en `AI\01_Estrella3D\Finanzas\`, y lo ya publicado en Supabase. Presentar a Daniel la lista consolidada de candidatos.
2. **Selección:** Daniel elige los 10–20 del lanzamiento (criterio Musk Way: poco material, pocos colores, fácil venta).
3. **Costeo por producto:** gramos de filamento + tiempo de impresión + costo del rollo → costo unitario; margen 60–70%; precio redondeado a cifra comercial ($X.990). Usar la skill `estrella-3d-finanzas` si aporta; si no hay datos de costo para un producto, Daniel los estima con la IA en el momento (pesar/consultar el slicer) — **no se inventan**.
4. **Salida 1 — Tabla de catálogo:** ID · nombre real · precio · colores/variantes · categoría/subcategoría. Se guarda como `docs/CATALOGO_Lanzamiento_2026-07.md` (y/o una hoja Excel simple si Daniel prefiere).
5. **Salida 2 — Plan de fotos:** lista de fotos a tomar por producto según `Pauta_Fotos_y_Precios_Web_Luna3D_v3_2026-06-12.pdf`: principal 1:1, mínimo 1600×1600 px, JPG/WebP < 400 KB, fondo neutro, luz difusa; nombradas `<id>-1.jpg`, `<id>-2.jpg`...
6. **Decisión de ofertas:** qué pasa con los banners "20% OFF / 10%" de la home: se ajustan a ofertas reales sobre los precios recién definidos, o se retiran. Queda decidido y anotado.

**Aceptación:** tabla de catálogo aprobada por Daniel y guardada en el repo; plan de fotos entregado; decisión de banners tomada y anotada en la bitácora; cierre estándar (esta sesión puede no tocar código).

### SESIÓN 5 — Carga del catálogo real

**Objetivo:** tienda poblada: todos los productos del lanzamiento visibles, con foto, precio real y botón de compra activo.
**Prerrequisitos:** tabla de la Sesión 4 + fotos tomadas por Daniel (puede hacerse por tandas: la sesión se repite por cada tanda sin fricción).

Pasos:

1. Por cada producto: skill `producto-borrador` (foto → ficha borrador con nombre/precio de la TABLA, no autoinventados) → revisión de Daniel → skill `publicar-producto` (sube imagen al bucket `productos`, UPSERT en `products`, publica con el OK). Las altas van directo a Supabase: **no requieren deploy**.
2. Poblar la galería de la home con el catálogo real; retirar los espacios "Próximamente" sobrantes.
3. Aplicar la decisión de banners de la Sesión 4 (ofertas reales o retiro del arte).
4. Testimonios y FAQ: revisar contra la regla de no inventar — mantener los de ejemplo solo si Daniel lo ratifica; reemplazar por reales cuando existan.
5. QA visual contra `MARCA_Luna3D_referencia.md` (consistencia de familia: fondos, encuadre, tokens).
6. Si hubo cambios de código (home/banners), Daniel publica con `subir_cambios.ps1`.

**Aceptación:** catálogo navegable con los productos del lanzamiento comprables (precio real, botón activo); home sin placeholders vacíos; banners coherentes con ofertas reales; cierre estándar.

### SESIÓN 6 — Pagos con tarjeta: MercadoPago end-to-end (guiada)

**Objetivo:** segundo canal de pago operativo en sandbox, con seguridad de precios server-side. Es la sesión más técnica; se hace con calma y por partes.
**Prerrequisitos:** ~20 minutos de Daniel para crear su cuenta vendedor. **Recomendado:** catálogo ya poblado (S5).

**Parte A — Cuenta y credenciales (Daniel, guiado en vivo):**

1. Crear/verificar cuenta **vendedor** en `mercadopago.cl` (ahí llegan los pagos).
2. Panel de desarrolladores → Tus integraciones → crear aplicación de **Checkout Pro**.
3. Copiar el **Access Token de PRUEBA** (`TEST-...`). **No pegarlo en el chat ni en el repo:** se configura como variable de entorno `MP_ACCESS_TOKEN` en Vercel (Settings → Environment Variables), guiado por la IA.

**Parte B — Código (IA):**

4. **Validación server-side de precios en `api/create-preference.js` — CRÍTICO.** El endpoint debe recibir solo `{id, quantity}` por ítem y leer título y precio desde Supabase en el servidor (secret key vía variable de entorno, jamás en el cliente). El `unit_price` que envíe el navegador se IGNORA. Sin esto no se pasa a producción.
5. **Webhook `api/mp-webhook.js`:** recibir la notificación de pago, consultar el estado real contra la API de MP (no confiar en el body), actualizar el pedido en `orders` (pagado/rechazado/pendiente) y disparar la notificación a Daniel (link wa.me, patrón ya definido en `PAGOS_MercadoPago_Web_Luna3D_v3.md`).
6. **Páginas de resultado** `pago-exito.html`, `pago-fallido.html`, `pago-pendiente.html` coherentes con el sitio (tokens de marca), enlazadas desde `back_urls`.
7. Cablear el botón "Pagar con tarjeta" del carrito a `LUNA_PAY.createCheckout` (el wrapper ya existe).
8. Actualizar `sitemap.xml` si corresponde y registrar la URL del webhook en el panel de MP.

**Parte C — Pruebas en sandbox:**

9. Compra completa con tarjetas de prueba de MP: caso aprobado, rechazado y pendiente. Verificar registro y estado del pedido en `orders`, y las 3 páginas de resultado.
10. **Prueba de seguridad obligatoria:** intentar una compra manipulando el precio desde el navegador (DevTools) y confirmar que el cobro usa el precio de Supabase, no el manipulado.
11. Confirmar que la venta por WhatsApp (canal 1) sigue intacta.

**Aceptación:** flujo sandbox completo en los 3 estados; precios inmanipulables desde el cliente (probado); webhook actualizando pedidos; WhatsApp sin regresión; cierre estándar. **El token de PRODUCCIÓN no se toca en esta sesión** (eso es Sesión 7).

### SESIÓN 7 — QA integral y salida a producción

**Objetivo:** cerrar los últimos huecos y encender el cobro real. La tienda queda lanzada.
**Prerrequisitos:** Sesiones 1–6 completadas. Daniel define 2 datos y tiene su celular a mano.

Pasos:

1. **Legales — completar los 2 campos pendientes** en `legal.html`: empresa de despacho (Starken/Chilexpress/otra) y correo de contacto para clientes. Daniel decide; la IA inserta (escritura segura). Si además se crea el correo `contacto@luna3d.cl` (o similar), verificar que reciba.
2. **QA end-to-end de compra por ambos canales:** WhatsApp y tarjeta (sandbox), con varios productos, cantidades y comunas; con y sin sesión iniciada; verificar historial en Mi cuenta y seguimiento.
3. **QA de cuentas:** registro nuevo por correo, login Google, recuperación de contraseña, RLS (un usuario no ve pedidos de otro — probarlo).
4. **QA responsive en dispositivo REAL** (celular de Daniel, pendiente declarado desde la auditoría de junio): navegación completa, carrito, checkout, modo claro/oscuro.
5. **SEO/metas:** sitemap con las páginas nuevas, canonical/og de las páginas de pago excluidas o correctas, títulos y descripciones revisados.
6. **Encendido de producción MP:** cambiar `MP_ACCESS_TOKEN` en Vercel al token de producción (`APP_USR-...`), registrar webhook de producción, y hacer **una compra real de monto mínimo** con tarjeta propia para validar el circuito completo (se puede reembolsar desde el panel MP).
7. **Checklist go-live final:** headers de seguridad activos (S1), 404 de rutas sensibles, scan de integridad 0, consola limpia en todas las páginas, Lighthouse rápido de referencia.
8. Actualizar memoria persistente y bitácora: la tienda queda LANZADA. Registrar los pendientes de backlog (sección 5).

**Aceptación:** compra real exitosa con tarjeta; legales completos; QA de los pasos 2–5 sin hallazgos abiertos; checklist go-live completo; memoria y bitácora actualizadas.

---

## 5. Backlog post-lanzamiento (NO son sesiones; no bloquear el lanzamiento por esto)

- **RRSS @luna3d:** cuando Daniel cree las cuentas (Instagram/Facebook/TikTok), actualizar los links del footer. Decisión 2026-07-08: los íconos se quedan como están mientras tanto.
- **CSP estricta:** retirar `'unsafe-inline'` moviendo scripts/estilos inline a archivos (trabajo fino, post-lanzamiento).
- **Fábrica de Catálogo, Fases C–E:** descubrimiento de tendencias + filtro IP/licencias + análisis económico automatizado (`PROMPT_FabricaCatalogo_Web_Luna3D_v3.md`).
- **Excel maestro financiero consolidado** (hoy: hoja mínima de la Sesión 4).
- **Refactor modular de `app.js`** (~75 KB): solo cuando el problema de corrupción de escrituras esté totalmente resuelto — hoy el riesgo supera el beneficio.
- **Dropdown custom de filtros** (UX capa 2 de la propuesta 2026-07-02).
- **Testimonios/FAQ reales** con las primeras ventas.

## 6. Cierre estándar de TODA sesión (checklist obligatorio)

1. `node --check` en cada JS tocado · balance de llaves si se tocó CSS.
2. `python3 _tools/verificar_integridad.py scan .` → 0 archivos corruptos.
3. Todo archivo escrito por el método seguro (python + fsync + verificación + rename) y re-verificado después del rename.
4. Publicación por Daniel: `cd C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0` → `_tools\subir_cambios.ps1` (debe verse `[guardián] OK`).
5. Verificación en https://luna3d.cl: páginas afectadas + consola limpia.
6. **Actualizar la bitácora (sección 8) del `.md` de este plan** — estado de la sesión, decisiones tomadas, pendientes que quedaron.
7. Si hubo decisiones de negocio: actualizar la memoria persistente (`INDEX.md` / `projects/estrella3d.md`).

## 7. Dependencias y orden recomendado

| Sesión | Necesita de Daniel | Depende de |
|---|---|---|
| S1 Hardening | Solo publicar | — |
| S2 Saneamiento | Aprobar archivado + commitear | — |
| S3 Google | ~15 min en Google Cloud | — |
| S4 Catálogo (definición) | Decisiones de productos/precios | — |
| S5 Catálogo (carga) | Fotos (por tandas) | S4 |
| S6 MercadoPago | ~20 min crear cuenta MP | S5 recomendada |
| S7 Go-live | 2 datos legales + celular + compra real | S1–S6 |

S1–S4 no dependen entre sí: se pueden tomar en cualquier orden (recomendado: 1 → 2 → 3 → 4). S5–S7 son secuenciales.

## 8. Bitácora de avance (la IA la actualiza al cierre de cada sesión — editar el `.md`, no el PDF)

| Fecha | Sesión | Estado | Notas / decisiones / pendientes |
|---|---|---|---|
| 2026-07-08 | — | Plan emitido | Auditoría de seguridad OK (sin secretos en repo/historial; RLS activo; faltan headers → S1). Decisiones: RRSS se quedan como están; manual de marca solo referencia; alcance lanzamiento + robustez. |
| 2026-07-08 | S2 | COMPLETADA (falta commit de Daniel) | Saneamiento ejecutado el mismo dia de emision del plan: 15 docs aplicados/superados movidos a docs/historico/ (con README indice); carpeta Drive archivada como _OBSOLETO_Web_Luna3D_v3_archivado_2026-07 + LEEME; banner de vigencia en CONTEXTO_BASE; referencias corregidas en CLAUDE.md y MARCA_referencia; memoria actualizada (INDEX + estrella3d). Pendiente: Daniel corre `_tools\subir_cambios.ps1` para commitear los renames. |
