/* ============================================================
   LUNA3D — Endpoint serverless: crea la preferencia MercadoPago
   ------------------------------------------------------------
   Despliegue recomendado: Vercel (/api/create-preference) o Netlify
   Functions, junto al sitio estático. El sitio actual luna3d.cl ya
   corre en un entorno Node/serverless (Next.js), así que encaja.

   SEGURIDAD: el Access Token vive SOLO como variable de entorno
   (MP_ACCESS_TOKEN). Nunca en el repositorio ni en el cliente.

   Estado sesión 5: scaffold verificado sintácticamente. Antes de usar
   (sesión 6): configurar MP_ACCESS_TOKEN (TEST primero), ajustar
   back_urls/notification_url al dominio real, y RE-VALIDAR los precios
   contra la fuente de verdad del catálogo (no confiar en el cliente).
   ============================================================ */
'use strict';

const MP_API = 'https://api.mercadopago.com/checkout/preferences';
const SITE_URL = process.env.SITE_URL || 'https://luna3d.cl';   // [POR DEFINIR]

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'Falta MP_ACCESS_TOKEN en el entorno' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      res.status(400).json({ error: 'Sin items' });
      return;
    }
    // NOTA (sesión 6): re-validar unit_price/quantity contra el catálogo.
    const preference = {
      items: items.map((it) => ({
        title: String(it.title || 'Producto Luna 3D'),
        quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
        unit_price: Math.round(Number(it.unit_price) || 0),
        currency_id: it.currency_id || 'CLP',
      })),
      external_reference: String(body.external_reference || ''),
      back_urls: {
        success: `${SITE_URL}/pago-exito.html`,
        failure: `${SITE_URL}/pago-fallido.html`,
        pending: `${SITE_URL}/pago-pendiente.html`,
      },
      auto_return: 'approved',
      // notification_url: `${SITE_URL}/api/mp-webhook`,  // webhook → sesión 6
    };
    const mpResp = await fetch(MP_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(preference),
    });
    const data = await mpResp.json();
    if (!mpResp.ok) {
      res.status(mpResp.status).json({ error: 'MercadoPago rechazo la preferencia', detail: data });
      return;
    }
    res.status(200).json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error creando la preferencia', detail: String((err && err.message) || err) });
  }
};
