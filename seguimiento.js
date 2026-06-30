/* ============================================================
   LUNA3D — Seguimiento de pedido (Sesión 7) · público por código
   SoC: la UI llama a window.LUNA_DATA.trackOrder y a window.LUNA (chrome);
   no conoce la red. Resiliente: Loading / Error / Empty / No encontrado /
   En validación / Línea de tiempo.
   ============================================================ */
(function () {
  'use strict';

  // Máquina de estados visible (única fuente de las etiquetas en el cliente).
  var STEPS = [
    { key: 'recibido',       label: 'Pedido recibido' },
    { key: 'en_revision',    label: 'En revisión' },
    { key: 'en_produccion',  label: 'En producción' },
    { key: 'listo_despacho', label: 'Listo para despacho' },
    { key: 'enviado',        label: 'Enviado' },
    { key: 'entregado',      label: 'Entregado' },
  ];
  var LABEL = {
    pendiente: 'En validación', recibido: 'Pedido recibido', en_revision: 'En revisión',
    en_produccion: 'En producción', listo_despacho: 'Listo para despacho',
    enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado',
  };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function CLP(n){ try{ return (window.LUNA&&LUNA.CLP)?LUNA.CLP(n):('$'+Number(n||0).toLocaleString('es-CL')); }catch(e){ return '$'+n; } }
  function fmt(dt){ try{ var d=new Date(dt); if(isNaN(d.getTime())) return ''; return d.toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return ''; } }
  function elResult(){ return document.getElementById('track-result'); }

  function showLoading(){ var r=elResult(); if(r) r.innerHTML='<div class="track-card track-state"><span class="track-spinner" aria-hidden="true"></span><p>Consultando tu pedido…</p></div>'; }
  function showError(msg){ var r=elResult(); if(r) r.innerHTML='<div class="track-card track-state track-state--err"><p>'+esc(msg||'No pudimos consultar tu pedido ahora. Inténtalo de nuevo en un momento.')+'</p></div>'; }
  function showNotFound(code){ var r=elResult(); if(r) r.innerHTML='<div class="track-card track-state"><h3>No encontramos ese pedido</h3><p>Revisa que el código <b>'+esc(code)+'</b> esté bien escrito. Si la duda persiste, escríbenos por WhatsApp y lo vemos contigo.</p></div>'; }
  function showPending(){ var r=elResult(); if(r) r.innerHTML='<div class="track-card track-state"><span class="track-badge track-badge--pending">En validación</span><h3>Estamos validando tu pedido</h3><p>Recibimos tu solicitud y la estamos revisando. Cuando la confirmemos, aquí verás el avance paso a paso.</p></div>'; }

  function itemsHTML(items, total){
    if(!Array.isArray(items) || !items.length) return '';
    var li = items.map(function(it){
      var line = (it.qty||1)+'× '+esc(it.name||'producto');
      var sku  = it.sku ? '<small>'+esc(it.sku)+'</small>' : '';
      var price= (it.price!=null) ? CLP(it.price*(it.qty||1)) : '';
      return '<li><span class="ti-name">'+line+sku+'</span><span class="ti-price">'+price+'</span></li>';
    }).join('');
    return '<div class="track-items"><h3>Tu pedido</h3><ul>'+li+'</ul>'
      + (total!=null ? '<div class="track-total">Total <b>'+CLP(total)+'</b></div>' : '') + '</div>';
  }

  function stepperHTML(data){
    var events = Array.isArray(data.eventos) ? data.eventos : [];
    var whenOf = {}; events.forEach(function(e){ if(!whenOf[e.estado]) whenOf[e.estado]=e.fecha; });
    var cur = -1; for(var i=0;i<STEPS.length;i++){ if(STEPS[i].key===data.estado){ cur=i; break; } }
    var rows = STEPS.map(function(st,i){
      var cls  = i<cur ? 'done' : (i===cur ? 'active' : 'todo');
      var when = whenOf[st.key] ? '<span class="step-when">'+esc(fmt(whenOf[st.key]))+'</span>' : '';
      var mark = (i<cur) ? '✓' : (i+1);
      return '<li class="step '+cls+'"><span class="step-dot">'+mark+'</span><div class="step-body"><span class="step-label">'+esc(st.label)+'</span>'+when+'</div></li>';
    }).join('');
    return '<ol class="stepper">'+rows+'</ol>';
  }

  function showOrder(data){
    var r=elResult(); if(!r) return;
    var head = '<div class="track-head"><div><span class="track-code">'+esc(data.codigo||'')+'</span>'
      + (data.creado ? '<span class="track-date">Pedido del '+esc(fmt(data.creado))+'</span>' : '') + '</div>';
    if(data.estado==='cancelado'){
      r.innerHTML = '<div class="track-card">'+head+'<span class="track-badge track-badge--cancel">Cancelado</span></div>'
        + '<p class="track-cancel-msg">Este pedido fue cancelado. Si crees que es un error, escríbenos por WhatsApp.</p>'
        + itemsHTML(data.items, data.total) + '</div>';
      return;
    }
    r.innerHTML = '<div class="track-card">'
      + head + '<span class="track-badge track-badge--active">'+esc(LABEL[data.estado]||data.estado||'')+'</span></div>'
      + stepperHTML(data) + itemsHTML(data.items, data.total) + '</div>';
  }

  function render(data, code){
    if(!data || !data.found){ showNotFound(code); return; }
    if(!data.confirmado){ showPending(); return; }
    showOrder(data);
  }

  function doTrack(code){
    code = String(code||'').trim();
    if(!code){ showError('Ingresa tu código de seguimiento.'); return; }
    if(!(window.LUNA_DATA && LUNA_DATA.trackOrder)){ showError('El seguimiento no está disponible ahora. Inténtalo más tarde.'); return; }
    showLoading();
    try{ history.replaceState(null,'', location.pathname+'?codigo='+encodeURIComponent(code)); }catch(e){}
    LUNA_DATA.trackOrder(code).then(function(data){ render(data, code); }).catch(function(){ showError(); });
  }

  function start(){
    try{ if(window.LUNA){ LUNA.buildNav(''); LUNA.buildFooter(); } }catch(e){}
    var form=document.getElementById('track-form'), input=document.getElementById('track-input');
    if(form && input){ form.addEventListener('submit', function(ev){ ev.preventDefault(); doTrack(input.value); }); }
    try{ var c=new URLSearchParams(location.search).get('codigo'); if(c){ if(input) input.value=c; doTrack(c); } }catch(e){}
  }

  if (document.readyState !== 'loading') start(); else addEventListener('DOMContentLoaded', start);
})();
