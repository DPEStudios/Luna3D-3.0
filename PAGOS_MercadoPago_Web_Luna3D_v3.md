# Pagos con MercadoPago — Web Luna 3D v3

> **Estado: Sesión 5 (preparación) COMPLETADA.** Arquitectura decidida y wrapper
> de pagos construido. La **integración al carrito y las páginas de resultado** se
> hacen en la **sesión 6**. Aquí queda todo listo para enchufar en cuanto Daniel
> entregue las credenciales y confirme el hosting.

---

## 1. Decisión de arquitectura (ADR · 2026-06-13)

**Contexto.** El sitio v3 es estático (HTML/CSS/JS sin build). MercadoPago Checkout Pro
exige crear una "preferencia" de pago con un **Access Token secreto**, llamada que
**debe ser server-side** (el token NUNCA puede ir en el navegador). Por tanto el sitio
estático necesita un pequeño endpoint propio que haga esa llamada.

**Hallazgo (investigación del hosting actual).** `luna3d.cl` (la v2 en producción) corre
sobre **Next.js / Node** — se detecta por el optimizador de imágenes `/_next/image` y la
metadata `next-size-adjust`. Es decir, el entorno **ya soporta funciones serverless**
(muy probablemente Vercel). *Daniel debe confirmarlo con acceso a cPanel/panel del host.*

**Opciones evaluadas.**
- **A. Función serverless** (Vercel `/api/*` o Netlify Functions) junto al sitio estático.
- **B. Endpoint PHP** en un hosting cPanel tradicional.
- **C. Sin backend** (imposible: expondría el token).

**Decisión: Opción A — función serverless.** Es la que mejor encaja con el hosting Node
ya existente, mantiene el token fuera del repo (variable de entorno) y no obliga a montar
un servidor aparte. Coincide con el "Plan B" del Plan de Trabajo, que aquí resulta ser el
camino natural. Se deja además un **endpoint PHP equivalente** por si el hosting final
fuese PHP.

**Consecuencias.** El sitio sigue siendo estático y portable; solo se añade una carpeta
`api/`. El wrapper del cliente es agnóstico: si mañana se cambia de pasarela, se tocan
solo dos archivos (`paymentGateway.js` + el endpoint).

---

## 2. Cómo funciona el flujo

```
Carrito (cliente)
   └─ LUNA_PAY.createCheckout(cart)        ← paymentGateway.js (wrapper agnóstico)
        └─ POST /api/create-preference     ← endpoint propio (serverless o PHP)
             └─ POST api.mercadopago.com/checkout/preferences  (con Access Token, server-side)
                  └─ responde { init_point, sandbox_init_point }
        └─ redirige al comprador a esa URL → paga en MercadoPago
             └─ MP redirige de vuelta a back_urls: /pago-exito | /pago-fallido | /pago-pendiente
```

## 3. Archivos creados en esta sesión
- `paymentGateway.js` — wrapper de cliente agnóstico. Expone `window.LUNA_PAY`
  (`buildOrderPayload` puro + `createCheckout`). Hoy en **modo `mock`** (prueba el flujo
  sin backend). SoC: no toca el DOM ni guarda el token.
- `api/create-preference.js` — función serverless (Vercel/Netlify, Node). Lee
  `MP_ACCESS_TOKEN` del entorno y crea la preferencia. **Recomendado.**
- `api/create-preference.php` — equivalente PHP (solo si el hosting fuese cPanel/PHP).

## 4. Lo que necesita Daniel (antes de la sesión 6)
1. **Cuenta vendedor MercadoPago** y panel de desarrollador.
2. **Access Token de TEST** (`TEST-...`) para sandbox, y luego el de **PRODUCCIÓN**
   (`APP-...`). Se cargan como variable de entorno `MP_ACCESS_TOKEN` — **nunca** en el repo.
3. **Confirmar el hosting**: ¿es Vercel/Netlify (serverless) o cPanel (PHP)? De eso depende
   cuál de los dos endpoints se usa.
4. **Dominio definitivo** para las `back_urls` (hoy `https://luna3d.cl`, ajustable con la
   variable `SITE_URL`).

## 5. Despliegue (caso recomendado: Vercel)
1. Subir el sitio (carpeta del proyecto) a Vercel; la carpeta `api/` se publica como
   funciones automáticamente.
2. En *Project → Settings → Environment Variables* agregar `MP_ACCESS_TOKEN` (TEST primero)
   y opcionalmente `SITE_URL`.
3. El sitio llamará a `/api/create-preference` (misma URL, sin CORS).

## 6. Probar YA (sin credenciales): modo mock
En `paymentGateway.js`, `PAY.mode = 'mock'` hace que `createCheckout` devuelva una URL
simulada sin llamar a MercadoPago. Sirve para validar el flujo de UI en la sesión 6 antes
de tener el token. Para sandbox real: `mode = 'test'` (usa `sandbox_init_point`).

## 7. Qué falta (sesión 6 — integración)
- Cablear un botón **"Pagar con tarjeta"** en el carrito que llame a `LUNA_PAY.createCheckout`
  y redirija a la URL devuelta (hoy ese botón está deshabilitado, "pronto").
- Crear las páginas de resultado **`pago-exito.html` / `pago-fallido.html` / `pago-pendiente.html`**
  con el estilo de marca.
- **Re-validar precios server-side** contra la fuente de verdad del catálogo (no confiar en
  los montos que manda el cliente).
- (Opcional) Webhook `notification_url` para confirmar pagos de forma asíncrona.
- Prueba completa en **sandbox** con tarjetas de prueba de MercadoPago.

---

*Referencia oficial: MercadoPago Developers — Checkout Pro / Crear preferencia
(`https://www.mercadopago.cl/developers/es/reference/online-payments/checkout-pro/preferences/create-preference/post`).
Verificar contra la documentación vigente al integrar.*
