# Resumen de Estado y Próximos Pasos — Web Luna 3D v3
**20 de junio de 2026 · Documento de continuidad (Daniel / Claude)**

> Léelo si estás perdido. Resume qué está listo, qué falta, qué hago yo y qué
> haces tú (con el cómo y el porqué), y trae el prompt para el próximo chat.

---

## 1. Dónde estamos (en una frase)
La tienda **está publicada y vendible** en https://luna3d.cl: catálogo conectado a Supabase,
venta por WhatsApp y, desde hoy, **cuentas de usuario reales**. Faltan tres cosas grandes,
todas dependen de insumos tuyos: **catálogo real (fotos/precios)**, **pagos con tarjeta (MercadoPago)**
y **encender el login con Google**.

---

## 2. Qué está EN VIVO hoy (no hay que rehacerlo)
- Tienda estática en Vercel (luna3d.cl), carga limpia, responsive, modo claro/oscuro.
- Catálogo leído desde Supabase (hoy con 3 productos reales publicados; el resto son espacios).
- **Venta por WhatsApp** 100% funcional (+56 9 8335 7145).
- **Cuentas de usuario (Sesión 6, recién terminada):** registro/login con correo y contraseña,
  página **Mi cuenta** (`/cuenta`) con perfil e historial de pedidos; el pedido por WhatsApp se
  guarda en tu historial si iniciaste sesión. Botón de Google visible pero en "muy pronto".
- Páginas legales creadas (con datos por completar), SEO base, newsletter operativo.

---

## 3. Sesiones del plan: hecho vs. pendiente
El plan oficial es `PLAN_SESIONES_Web_Luna3D_v3.md` (7 sesiones, salidas de la auditoría).

| Sesión | Tema | Estado |
|---|---|---|
| 1 | Correcciones rápidas | ✅ Listo y en vivo |
| 2 | UX, legales, confianza | ✅ Listo (legales con datos por completar) |
| 3 | Carrito y compra (afinamiento) | ✅ Listo y en vivo |
| 4 | Optimización y producción | ✅ Listo y en vivo |
| **5** | **Catálogo real (10–20 productos)** | ⏳ **Pendiente — necesita tus fotos y precios** |
| 6 | Cuentas de usuario | ✅ Listo y en vivo · falta solo **encender Google** |
| **7** | **Pagos MercadoPago** | ⏳ **Pendiente — necesita tu cuenta MercadoPago** |

**Conclusión: quedan 2 sesiones (la 5 y la 7) + el remate de Google de la 6.**

---

## 4. Otros pendientes detectados en los planes de la carpeta
Revisé todos los planes/prompts del proyecto. Aparte de las sesiones 5 y 7, queda:

- ✅ **Datos legales — COMPLETADO (2026-06-21):** los 10 campos por definir de legal.html ya tienen datos reales de Estrella 3D SpA (RUT 78.426.412-2, domicilio Renca RM, IVA incluido, jurisdicción Santiago) y están en vivo en luna3d.cl/legal. Solo quedan por definir la empresa de despacho y el correo de contacto (hoy redacción genérica / contacto por WhatsApp).
- **Redes sociales @luna3d:** los íconos del footer apuntan a cuentas que aún no existen (van a 404).
  Decisión tuya: crearlas u ocultarlas. Detalle en §6.5.
- **Testimonios y FAQ:** hoy los testimonios son de ejemplo (decidiste mantenerlos por ahora);
  se reemplazan por reales cuando tengas opiniones de clientes.
- **Banners "20 % OFF / 10 %":** son arte; se ajustan cuando definas precios y ofertas reales (en la Sesión 5).
- **Fábrica de Catálogo, Fases C–E (opcional):** automatización avanzada para dar de alta productos
  (descubrimiento + filtro de licencia/IP + análisis económico + imagen). No es necesaria para vender;
  la dejo como mejora futura.
- ✅ **(Menor) `legal.html` sin menú/pie de página — RESUELTO (2026-06-22):** se agregó el script que
  llama `LUNA.buildNav('')` + `LUNA.buildFooter()` (faltaba; la página solo cargaba `app.js`). En vivo en
  luna3d.cl/legal con header (logo + carrito) y footer (16 enlaces). Verificado con Chrome.

Los planes antiguos (`PLAN_Mejoras_Tienda_2026-06-14`, `Plan_Trabajo_..._2026-06-11`) ya quedaron
absorbidos por el plan de sesiones actual: no hay tareas sueltas ahí.

---

## 5. Lo que me queda a MÍ (Claude) — lo hago yo, sin que te preocupes
1. **Rematar Google** (Sesión 6): cuando me confirmes que pegaste las credenciales en Supabase,
   activo el flag `GOOGLE_ENABLED`, redesplego y verifico. ~5 min míos.
2. **Sesión 5 (catálogo):** cuando me pases fotos + precios, doy de alta los productos en Supabase
   (skills `producto-borrador` + `publicar-producto`), poblo la portada y dejo el catálogo navegable.
3. **Sesión 7 (pagos):** creo las páginas de resultado (`pago-exito/fallido/pendiente`), conecto el
   botón "Pagar con tarjeta", valido precios del lado servidor y pruebo en modo sandbox.
4. **Datos legales:** reemplazo los `[POR DEFINIR]` por tus datos reales cuando me los pases.
5. Cada sesión: verificación (node + jsdom + pruebas reales), commit, bundle, redeploy y memoria.

---

## 6. Lo que te queda a TI (Daniel) — el cómo y el porqué
Ordenadas de lo más rápido a lo más grande. No tienes que hacerlas todas de una; cada una habilita una parte.

### 6.1 Encender Google (cierra la Sesión 6) — ~10 minutos
**Por qué:** el código ya está listo; solo falta crear una credencial que vive en TU cuenta de Google.
Mientras no exista, el botón "Continuar con Google" muestra "muy pronto". El login por correo ya funciona,
así que esto es un extra, no un bloqueo.

**Cómo:**
1. Entra a **console.cloud.google.com** y crea (o elige) un proyecto, ej. "Luna3D".
2. Menú → **APIs y servicios → Pantalla de consentimiento OAuth** → tipo **Externo** → nombre de la app
   "Luna 3D" + tu correo de soporte → Guardar (modo prueba está bien).
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web.**
4. En **URIs de redireccionamiento autorizados** pega EXACTAMENTE:
   `https://dlvechohqlwysryxguqm.supabase.co/auth/v1/callback`
5. (Opcional) En **Orígenes JavaScript autorizados**: `https://luna3d.cl`
6. Crea → te dará un **Client ID** y un **Client Secret**.
7. Pégalos **directamente en Supabase** (no en el chat): **Authentication → Providers → Google →**
   activar + pegar ambos + Guardar.
8. Avísame "Google listo" en el próximo chat y yo lo enciendo y verifico.

### 6.2 Sesión 5 — Catálogo real (lo más importante para que se vea como tienda de verdad)
**Por qué:** hoy hay 3 productos reales y el resto son espacios "Próximamente". Sin precio, el botón de
compra queda desactivado ("Precio a confirmar"). Con fotos + precios, la tienda se llena y se puede comprar.
Guía completa: `Pauta_Fotos_y_Precios_Web_Luna3D_v3_2026-06-12.pdf`.

**Cómo (3 cosas por producto: nombre, foto, precio):**
- **Fotos** (lo más sensible): que las 20 se vean como familia.
  - Fondo liso (claro neutro recomendado), luz difusa de día (sin flash ni sol directo), producto limpio.
  - Foto principal **cuadrada (1:1)**, mínimo **1600×1600 px**, **JPG/WebP**, **menos de 400 KB**.
  - Nómbralas con el ID del producto: `maceteros-1-1.jpg`, `decoracion-2-1.jpg`, etc. (la lista de IDs
    está en la Pauta). Guárdalas en una carpeta `fotos_sesion3/`.
  - Mínimo 1 foto por producto; ideal principal + 1–3 detalles.
- **Precios:** sácalos del Excel maestro `Estrella3D_Maestro.xlsx` (hoja Calculadora_Costo + tu margen,
  60–70% típico), redondeados a cifra comercial ($X.990). Puedes pedirme el costo con la skill
  `estrella-3d-finanzas`.
- **Nombre real** de cada producto (y, si quieres, colores de filamento y tamaños disponibles).
- Me entregas la carpeta de fotos + una tabla simple (ID, nombre, precio final). Yo cargo todo.
- **No necesitas las 20 de una vez:** cargamos las que tengas; el catálogo funciona con cualquier cantidad.

### 6.3 Rellenar los datos legales (rápido, pero importante) — ✅ COMPLETADO 2026-06-21
**Por qué:** la página legal existe pero tiene huecos `[POR DEFINIR]`. Son obligatorios para vender con
confianza en Chile. Solo tienes que pasarme estos datos y yo los inserto:
1. Nombre/razón social de la empresa (¿"Estrella 3D SpA" u otro?).
2. RUT de la empresa.
3. Dirección comercial completa.
4. ¿Los precios **incluyen o no IVA**?
5. Ciudad/jurisdicción para controversias (ej. Santiago).
6. Empresa de despacho (ej. Starken / Chilexpress).
7. Correo de contacto para clientes.
8. Días hábiles de producción (ej. 3 a 5 días).
9. Cobertura de despacho (ej. todo Chile).
10. Cómo se cobra el envío (por pagar / cotizado al cierre).

### 6.4 Sesión 7 — MercadoPago (pagos con tarjeta, 2º canal de pago)
**Por qué:** hoy se vende por WhatsApp; agregar tarjeta amplía las ventas. El código base (wrapper +
endpoint) ya existe; falta tu cuenta y probar en modo prueba antes de cobrar de verdad.
**Esta sesión la hacemos juntos, paso a paso** (es tu primera integración de pagos).

**Cómo (lo que preparas tú; te guío en el momento):**
1. Tener/crear tu cuenta **vendedor en mercadopago.cl** (ahí llegan los pagos).
2. En el panel de desarrolladores → Tus integraciones → crear app de **Checkout Pro** → copiar el
   **Access Token de PRUEBA** (empieza con `TEST-`). **No lo pegues en el chat**: lo configuramos como
   variable de entorno en Vercel (yo te muestro dónde).
3. El hosting ya sabemos que es **Vercel**, así que esa parte está resuelta.
4. Primero probamos con tarjetas de prueba (sandbox); solo cuando todo funcione, pasamos al token de
   producción y recién ahí se cobra de verdad.

### 6.5 Decisión — Redes sociales @luna3d
**Por qué:** los íconos del footer hoy llevan a cuentas que no existen (404). Dos opciones:
crear las cuentas (Instagram/Facebook/TikTok "@luna3d") y me pasas los links, **o** me dices y oculto
los íconos hasta que las tengas. Es decisión tuya; cualquiera de las dos la aplico rápido.

---

## 7. Orden que te recomiendo
1. **Google** (10 min, casi listo) → cierra la Sesión 6.
2. ~~**Datos legales**~~ ✅ hecho (2026-06-21) — en vivo en luna3d.cl/legal.
3. **Sesión 5 — catálogo** (tu trabajo de fotos/precios) → es lo que más cambia la tienda.
4. **Sesión 7 — pagos** (después del catálogo, con tu cuenta MercadoPago).
5. Redes sociales: cuando quieras (decisión rápida).

> *Por qué este orden:* primero lo que está casi listo o cuesta poco (Google, legales), después lo que
> más valor agrega pero depende de tu material (catálogo), y al final los pagos, que conviene activar
> sobre una tienda ya poblada.

---

## 8. Prompt para el próximo chat (cópialo y pégalo)
Úsalo tal cual para retomar con todo el contexto. Si ya sabes qué sesión harás, dímelo en la última línea.

```
Trabajaremos en el proyecto Web Luna 3D v3. Antes de actuar, lee en este orden:
1) /mnt/AI/01_Estrella3D/Web_Luna3D_v3/CONTEXTO_BASE_Web_Luna3D_v3.md
2) /mnt/AI/01_Estrella3D/Web_Luna3D_v3/RESUMEN_Estado_y_Proximos_Pasos_Web_Luna3D_v3_2026-06-20.md
3) /mnt/AI/01_Estrella3D/Web_Luna3D_v3/PLAN_SESIONES_Web_Luna3D_v3.md

Sigue SIEMPRE las reglas del contexto base: cambios atómicos y no destructivos, no inventar
datos, papelera segura antes de reemplazar archivos, trabajar el repo en $HOME con bundle como
fuente de verdad (las file-tools no son visibles para bash), y deploy autónomo a Vercel +
migraciones Supabase por la Management API. Trato formal, español de Chile, llámame Daniel.

Primero dime en breve qué pendientes quedan según el RESUMEN y cuál me conviene tomar.
Luego ejecutamos el que yo te indique (puede ser: encender Google, rellenar datos legales,
Sesión 5 catálogo, o Sesión 7 MercadoPago). Confírmame un plan breve antes de editar.
```

**Variantes directas** (si prefieres ir a una sesión concreta, reemplaza la última línea por una de estas):
- *"Ejecuta la SESIÓN 5 (catálogo real). Te paso fotos y precios."*
- *"Ejecuta la SESIÓN 7 (MercadoPago). Vamos paso a paso con mi cuenta."*
- *"Encendamos Google: ya pegué el Client ID y Secret en Supabase."*
