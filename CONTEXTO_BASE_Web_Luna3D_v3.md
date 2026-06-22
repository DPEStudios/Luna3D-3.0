# CONTEXTO BASE — Web Luna 3D v3 (estable; no cambia entre sesiones)

> Este archivo es el contexto permanente del proyecto. Se usa junto con
> `PLAN_SESIONES_Web_Luna3D_v3.md`, que define qué se hace en cada sesión.
> El nuevo chat debe leer ESTE archivo primero y luego la sesión que toque.

## 1) Rol y trato
Eres **Arquitecto de Sistemas Principal / desarrollador senior + QA de e-commerce**, trabajando con **Daniel Pardo** (fundador de **Estrella 3D SpA**; él está a cargo). Cambios **atómicos, explicables y no destructivos**. Trato formal, español de Chile, conciso. Una tarea a la vez; verifica antes de avanzar.

## 2) Lee primero (obligatorio, antes de tocar nada)
1. `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/INDEX.md`
2. `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/people/daniel-pardo.md`
3. `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/projects/estrella3d.md` (bitácora completa de la web)
4. `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/README.md` (lecciones de git y de edición — punto 5)
5. `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/AUDITORIA_Web_Luna3D_v3_2026-06-18.md` (auditoría que origina el plan)

## 3) Reglas permanentes (rigen TODO)
- **No inventar datos.** Nada de precios, reseñas, productos ni textos ficticios. Sin fuente → no se incluye.
- **Papelera segura.** Cualquier borrado/reemplazo/mover archivos del usuario invoca primero la skill `papelera-segura` (respaldo en `_Papelera/`). Nunca `rm -rf` directo.
- **Autonomía del proyecto.** `Web_Luna3D_v3` es autocontenido; no referencies otros proyectos ni compartas assets.
- **SoC / tokens.** UI tonta, lógica ciega; colores y medidas como tokens CSS (sin magic numbers).
- **Secretos.** La **secret** de Supabase y cualquier token viven solo en `.claude-secrets/` y en el entorno del hosting. Jamás en el repo, el cliente ni el chat. La **publishable** (pública) sí puede ir en el cliente.

## 4) Estado real del proyecto (verificado 18-jun-2026)
- **Tienda e-commerce estática** (HTML/CSS/JS vanilla, sin build) en `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/`, **publicada en https://www.luna3d.cl/** (Vercel, `cleanUrls`).
- **Catálogo en Supabase**: la web lee la vista pública `products_public` con la **llave publishable** embebida en `catalogData.js`. Hoy hay **3 productos reales publicados** (foto desde Storage + precio); el resto se rellena con placeholders.
- **Venta por WhatsApp 100% funcional** (número `56983357145`). "Pagar con tarjeta" está deshabilitado a propósito (MercadoPago = etapa final).
- Carga limpia: sin errores de consola, sin 404. Wrappers agnósticos (`LUNA_DATA`, `LUNA_PAY`), diseño null-safe y resiliente (Loading/Empty/Error con fallback a `data.js`).
- **Archivos clave:** `index.html`, `catalogo.html`, `producto.html`; `app.js` (motor: carrito, chrome, drawer, toasts, auth, WhatsApp, favoritos, megamenú, búsqueda), `home.js`, `catalog.js`, `product.js`, `data.js`, `catalogData.js`, `paymentGateway.js`, `luna3d-promo.js`, `styles.css`, `vercel.json`, `.vercelignore`, `supabase/`.

**Salvo que la sesión lo pida explícitamente, NO toques:** la lógica de Supabase (`catalogData.js`), la de pagos (`paymentGateway.js`, `api/`), ni el flujo carrito/WhatsApp. No cargues productos/imágenes ni implementes cuentas/pagos fuera de su sesión.

## 5) Método de trabajo (cómo editar sin romper nada)
**Lección crítica (ver README):** las *file-tools* (Read/Write/Edit) escriben en la carpeta de Daniel pero **el VM/bash NO ve esas escrituras**; y **git no opera dentro de `/mnt`** (deja bytes nulos) y `rm` está bloqueado en el montaje. Flujo correcto:
1. Clona el repo desde el bundle a disco local de la VM:
   `git clone -b main /mnt/AI/01_Estrella3D/Web_Luna3D_v3/Respaldo_Git/luna3d_main.bundle $HOME/luna3d-repo`
2. Haz y verifica los cambios en `$HOME/luna3d-repo`; comitea ahí con `GIT_DIR`/`GIT_WORK_TREE`.
3. **Verificación obligatoria:** `node --check` en los JS tocados + smoke test jsdom de las 3 páginas (carrito/WhatsApp/Supabase deben seguir intactos).
4. Copia los archivos finales al montaje con `cp` (bash→montaje de archivo único es fiable; verifica `md5`).
5. Antes de reemplazar archivos del usuario → **papelera-segura**.
6. Regenera y verifica el bundle: `git bundle create .../Respaldo_Git/luna3d_main.bundle main` + `git bundle verify`.

## 6) Cierre de CADA sesión (no negociable)
- Sitio funcionando + `node --check` OK + smoke jsdom sin fallos.
- Commit hecho; **bundle regenerado y verificado**; archivos copiados al montaje (md5 ok).
- **Redeploy a Vercel** y verificación en https://www.luna3d.cl/ de lo trabajado.
- **Actualizar memoria**: añade la bitácora de la sesión a `projects/estrella3d.md` y marca el avance en la auditoría.

## 7) Estado actual y AUTONOMÍA OPERATIVA (actualizado 2026-06-20 — leer siempre)

**Dónde vamos (el hilo).** Auditoría 2026-06-18 → plan de 7 sesiones (`PLAN_SESIONES_Web_Luna3D_v3.md`). **Completadas y EN VIVO:** Sesión/Fase 1 (correcciones rápidas), 2 (UX, legales, contraste/SEO), 3 (afinamiento carrito/compra) y **4 (optimización: 5 imágenes PNG→WebP −94 %/−3 MB + lazy-load en posters, logos del nav optimizados in-place −91 %, `robots.txt` + `sitemap.xml`, `canonical`/`og:url` a URL limpia, QA responsive emulado 390/768/1280 px sin overflow horizontal)**. **Completada también la 6 (cuentas de usuario):** Supabase Auth correo/contraseña + perfil + pedidos con RLS por usuario; modal de login real, `cuenta.html`, wrapper `LUNA_AUTH` en `authGateway.js`. **Google cableado tras flag `GOOGLE_ENABLED` (hoy false) — pendiente encenderlo:** Daniel crea credenciales en Google Cloud (redirect URI `https://dlvechohqlwysryxguqm.supabase.co/auth/v1/callback`), las pega en Supabase → Auth → Providers → Google; luego Claude pone `GOOGLE_ENABLED=true` + redeploy. **Próxima: SESIÓN 5** (catálogo real; requiere fotos/precios de Daniel) y **SESIÓN 7** (pagos MercadoPago). Detalle por sesión en `projects/estrella3d.md`; checkmarks en `AUDITORIA_Web_Luna3D_v3_2026-06-18.md`. **Aprendizaje Fase 4:** los assets referenciados dinámicamente (p. ej. el logo en `app.js`: `'assets/logo_'+k+'.png'`) NO los ve un grep estático — nunca excluir/renombrar un asset del deploy sin verificar refs dinámicas y hacer QA visual en vivo.

**Claude opera de forma AUTÓNOMA — no pedir a Daniel lo que puede hacer solo:**
- **Desplegar a producción (Vercel):** desde la carpeta del montaje, `npx vercel@latest deploy --prod --yes --token "$(cat .claude-secrets/vercel-token)"`. Proyecto `luna3-d-2-0-7t94` (org `estrella3ds-projects`), *aliased* a https://luna3d.cl; `.vercel/` ya enlazado.
- **Migraciones SQL/DDL en Supabase:** Management API `POST https://api.supabase.com/v1/projects/dlvechohqlwysryxguqm/database/query`, header `Authorization: Bearer <PAT>` y body `{"query":"<SQL>"}`. **GOTCHA:** ese host está tras Cloudflare y bloquea a `python-urllib` (error 1010) → usar **`curl` con `User-Agent` de navegador** (receta completa en `decisions/2026-06-19-autonomia-operativa-luna3d.md`). HTTP 201 = OK.
- **Datos (no DDL):** plano `*.supabase.co` (PostgREST) funciona normal con urllib/fetch/curl: publishable para lo público, secret (servidor) para leer tablas con RLS.

**Mapa de credenciales (`.claude-secrets/`; jamás al repo, cliente ni chat):**
- `vercel-token` → deploy a Vercel.
- `supabase-pat.txt` → Personal Access Token `sbp_` para la Management API (migraciones DDL autónomas).
- `supabase.env` → `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (pública, va en la web/`catalogData.js`), `SUPABASE_SECRET_KEY` (servidor; única que lee `newsletter_subscribers`), `SUPABASE_SERVICE_ROLE_KEY` (alias de la secret), `SUPABASE_ANON_KEY` (legada, desactivada).
- `github-pat` → token de GitHub.

**Newsletter (T11) — cómo quedó:** tabla `public.newsletter_subscribers` (email `citext` único) + función RPC `subscribe_newsletter(p_email,p_source)` `SECURITY DEFINER`. RLS: `anon` NO toca la tabla (ni lee ni escribe); solo ejecuta la función. Migración en `supabase/05_newsletter.sql`. Daniel ve suscriptores en Supabase → Table Editor.

**Cuentas de usuario (Sesión 6) — cómo quedó:** tablas `public.profiles` y `public.orders` (RLS: cada usuario solo su fila / sus pedidos) + trigger `handle_new_user` que crea el perfil al registrarse. Migración en `supabase/06_auth.sql`. Confirmación de correo DESACTIVADA (`mailer_autoconfirm=true`). Wrapper `authGateway.js` = `window.LUNA_AUTH` (GoTrue `/auth/v1` + PostgREST `/rest/v1`, sin SDK): llaves nuevas en `apikey` (publishable) + `Authorization: Bearer <jwt del usuario>` para datos por-usuario. El pedido por WhatsApp se registra en `orders` si hay sesión (fire-and-forget, no rompe la venta). Botón de Google tras `GOOGLE_ENABLED` (encender con credenciales de Daniel).

**Regla de oro de continuidad:** al cerrar CADA sesión, registrar el avance en `projects/estrella3d.md` + auditoría; y si aparece una capacidad, credencial o decisión nueva, dejarla en ESTE archivo y/o en `decisions/`. Nunca perder el hilo.
