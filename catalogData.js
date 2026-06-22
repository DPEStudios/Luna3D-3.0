/* ============================================================
   LUNA3D — Capa de datos del catálogo (wrapper AGNÓSTICO) · FASE B
   ------------------------------------------------------------
   SoC: este es el ÚNICO archivo del cliente que conoce la base de
   datos (Supabase). La UI llama a window.LUNA_DATA.bootstrap() /
   getCatalog() y recibe productos con la MISMA forma que data.js.
   Si mañana se cambia Supabase por otra DB, se toca SOLO este archivo.

   SEGURIDAD: aquí viven la URL y la PUBLISHABLE key (sb_publishable_…).
   Ambas son públicas y seguras por diseño (la publishable tiene los
   mismos privilegios bajos que la anon legada: solo lee la vista pública
   bajo RLS). La SECRET key (sb_secret_…) NUNCA vive en el cliente, ni en
   el repo, ni en el chat. (Migración a llaves nuevas Supabase 2026-06-14.)

   Estado: la web lee SOLO productos 'publicado' desde la vista pública.
   Con todo en borrador, la web se ve vacía (Empty) — es lo esperado.
   ============================================================ */
(function () {
  'use strict';

  // ---- CONFIG pública (un solo lugar) ------------------------------------
  var SUPABASE = {
    url:  'https://dlvechohqlwysryxguqm.supabase.co',
    publishable: 'sb_publishable_RCPEm-eSaMst0ipp1eumYA_z9l4TqzL',
  };
  var ENDPOINT  = SUPABASE.url + '/rest/v1/products_public?select=*';
  var TIMEOUT_MS = 8000;

  // ---- PURE: fila de products_public -> forma de objeto del catálogo ------
  // Misma forma que data.js (incluye catName derivado de CAT_NAME). Preserva
  // nulos para que la UI aplique sus defaults (DEFAULT_COLORS / DEFAULT_SIZES
  // / PROD_DESC) sin duplicar lógica. No toca DOM ni red.
  function mapRow(row) {
    // catName: categoría conocida (data.js) → etiqueta dinámica (cat_nombre) → slug.
    var catName = (typeof CAT_NAME !== 'undefined' && CAT_NAME[row.cat]) || row.cat_nombre || row.cat || '';
    return {
      id:       row.id,
      cat:      row.cat,
      catName:  catName,
      subcat:   (row.subcat != null && row.subcat !== '' ? row.subcat : null),
      name:     row.name,
      price:    (row.price == null ? null : Number(row.price)),
      img:      (row.img != null ? row.img : null),
      gallery:  (Array.isArray(row.gallery) ? row.gallery : null),
      tag:      (row.tag != null ? row.tag : null),
      featured: !!row.featured,
      rating:   (row.rating == null ? null : Number(row.rating)),
      reviews:  (row.reviews == null ? 0 : Number(row.reviews)),
      colors:   (row.colors && row.colors.length ? row.colors : null),
      sizes:    (row.sizes  && row.sizes.length  ? row.sizes  : null),
      desc:     (row.desc != null && row.desc !== '' ? row.desc : null),
      specs:    (Array.isArray(row.specs) && row.specs.length ? row.specs : null),
    };
  }

  // ---- Consulta la vista pública. Resuelve con array de publicados. -------
  // Rechaza si la red / Supabase falla (la capa de boot decide el fallback).
  function getCatalog() {
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    return fetch(ENDPOINT, {
      // Llaves nuevas Supabase: la publishable viaja SOLO en 'apikey'.
      // (NO en 'Authorization: Bearer' — ahí se parsea como JWT y se rechaza.)
      headers: { apikey: SUPABASE.publishable },
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (resp) {
      if (timer) clearTimeout(timer);
      if (!resp.ok) throw new Error('Supabase respondió ' + resp.status);
      return resp.json();
    }).then(function (rows) {
      if (!Array.isArray(rows)) throw new Error('Respuesta inesperada de Supabase');
      return rows.map(mapRow);
    });
  }

  // ---- Hidrata EN SU LUGAR los globales que lee app.js perezosamente ------
  // (megamenú, carrito, favoritos). PRODUCTS y PROD_BY_ID son const: no se
  // reasignan; se reemplaza el CONTENIDO del array y del objeto (mutación).
  function applyToGlobals(list) {
    if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) {
      PRODUCTS.splice(0, PRODUCTS.length);
      Array.prototype.push.apply(PRODUCTS, list);
    }
    if (typeof PROD_BY_ID !== 'undefined' && PROD_BY_ID) {
      Object.keys(PROD_BY_ID).forEach(function (k) { delete PROD_BY_ID[k]; });
      list.forEach(function (p) { PROD_BY_ID[p.id] = p; });
    }
  }

  // ---- Orquesta: intenta Supabase; si falla, conserva el seed de data.js --
  // Devuelve { source:'supabase'|'fallback', count, error? }. NUNCA rechaza:
  // garantiza que la web jamás se rompe por una caída de Supabase.
  var _state = { source: null, count: 0, ready: false };
  function bootstrap() {
    return getCatalog().then(function (list) {
      applyToGlobals(list);
      _state = { source: 'supabase', count: list.length, ready: true };
      return _state;
    }).catch(function (err) {
      var msg = String((err && err.message) || err);
      _state = {
        source: 'fallback',
        count: (typeof PRODUCTS !== 'undefined' ? PRODUCTS.length : 0),
        ready: true,
        error: msg,
      };
      if (typeof console !== 'undefined') {
        console.warn('[LUNA_DATA] Supabase no disponible; usando semilla data.js:', msg);
      }
      return _state;
    });
  }

  // ---- Newsletter: alta de suscriptor vía RPC (SECURITY DEFINER) -----------
  // SoC: este wrapper es el único cliente que conoce Supabase. Llama a la
  // función pública subscribe_newsletter(p_email,p_source): la web NUNCA toca
  // la tabla directamente (anon no tiene permisos sobre newsletter_subscribers).
  // La función valida el formato, normaliza y hace ON CONFLICT DO NOTHING del
  // lado del servidor → reintentar el mismo correo NO falla ni revela si ya
  // existía. Devuelve Promise<{ok:true}> o rechaza (red / error de servidor).
  var ENDPOINT_NEWS = SUPABASE.url + '/rest/v1/rpc/subscribe_newsletter';
  function subscribeNewsletter(email) {
    var clean = String(email == null ? '' : email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return Promise.reject(new Error('correo inválido'));
    }
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    return fetch(ENDPOINT_NEWS, {
      method: 'POST',
      headers: {
        apikey: SUPABASE.publishable,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_email: clean, p_source: 'web_footer' }),
      signal: ctrl ? ctrl.signal : undefined,
    }).then(function (resp) {
      if (timer) clearTimeout(timer);
      if (!resp.ok) throw new Error('Supabase respondió ' + resp.status);
      return { ok: true };
    });
  }

  window.LUNA_DATA = {
    config: SUPABASE,
    mapRow: mapRow,
    getCatalog: getCatalog,
    bootstrap: bootstrap,
    subscribeNewsletter: subscribeNewsletter,
    state: function () { return _state; },
  };
})();
