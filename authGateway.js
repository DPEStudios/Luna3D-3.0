/* ============================================================
   LUNA3D — Auth + datos de usuario (wrapper AGNÓSTICO) · SESIÓN 6
   ------------------------------------------------------------
   SoC: este es el ÚNICO archivo del cliente que conoce Supabase Auth
   y los datos por-usuario (perfil, pedidos). La UI llama a
   window.LUNA_AUTH.* y nunca habla con la red directamente. Si mañana
   se cambia el backend de auth, se toca SOLO este archivo.

   SEGURIDAD: aquí viven la URL y la PUBLISHABLE key (públicas y seguras
   por diseño, igual que catalogData.js). La SECRET key NUNCA vive en el
   cliente. Las contraseñas viajan por HTTPS al endpoint y no se guardan;
   en localStorage solo se persisten los tokens de sesión.

   Sin SDK ni CDN: usa REST de GoTrue (/auth/v1) y PostgREST (/rest/v1)
   con fetch, para mantener el sitio sin build y liviano.
   ============================================================ */
(function () {
  'use strict';

  var SUPABASE = {
    url: 'https://dlvechohqlwysryxguqm.supabase.co',
    publishable: 'sb_publishable_RCPEm-eSaMst0ipp1eumYA_z9l4TqzL',
  };
  // Login con Google: se enciende cuando el proveedor este configurado en
  // Supabase (Auth -> Providers -> Google). Mientras sea false, la UI muestra
  // "muy pronto" en vez de redirigir a un proveedor no habilitado.
  var GOOGLE_ENABLED = false;
  var AUTH = SUPABASE.url + '/auth/v1';
  var REST = SUPABASE.url + '/rest/v1';
  var SKEY = 'luna3d_session';
  var TIMEOUT_MS = 10000;

  // ---- listeners de cambio de sesión (para re-pintar la UI) -------------
  var _subs = [];
  function onChange(fn) { if (typeof fn === 'function') _subs.push(fn); }
  function _emit() { _subs.forEach(function (fn) { try { fn(getSession()); } catch (e) {} }); }

  // ---- persistencia (solo tokens + datos públicos del usuario) ----------
  function _save(sess) { try { localStorage.setItem(SKEY, JSON.stringify(sess)); } catch (e) {} }
  function _clear() { try { localStorage.removeItem(SKEY); } catch (e) {} }
  function getSession() {
    try { var s = JSON.parse(localStorage.getItem(SKEY) || 'null'); return (s && s.access_token) ? s : null; }
    catch (e) { return null; }
  }

  // ---- GoTrue -> forma de sesión interna --------------------------------
  function _toSession(data) {
    if (!data || !data.access_token) return null;
    var u = data.user || {};
    var meta = u.user_metadata || {};
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
      user: { id: u.id || null, email: u.email || null, nombre: meta.nombre || meta.name || null },
    };
  }

  // ---- fetch con timeout + apikey ---------------------------------------
  function _fetch(url, opts) {
    opts = opts || {};
    var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    var headers = Object.assign({ apikey: SUPABASE.publishable }, opts.headers || {});
    return fetch(url, Object.assign({}, opts, { headers: headers, signal: ctrl ? ctrl.signal : undefined }))
      .then(function (resp) { if (timer) clearTimeout(timer); return resp; });
  }
  function _authedHeaders(extra) {
    var s = getSession();
    var h = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
    if (s && s.access_token) h.Authorization = 'Bearer ' + s.access_token;
    return h;
  }

  // ---- errores legibles --------------------------------------------------
  function _errMsg(body, status) {
    var m = (body && (body.msg || body.error_description || body.message || body.error)) || '';
    var map = {
      'Invalid login credentials': 'Correo o contraseña incorrectos.',
      'User already registered': 'Ese correo ya tiene una cuenta. Inicia sesión.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Email not confirmed': 'Debes confirmar tu correo antes de ingresar.',
    };
    return map[m] || m || ('Error ' + (status || '') + '. Intenta de nuevo.');
  }

  // ---- REGISTRO ----------------------------------------------------------
  function signUp(opts) {
    opts = opts || {};
    var email = String(opts.email || '').trim().toLowerCase();
    var password = String(opts.password || '');
    var nombre = String(opts.nombre || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Promise.reject(new Error('Ingresa un correo válido.'));
    if (password.length < 6) return Promise.reject(new Error('La contraseña debe tener al menos 6 caracteres.'));
    return _fetch(AUTH + '/signup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, data: { nombre: nombre } }),
    }).then(function (r) { return r.json().then(function (b) { return { r: r, b: b }; }); })
      .then(function (x) {
        if (!x.r.ok) throw new Error(_errMsg(x.b, x.r.status));
        var sess = _toSession(x.b);
        if (sess) { _save(sess); _emit(); return { session: sess, needsConfirm: false }; }
        return { session: null, needsConfirm: true };
      });
  }

  // ---- LOGIN -------------------------------------------------------------
  function signIn(opts) {
    opts = opts || {};
    var email = String(opts.email || '').trim().toLowerCase();
    var password = String(opts.password || '');
    if (!email || !password) return Promise.reject(new Error('Completa correo y contraseña.'));
    return _fetch(AUTH + '/token?grant_type=password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    }).then(function (r) { return r.json().then(function (b) { return { r: r, b: b }; }); })
      .then(function (x) {
        if (!x.r.ok) throw new Error(_errMsg(x.b, x.r.status));
        var sess = _toSession(x.b);
        if (!sess) throw new Error('No se pudo iniciar sesión.');
        _save(sess); _emit(); return { session: sess };
      });
  }

  // ---- LOGIN CON GOOGLE (redirección OAuth) -----------------------------
  function signInWithGoogle() {
    if (!GOOGLE_ENABLED) return false;
    var redirect = location.origin + '/cuenta.html';
    location.href = AUTH + '/authorize?provider=google&redirect_to=' + encodeURIComponent(redirect);
    return true;
  }

  // ---- regreso de OAuth: tokens en el hash (#access_token=...) -----------
  function handleOAuthRedirect() {
    if (!location.hash || location.hash.indexOf('access_token=') === -1) return false;
    var p = new URLSearchParams(location.hash.slice(1));
    var at = p.get('access_token');
    if (!at) return false;
    _save({
      access_token: at,
      refresh_token: p.get('refresh_token'),
      expires_at: Math.floor(Date.now() / 1000) + (Number(p.get('expires_in')) || 3600),
      user: { id: null, email: null, nombre: null },
    });
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    return getUser().then(function () { _emit(); return true; }).catch(function () { _emit(); return true; });
  }

  // ---- refresca el access_token con el refresh_token --------------------
  function restore() {
    var s = getSession();
    if (!s) return Promise.resolve(null);
    if (s.expires_at && s.expires_at - 60 > Math.floor(Date.now() / 1000)) return Promise.resolve(s);
    if (!s.refresh_token) return Promise.resolve(s);
    return _fetch(AUTH + '/token?grant_type=refresh_token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (b) { var sess = _toSession(b); if (sess) { _save(sess); _emit(); return sess; } return s; })
      .catch(function () { return s; });
  }

  // ---- usuario actual (rellena datos faltantes) -------------------------
  function getUser() {
    var s = getSession(); if (!s) return Promise.resolve(null);
    return _fetch(AUTH + '/user', { headers: _authedHeaders() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (u) {
        if (!u || !u.id) return s.user;
        var meta = u.user_metadata || {};
        s.user = { id: u.id, email: u.email || null, nombre: meta.nombre || meta.name || null };
        _save(s); return s.user;
      });
  }

  // ---- CERRAR SESIÓN -----------------------------------------------------
  function signOut() {
    var s = getSession();
    var done = function () { _clear(); _emit(); };
    if (!s) { done(); return Promise.resolve(); }
    return _fetch(AUTH + '/logout', { method: 'POST', headers: _authedHeaders() }).then(done).catch(done);
  }

  // ---- PERFIL (tabla profiles, RLS por usuario) -------------------------
  function getProfile() {
    var s = getSession(); if (!s || !s.user || !s.user.id) return Promise.resolve(null);
    return _fetch(REST + '/profiles?id=eq.' + s.user.id + '&select=*', { headers: _authedHeaders() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { return (Array.isArray(rows) && rows[0]) ? rows[0] : null; });
  }
  function updateProfile(fields) {
    var s = getSession(); if (!s || !s.user || !s.user.id) return Promise.reject(new Error('Sesión no iniciada.'));
    var allow = ['nombre', 'telefono', 'comuna', 'direccion'], body = {};
    allow.forEach(function (k) { if (fields && fields[k] != null) body[k] = String(fields[k]).trim(); });
    return _fetch(REST + '/profiles?id=eq.' + s.user.id, {
      method: 'PATCH', headers: _authedHeaders({ Prefer: 'return=representation' }), body: JSON.stringify(body),
    }).then(function (r) {
      if (!r.ok) throw new Error('No se pudo guardar el perfil.');
      if (body.nombre != null) { s.user.nombre = body.nombre; _save(s); _emit(); }
      return r.json();
    });
  }

  // ---- PEDIDOS (tabla orders, RLS por usuario) --------------------------
  // recordOrder: fire-and-forget desde el checkout. NUNCA bloquea ni rompe
  // la venta por WhatsApp: sin sesión o ante error, resuelve en silencio.
  function recordOrder(order) {
    var s = getSession(); if (!s || !s.user || !s.user.id) return Promise.resolve({ skipped: true });
    var payload = {
      user_id: s.user.id,
      total: Math.round(Number(order && order.total) || 0),
      items: (order && order.items) || [],
      canal: 'whatsapp', estado: 'enviado',
      nombre: (order && order.nombre) || (s.user.nombre || null),
      comuna: (order && order.comuna) || null,
    };
    return _fetch(REST + '/orders', {
      method: 'POST', headers: _authedHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(payload),
    }).then(function (r) { return { ok: r.ok }; }).catch(function () { return { ok: false }; });
  }
  function listOrders() {
    var s = getSession(); if (!s || !s.user || !s.user.id) return Promise.resolve([]);
    return _fetch(REST + '/orders?user_id=eq.' + s.user.id + '&select=*&order=created_at.desc', { headers: _authedHeaders() })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { return Array.isArray(rows) ? rows : []; });
  }

  // ---- init: maneja regreso de OAuth y refresca sesión ------------------
  function init() {
    var p = handleOAuthRedirect();
    if (p && typeof p.then === 'function') return p.then(function () { return restore(); });
    return restore();
  }

  window.LUNA_AUTH = {
    config: SUPABASE, onChange: onChange, init: init,
    getSession: getSession, isLoggedIn: function () { return !!getSession(); },
    signUp: signUp, signIn: signIn, signInWithGoogle: signInWithGoogle, googleEnabled: function () { return GOOGLE_ENABLED; }, signOut: signOut,
    getUser: getUser, restore: restore, handleOAuthRedirect: handleOAuthRedirect,
    getProfile: getProfile, updateProfile: updateProfile, recordOrder: recordOrder, listOrders: listOrders,
  };
})();
