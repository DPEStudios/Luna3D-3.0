/* ============================================================
   LUNA3D — Pasarela de pago (wrapper AGNÓSTICO) · Sesión 5
   ------------------------------------------------------------
   SoC: este es el ÚNICO archivo del cliente que conoce la pasarela
   (MercadoPago). La UI llamará a window.LUNA_PAY.createCheckout(cart)
   y recibirá una URL a la que redirigir. Si mañana cambiamos de
   pasarela, se toca SOLO este wrapper + el endpoint serverless
   (api/create-preference.*).

   SEGURIDAD: el Access Token de MercadoPago NUNCA vive en el cliente.
   El cliente llama a un endpoint propio (serverless/PHP) que crea la
   preferencia server-side con el token en variable de entorno. Aquí
   solo se configura la URL de ese endpoint.

   Estado sesión 5 (preparación): wrapper listo y agnóstico. Falta en
   la sesión 6: cablear el botón del carrito y crear las páginas de
   resultado (éxito/fallo/pendiente).
   ============================================================ */
(function () {
  'use strict';

  // ---- CONFIG (editable, un solo lugar) ----------------------------------
  var PAY = {
    // 'mock' = sin backend (prueba el flujo local) | 'test' = sandbox MP
    // (usa sandbox_init_point) | 'prod' = producción (usa init_point).
    mode: 'mock',                          // [POR DEFINIR: 'test' al integrar]
    endpoint: '/api/create-preference',    // [POR DEFINIR: ruta real al desplegar]
    currency: 'CLP',
  };

  // ---- PURE: arma el payload de la orden desde el carrito -----------------
  // No toca el DOM ni la red. Salta ítems sin precio (defensa).
  function buildOrderPayload(cart) {
    var items = (cart || [])
      .filter(function (it) { return it && it.price != null && !Number.isNaN(it.price); })
      .map(function (it) {
        return {
          title: String(it.name),
          quantity: Math.max(1, parseInt(it.qty, 10) || 1),
          unit_price: Math.round(it.price),   // CLP no usa decimales
          currency_id: PAY.currency,
        };
      });
    var total = items.reduce(function (s, i) { return s + i.unit_price * i.quantity; }, 0);
    return { items: items, total: total, external_reference: 'luna3d-' + Date.now() };
  }

  // ---- Llama al endpoint propio y devuelve la URL de pago -----------------
  // Devuelve { url, id, raw }. Lanza Error si falla (la UI decide cómo avisar).
  async function createCheckout(cart) {
    var payload = buildOrderPayload(cart);
    if (!payload.items.length) throw new Error('Carrito vacío o sin ítems con precio');

    // Modo mock: no hay backend aún. Simula la respuesta para probar el flujo.
    if (PAY.mode === 'mock') {
      return {
        url: 'about:blank#mock-checkout?ref=' + encodeURIComponent(payload.external_reference)
              + '&total=' + payload.total,
        id: 'MOCK-' + payload.external_reference,
        raw: { mock: true, payload: payload },
      };
    }

    var resp = await fetch(PAY.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error('Endpoint de pago respondió ' + resp.status);
    var data = await resp.json();
    var url = PAY.mode === 'prod' ? data.init_point : data.sandbox_init_point;
    if (!url) throw new Error('La preferencia no devolvió URL de pago');
    return { url: url, id: data.id, raw: data };
  }

  window.LUNA_PAY = {
    config: PAY,
    buildOrderPayload: buildOrderPayload,
    createCheckout: createCheckout,
  };
})();
