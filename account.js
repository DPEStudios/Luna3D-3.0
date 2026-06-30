/* ============================================================
   LUNA3D — Página "Mi cuenta" (Sesión 6) · protegida por sesión
   SoC: la UI llama a window.LUNA_AUTH.* y a window.LUNA (chrome);
   no conoce la red. Resiliente: si no hay wrapper, muestra aviso.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function CLP(n) {
    try { return (window.LUNA && LUNA.CLP) ? LUNA.CLP(n) : ('$' + Number(n || 0).toLocaleString('es-CL')); }
    catch (e) { return '$' + n; }
  }

  var ESTADO_LABEL = {
    pendiente: 'En validación', recibido: 'Pedido recibido', en_revision: 'En revisión',
    en_produccion: 'En producción', listo_despacho: 'Listo para despacho',
    enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado',
  };

  function gateHTML() {
    return '<div class="account-gate">'
      + '<h1 class="section-title">Mi cuenta</h1>'
      + '<p>Inicia sesión o crea tu cuenta para ver tu perfil y tus pedidos.</p>'
      + '<button class="btn primary" id="acct-login-btn">Iniciar sesión</button>'
      + '</div>';
  }

  function panelHTML(user) {
    var hi = (user && user.nombre) ? ('Hola, ' + esc(user.nombre)) : 'Tu cuenta';
    var email = (user && user.email) ? esc(user.email) : '';
    return ''
      + '<div class="account-head">'
      + '<div><h1 class="section-title" style="margin:0">Mi cuenta</h1>'
      + '<span class="acct-hello">' + hi + (email ? (' · ' + email) : '') + '</span></div>'
      + '<button class="btn ghost" id="acct-logout">Cerrar sesión</button>'
      + '</div>'
      + '<div class="account-grid">'
      + '<section class="acct-card">'
      + '<h2>Mis datos</h2>'
      + '<div class="acct-field"><label for="f-nombre">Nombre</label><input id="f-nombre" type="text" autocomplete="name"></div>'
      + '<div class="acct-field"><label for="f-telefono">Teléfono (WhatsApp)</label><input id="f-telefono" type="tel" autocomplete="tel" placeholder="+56 9 ..."></div>'
      + '<div class="acct-field"><label for="f-comuna">Comuna</label><input id="f-comuna" type="text"></div>'
      + '<div class="acct-field"><label for="f-direccion">Dirección de despacho</label><input id="f-direccion" type="text"></div>'
      + '<button class="btn primary" id="acct-save">Guardar datos</button>'
      + '<p class="acct-msg" id="acct-profile-msg" role="status"></p>'
      + '</section>'
      + '<section class="acct-card">'
      + '<h2 id="pedidos">Mis pedidos</h2>'
      + '<div id="orders-body"><p class="orders-empty">Cargando…</p></div>'
      + '</section>'
      + '</div>';
  }

  function renderOrders(list) {
    var body = document.getElementById('orders-body'); if (!body) return;
    if (!list || !list.length) {
      body.innerHTML = '<p class="orders-empty">Aún no tienes pedidos registrados. '
        + 'Cuando hagas un pedido por WhatsApp con tu sesión iniciada, quedará guardado aquí.</p>';
      return;
    }
    var html = '<div class="orders-list">';
    list.forEach(function (o) {
      var d = new Date(o.created_at);
      var fecha = isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
      var items = Array.isArray(o.items) ? o.items : [];
      var resumen = items.map(function (it) { return (it.qty || 1) + '× ' + esc(it.name || 'producto'); }).join(', ');
      var estado = ESTADO_LABEL[o.estado] || '';
      var codigo = o.codigo ? ('<a class="oi-code" href="seguimiento.html?codigo=' + encodeURIComponent(o.codigo) + '">' + esc(o.codigo) + '</a>') : '';
      html += '<div class="order-item"><div class="oi-top">'
        + '<span class="oi-total">' + CLP(o.total) + '</span>'
        + '<span class="oi-date">' + fecha + '</span></div>'
        + '<div class="oi-items">' + (resumen || '—') + '</div>'
        + ((estado || codigo) ? ('<div class="oi-foot">' + (estado ? '<span class="oi-estado">' + esc(estado) + '</span>' : '<span></span>') + codigo + '</div>') : '')
        + '</div>';
    });
    html += '</div>';
    body.innerHTML = html;
  }

  function wirePanel() {
    var a = window.LUNA_AUTH;
    var logout = document.getElementById('acct-logout');
    if (logout) logout.onclick = function () { a.signOut().then(function () { location.href = 'index.html'; }); };

    var save = document.getElementById('acct-save');
    var msg = document.getElementById('acct-profile-msg');

    a.getProfile().then(function (p) {
      if (!p) return;
      var set = function (id, v) { var e = document.getElementById(id); if (e && v != null) e.value = v; };
      set('f-nombre', p.nombre); set('f-telefono', p.telefono); set('f-comuna', p.comuna); set('f-direccion', p.direccion);
    }).catch(function () {});

    if (save) save.onclick = function () {
      if (msg) { msg.className = 'acct-msg'; msg.textContent = 'Guardando…'; }
      var val = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
      a.updateProfile({ nombre: val('f-nombre'), telefono: val('f-telefono'), comuna: val('f-comuna'), direccion: val('f-direccion') })
        .then(function () { if (msg) { msg.className = 'acct-msg ok'; msg.textContent = 'Datos guardados ✓'; } })
        .catch(function (e) { if (msg) { msg.className = 'acct-msg err'; msg.textContent = (e && e.message) || 'No se pudo guardar.'; } });
    };

    a.listOrders().then(renderOrders).catch(function () { renderOrders([]); });
  }

  function render() {
    var root = document.getElementById('account-root'); if (!root) return;
    var a = window.LUNA_AUTH;
    var s = a && a.getSession();
    var user = s ? s.user : null;
    if (!user) {
      root.innerHTML = gateHTML();
      var b = document.getElementById('acct-login-btn');
      if (b) b.onclick = function () { if (window.LUNA && LUNA.openAuth) LUNA.openAuth('login'); };
      return;
    }
    root.innerHTML = panelHTML(user);
    wirePanel();
  }

  function start() {
    try { if (window.LUNA) { LUNA.buildNav(''); LUNA.buildFooter(); } } catch (e) {}
    var a = window.LUNA_AUTH;
    if (!a) {
      var root = document.getElementById('account-root');
      if (root) root.innerHTML = '<div class="account-gate"><p>El sistema de cuentas no está disponible por ahora.</p></div>';
      return;
    }
    Promise.resolve(a.init()).then(render).catch(render);
    a.onChange(function () { render(); });
  }

  if (document.readyState !== 'loading') start(); else addEventListener('DOMContentLoaded', start);
})();
