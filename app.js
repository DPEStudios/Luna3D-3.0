/* ============================================================
   LUNA3D — App compartida (cosmos, carrito, chrome, micro-UX)
   ============================================================ */
(function(){
"use strict";

/* ---------- ICONS ---------- */
const I = {
  cart:'<path d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.4 5M7 13l-2 4h12" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.4" fill="currentColor"/><circle cx="17" cy="20" r="1.4" fill="currentColor"/>',
  heart:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
  heartFill:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
 
  star:'<path d="M12 2.5l2.6 6.1 6.6.5-5 4.3 1.5 6.5L12 16.9 6.3 20.4l1.5-6.5-5-4.3 6.6-.5z" fill="currentColor"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  plus:'<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>',
  minus:'<path d="M5 12h14" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>',
  x:'<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>',
  trash:'<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  check:'<path d="M4 12l5 5 11-11" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  search:'<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  home:'<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  gem:'<path d="M6 3h12l3 5-9 13L3 8z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M3 8h18M9 3L6 21M15 3l3 18" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/>',
  toy:'<circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M12 12v9M8 16h8M9 21h6" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round"/>',
  plant:'<path d="M12 21v-7M12 14c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  shield:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  truck:'<path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.7" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="17" cy="18" r="1.7" stroke="currentColor" stroke-width="1.6" fill="none"/>',
  spark:'<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  cube:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M12 21V12M12 12l8-4.5M12 12L4 7.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor"/>',
  facebook:'<path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  whatsapp:'<path d="M4 20l1.4-4.2A7.5 7.5 0 1 1 8.2 18.6L4 20z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="M9.2 9c-.2 1 .3 2.3 1.3 3.3s2.3 1.5 3.3 1.3c.5-.1.8-.7.6-1.2l-.9-1.1-1.3.5-1.4-1.4.5-1.3-1.1-.9c-.5-.2-1.1.1-1.2.6z" fill="currentColor"/>',
  tiktok:'<path d="M14 4c.4 2.2 1.8 3.6 4 3.9v2.8c-1.5 0-2.9-.5-4-1.3v5.4a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .9.1v2.9a2.4 2.4 0 1 0 1.7 2.3V4z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>',
  youtube:'<path d="M22 12s0-3.4-.4-5c-.2-.8-.8-1.4-1.6-1.6C18.4 5 12 5 12 5s-6.4 0-8 .4c-.8.2-1.4.8-1.6 1.6C2 8.6 2 12 2 12s0 3.4.4 5c.2.8.8 1.4 1.6 1.6 1.6.4 8 .4 8 .4s6.4 0 8-.4c.8-.2 1.4-.8 1.6-1.6.4-1.6.4-5 .4-5z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>',
  arrowUp:'<path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  refresh:'<path d="M4 9a8 8 0 0 1 13.7-3.7L20 7M20 7V3M20 7h-4M20 15a8 8 0 0 1-13.7 3.7L4 17M4 17v4M4 17h4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  bag:'<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  globe:'<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  gear:'<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  help:'<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7" fill="none"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  sun:'<circle cx="12" cy="12" r="4.4" fill="currentColor"/><path d="M12 2.6v2.1M12 19.3v2.1M2.6 12h2.1M19.3 12h2.1M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" fill="currentColor"/>',
  moon_minimal: '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/><path d="M11 7.5a4.5 4.5 0 0 0 0 9 3 3 0 0 1 0-9z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  sun_minimal: '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
  chevronRight:'<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
};
const svg = (n,cls)=>`<svg viewBox="0 0 24 24" class="${cls||''}" aria-hidden="true">${I[n]||''}</svg>`;
window.LUNA_I = I; window.LUNA_svg = svg;

/* logo src — uses inlined blob (standalone) or relative path (multipage) */
const LOGO = k => (window.__resources && window.__resources['logo_'+k]) || ('assets/logo_'+k+'.png');
/* en modo día el logo usa la variante con "Luna" apagada (luna diurna) */
const themeLogoKey = () => (localStorage.getItem('luna_theme')||'dark')==='light' ? 'color_day' : 'color';
function updateBrandLogos(){
  const src = LOGO(themeLogoKey());
  document.querySelectorAll('img.brand-logo').forEach(img=>{ img.src = src; });
}

/* ---------- COSMIC STARFIELD + CONSTELLATIONS ---------- */
function initStars(){
  const c = document.getElementById('stars'); if(!c) return;
  const ctx = c.getContext('2d');
  let w,h,dpr,stars=[],links=[];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function build(){
    dpr = Math.min(devicePixelRatio||1,2);
    w = c.width = innerWidth*dpr; h = c.height = innerHeight*dpr;
    c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px';
    const count = Math.round((innerWidth*innerHeight)/9000);
    stars = Array.from({length:count},()=>({
      x:Math.random()*w, y:Math.random()*h,
      r:(Math.random()*1.3+.3)*dpr,
      a:Math.random()*.6+.2,
      tw:Math.random()*Math.PI*2, sp:Math.random()*.015+.004,
      bright:Math.random()<.06,
    }));
    // constellation anchor nodes
    links = Array.from({length:Math.round(count*.10)},()=>({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.12*dpr, vy:(Math.random()-.5)*.12*dpr,
    }));
  }
  function frame(){
    ctx.clearRect(0,0,w,h);
    // links
    for(const n of links){ n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>w) n.vx*=-1; if(n.y<0||n.y>h) n.vy*=-1; }
    const maxd = 150*dpr;
    for(let i=0;i<links.length;i++)for(let j=i+1;j<links.length;j++){
      const a=links[i],b=links[j], dx=a.x-b.x,dy=a.y-b.y, d=Math.hypot(dx,dy);
      if(d<maxd){ const o=(1-d/maxd)*.16;
        ctx.strokeStyle=`rgba(232,31,157,${o})`; ctx.lineWidth=dpr*.6;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
    }
    for(const n of links){ ctx.fillStyle='rgba(177,44,217,.5)';
      ctx.beginPath(); ctx.arc(n.x,n.y,1.3*dpr,0,7); ctx.fill(); }
    // stars
    for(const s of stars){ if(!reduce){ s.tw+=s.sp; }
      const a = s.a*(0.6+0.4*Math.sin(s.tw));
      ctx.fillStyle = s.bright ? `rgba(247,47,184,${a})` : `rgba(245,246,251,${a})`;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill();
    }
    if(!reduce) raf=requestAnimationFrame(frame); else { /* static single paint */ }
  }
  let raf; build(); frame();
  let to; addEventListener('resize',()=>{clearTimeout(to);to=setTimeout(()=>{cancelAnimationFrame(raf);build();if(reduce){frame();}else frame();},180);});
}

/* ---------- DAY SKY (modo día: luna pálida, nubes, pájaros) ---------- */
function buildDaySky(){
  if(document.getElementById('daysky')) return;
  const cloud = `<svg viewBox="0 0 220 80" aria-hidden="true"><g fill="currentColor">
      <ellipse cx="62" cy="50" rx="48" ry="18"/>
      <ellipse cx="105" cy="38" rx="40" ry="22"/>
      <ellipse cx="150" cy="52" rx="50" ry="16"/>
    </g></svg>`;
  const bird = `<svg viewBox="0 0 24 12" aria-hidden="true">
      <path d="M2 8.5 Q7 2.5 12 8.5 Q17 2.5 22 8.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`;
  const d = document.createElement('div');
  d.id = 'daysky';
  d.setAttribute('aria-hidden','true');
  d.innerHTML = `
    <div class="ds-sunglow"></div>
    <svg class="ds-moon" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,.6)"/>
      <circle cx="38" cy="34" r="7"   fill="rgba(178,193,219,.32)"/>
      <circle cx="61" cy="56" r="9"   fill="rgba(178,193,219,.26)"/>
      <circle cx="44" cy="68" r="5"   fill="rgba(178,193,219,.3)"/>
      <circle cx="66" cy="32" r="4.5" fill="rgba(178,193,219,.24)"/>
    </svg>
    <div class="ds-cloud c1">${cloud}</div>
    <div class="ds-cloud c2">${cloud}</div>
    <div class="ds-cloud c3">${cloud}</div>
    <div class="ds-cloud c4">${cloud}</div>
    <div class="ds-cloud c5">${cloud}</div>
    <div class="ds-birds g1">
      <span class="bird b1">${bird}</span>
      <span class="bird b2">${bird}</span>
      <span class="bird b3">${bird}</span>
    </div>
    <div class="ds-birds g2">
      <span class="bird b1">${bird}</span>
      <span class="bird b2">${bird}</span>
      <span class="bird b3">${bird}</span>
      <span class="bird b4">${bird}</span>
    </div>`;
  document.body.prepend(d);
}

/* ---------- SHOOTING STARS (modo noche: estrellas fugaces aleatorias) ----------
   Generador en vivo: aparición aleatoria, velocidades, trayectorias, longitud
   y brillo variados. Suave y nunca distrae del contenido. Se pausa en modo día,
   con pestaña oculta o con prefers-reduced-motion. */
function buildShootingStars(){
  if(document.getElementById('shooting-stars')) return;
  const layer = document.createElement('div');
  layer.id = 'shooting-stars';
  layer.setAttribute('aria-hidden','true');
  document.body.prepend(layer);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const rand = (min,max) => min + Math.random()*(max-min);
  const isNight = () => !document.body.classList.contains('light-mode');
  const canPlay = () => isNight() && !reduce.matches && document.visibilityState==='visible';

  let timer;
  function spawn(){
    if(!canPlay()) return;
    const star = document.createElement('span');
    star.className = 'shooting-star';

    // trayectoria: cae hacia abajo-izquierda con ángulo variable
    const angleDeg = rand(112, 152);          // 90=abajo, 180=izquierda
    const angle    = angleDeg * Math.PI/180;
    const distance = rand(velOf('dist')[0], velOf('dist')[1]);
    const dx = Math.cos(angle)*distance;       // negativo (izquierda)
    const dy = Math.sin(angle)*distance;       // positivo (abajo)

    // origen: franja superior, repartido por todo el ancho
    const startX = rand(0.30, 1.05) * innerWidth;
    const startY = rand(-0.04, 0.46) * innerHeight;
    const len     = rand(70, 168);
    const thick   = rand(1, 1.9);
    const peak    = rand(0.5, 0.9);
    const duration= rand(900, 1750);           // velocidad por estrella

    star.style.left   = startX+'px';
    star.style.top    = startY+'px';
    star.style.width  = len+'px';
    star.style.height = thick+'px';
    // translate va PRIMERO (espacio de pantalla); rotate solo orienta la estela
    star.style.transform = `translate(0,0) rotate(${angleDeg}deg)`;
    layer.appendChild(star);

    const anim = star.animate([
      { transform:`translate(0,0) rotate(${angleDeg}deg) scaleX(0)`,                          opacity:0 },
      { transform:`translate(${dx*0.16}px,${dy*0.16}px) rotate(${angleDeg}deg) scaleX(1)`,     opacity:peak,      offset:0.12 },
      { transform:`translate(${dx*0.7}px,${dy*0.7}px) rotate(${angleDeg}deg) scaleX(1)`,       opacity:peak*0.85, offset:0.7 },
      { transform:`translate(${dx}px,${dy}px) rotate(${angleDeg}deg) scaleX(0)`,               opacity:0 }
    ], { duration, easing:'cubic-bezier(.25,.6,.3,1)' });
    anim.onfinish = () => star.remove();
  }

  // densidad equilibrada: una fugaz cada ~3–6 s, a veces un par seguidas
  function loop(){
    spawn();
    if(Math.random() < 0.22){ setTimeout(spawn, rand(280, 620)); } // ráfaga doble ocasional
    timer = setTimeout(loop, rand(3000, 6000));
  }
  function start(){ clearTimeout(timer); if(canPlay()){ timer = setTimeout(loop, rand(900, 2200)); } }
  function stop(){ clearTimeout(timer); layer.querySelectorAll('.shooting-star').forEach(s=>s.remove()); }

  // velocidad/distancia (un único punto de ajuste)
  function velOf(k){ return ({ dist:[300, 620] })[k]; }

  start();
  document.addEventListener('visibilitychange', () => document.visibilityState==='visible' ? start() : stop());
  reduce.addEventListener?.('change', () => reduce.matches ? stop() : start());
  // re-evaluar al cambiar de tema (lo dispara setTheme)
  window.LUNA_shootingStars = { start, stop };
}

/* ---------- CART (localStorage) ---------- */
const CKEY='luna3d_cart';
function getCart(){ try{return JSON.parse(localStorage.getItem(CKEY))||[];}catch(e){return[];} }
function saveCart(c){ localStorage.setItem(CKEY,JSON.stringify(c)); syncCart(); }
function cartCount(){ return getCart().reduce((s,i)=>s+i.qty,0); }
function cartTotal(){ return getCart().reduce((s,i)=>s+(i.price||0)*i.qty,0); }
function addToCart(id){
  const p = PROD_BY_ID[id]; if(!p) return;
  if(p.price==null){ toast(`${p.name}: disponible próximamente`); return; }  // sin precio aún → no se vende
  const c=getCart(); const ex=c.find(i=>i.id===id);
  if(ex) ex.qty++; else c.push({id:p.id,name:p.name,price:p.price,qty:1});
  saveCart(c); toast(`${p.name} añadido al carrito`);
}
function changeQty(id,d){ const c=getCart(); const it=c.find(i=>i.id===id); if(!it)return;
  it.qty+=d; if(it.qty<=0) return saveCart(c.filter(i=>i.id!==id)); saveCart(c); }
function removeItem(id){ saveCart(getCart().filter(i=>i.id!==id)); }
window.LUNA_addToCart=addToCart;

function syncCart(){
  const n=cartCount(); document.querySelectorAll('.cart-count').forEach(el=>{
    el.textContent=n; el.classList.toggle('show',n>0); });
  renderDrawer();
}

/* ---------- WHATSAPP · venta directa (SoC: lógica pura + un único punto de cambio) ----------
   Número comercial en formato wa.me (sin "+" ni espacios). ÚNICA fuente del número:
   el footer, el botón flotante y el checkout del carrito lo reutilizan. */
const WHATSAPP_NUMERO = '56983357145';   // +56 9 8335 7145 — número real de Daniel (confirmado 2026-06-13)

/* Formatea el número legible: 56983357145 -> +56 9 8335 7145 */
function waDisplay(n){
  const m = String(n).match(/^56(9)(\d{4})(\d{4})$/);
  return m ? `+56 ${m[1]} ${m[2]} ${m[3]}` : '+' + n;
}
/* Link de chat simple (sin pedido), para footer y botón flotante */
function waChatURL(){ return `https://wa.me/${WHATSAPP_NUMERO}`; }

/* PURE: arma la URL wa.me del pedido desde el carrito y total. No toca el DOM.
   Salta ítems sin precio (defensa: no deberían existir en el carrito). */
function buildWhatsappOrder(cart, total){
  const lineas = (cart || [])
    .filter(it => it && it.price != null && !Number.isNaN(it.price))
    .map(it => `• ${it.qty}× ${it.name} — ${CLP(it.price * it.qty)}`);
  const texto = [
    '¡Hola Luna 3D! Quiero hacer este pedido:',
    '',
    ...lineas,
    '',
    `Total: ${CLP(total)}`,
    '',
    'Para coordinar la entrega te dejo mis datos:',
    'Nombre: ',
    'Comuna: ',
  ].join('\n');
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}

/* UI: abre el pedido por WhatsApp en pestaña nueva. Edge: carrito vacío (o sin
   ítems con precio) -> toast y no abre nada. */
function checkoutWhatsapp(){
  const vendibles = getCart().filter(it => it && it.price != null && !Number.isNaN(it.price));
  if(!vendibles.length){ toast('Tu carrito está vacío'); return; }
  window.open(buildWhatsappOrder(vendibles, cartTotal()), '_blank', 'noopener');
}

/* ---------- FAVORITOS (localStorage) ---------- */
const FKEY='luna3d_favs';
function getFavs(){ try{return JSON.parse(localStorage.getItem(FKEY))||[];}catch(e){return[];} }
function isFav(id){ return getFavs().includes(id); }
function favCount(){ return getFavs().length; }
function toggleFav(id,btn){
  let f=getFavs();
  const on=!f.includes(id);
  f = on ? f.concat(id) : f.filter(x=>x!==id);
  localStorage.setItem(FKEY,JSON.stringify(f));
  if(btn){ btn.classList.toggle('on',on); btn.innerHTML=svg(on?'heartFill':'heart'); }
  toast(on?'Añadido a favoritos':'Quitado de favoritos');
  syncFavs();
}
function syncFavs(){
  const n=favCount();
  document.querySelectorAll('.fav-count').forEach(el=>{ el.textContent=n; el.classList.toggle('show',n>0); });
  renderFavPopover();
}

/* ---------- CHROME: NAV ---------- */
const escapeHTML = str => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const MEGA_COLLECTIONS = [
  {id:'all',      label:'Todos los productos'},
  {id:'featured', label:'Destacados', test:p=>p.featured},
  {id:'new',      label:'Novedades',  test:p=>p.tag==='Nuevo'},
];

function buildNav(active){
  const mount=document.getElementById('nav-mount'); if(!mount)return;
  
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';

  mount.innerHTML=`
  <header class="nav" id="nav">
    <div class="wrap">
      <div class="nav-left">
        <a class="nav-logo" href="index.html" aria-label="Luna3D inicio">
          <img class="brand-logo" src="${LOGO(themeLogoKey())}" alt="Luna3D">
        </a>

        <button class="btn-catalog" id="mega-trigger" aria-expanded="false" aria-label="Desplegar catálogo">
          ${svg('cube')}
          <span>Catálogo</span>
        </button>

        <div class="nav-pop-wrap">
          <button class="btn-fav" id="fav-btn" aria-label="Favoritos">
            ${svg('heart')}
            <span>Favoritos</span>
          </button>
          <div class="nav-popover" id="fav-popover" role="status">
            <b>Favoritos</b>
            <div id="fav-popover-body">No tienes favoritos guardados</div>
          </div>
        </div>
      </div>

      <div class="nav-search">
        ${svg('search')}
        <input type="text" id="nav-search-input" placeholder="" value="${escapeHTML(initialSearch)}" aria-label="Buscar productos">
      </div>

      <div class="nav-actions">
        <button id="theme-switch-toggle" class="theme-switch-toggle" aria-label="Cambiar tema" aria-pressed="false">
          <span class="tst-knob">
            <span class="tst-icon tst-icon-moon">${svg('moon_minimal')}</span>
            <span class="tst-icon tst-icon-sun">${svg('sun_minimal')}</span>
          </span>
        </button>

        <div class="nav-pop-wrap">
          <button class="icon-btn" id="profile-btn" aria-label="Mi Perfil">
            ${svg('user')}
          </button>
          <div class="nav-popover compact" id="profile-popover">
            <button data-auth-action="login">Iniciar sesión</button>
            <button data-auth-action="register">Crear cuenta</button>
          </div>
        </div>
        <div class="nav-pop-wrap">
          <button class="icon-btn" id="orders-btn" aria-label="Mis Compras">
            ${svg('bag')}
          </button>
          <div class="nav-popover compact" id="orders-popover">Debes iniciar sesión para ver tus compras</div>
        </div>
        <button class="icon-btn" id="notif-btn" aria-label="Notificaciones">
          ${svg('bell')}
          <span class="action-dot"></span>
        </button>
        <button class="icon-btn" id="cart-btn" aria-label="Carrito">
          ${svg('cart')}
          <span class="cart-count">0</span>
        </button>
        <button class="burger" id="burger" aria-label="Menú">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <!-- MEGAMENU PANEL -->
  <div id="megamenu-panel" class="megamenu-panel">
    <div class="megamenu-content">
      <div class="mega-col-cats" id="mega-cats"></div>
      <div class="mega-col-subs" id="mega-subs"></div>
      <div class="mega-col-prods">
        <h3 id="mega-prods-title">Mostrando: Categoría 1 > Favoritos del staff</h3>
        <div class="mega-prods-grid" id="mega-prods"></div>
      </div>
    </div>
    <div class="mega-footer">
      <a class="mega-footer-link" href="catalogo.html">Ver todo el catálogo ${svg('arrow')}</a>
    </div>
  </div>

  <!-- FLOATING SIDEBAR MENU -->
  <div id="sidebar-scrim" class="sidebar-scrim"></div>
  <aside id="sidebar-menu" class="sidebar-menu" aria-label="Menú de navegación">
    <!-- Acciones de cuenta: solo visibles en tablet/celular, donde los íconos del header se ocultan -->
    <div class="sidebar-account">
      <span class="sidebar-section-title">Cuenta</span>
      <a href="#" class="sb-account-item" id="sb-login-link">${svg('user')} <span>Iniciar sesión</span></a>
      <a href="#" class="sb-account-item" id="sb-register-link">${svg('spark')} <span>Crear cuenta</span></a>
      <a href="#" class="sb-account-item" id="sb-fav-link">${svg('heart')} <span>Favoritos</span><span class="sb-badge fav-count">0</span></a>
      <a href="#" class="sb-account-item" id="sb-orders-link">${svg('bag')} <span>Mis compras</span></a>
      <a href="#" class="sb-account-item" id="sb-notif-link">${svg('bell')} <span>Notificaciones</span><span class="sb-dot"></span></a>
    </div>

    <nav class="sidebar-links">
      <a href="#" id="sidebar-history-link">${svg('shield')} Historial</a>
      <a href="index.html#nosotros" id="sidebar-about-link">Sobre Nosotros</a>
      <a href="index.html#faq">Preguntas Frecuentes</a>
      <a href="mailto:contacto@luna3d.cl">Contacto</a>
      <a href="#">Cambios y Garantía</a>
      <a href="#">Términos y Condiciones</a>
    </nav>
    
    <div class="sidebar-theme-section">
      <span class="sidebar-section-title">Tema</span>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;padding:0 4px;">
        <span class="muted" id="sidebar-theme-label" style="font-size:14px;font-weight:500;">Oscuro</span>
        <button id="sidebar-theme-toggle" class="theme-switch-toggle" aria-label="Cambiar tema" aria-pressed="false">
          <span class="tst-knob">
            <span class="tst-icon tst-icon-moon">${svg('moon_minimal')}</span>
            <span class="tst-icon tst-icon-sun">${svg('sun_minimal')}</span>
          </span>
        </button>
      </div>
    </div>

    <div class="sidebar-secondary">
      <a href="#" class="sec-link" id="sidebar-settings-link">
        ${svg('gear')} Ajustes
      </a>
      <a href="#" class="sec-link" id="sidebar-help-link">
        ${svg('help')} Centro de ayuda
      </a>
      <a href="#" class="sec-link" id="sidebar-lang-link">
        ${svg('globe')} Idioma · ES
      </a>
    </div>
  </aside>
  `;

  // --- Scroll Effects ---
  const nav=document.getElementById('nav');
  const onScroll=()=>nav.classList.toggle('scrolled',scrollY>20); onScroll();
  addEventListener('scroll',onScroll,{passive:true});

  // --- Cart Trigger ---
  document.getElementById('cart-btn').onclick=openDrawer;
  
  // --- Profile / quick account triggers ---
  document.getElementById('profile-btn').onclick=()=>openAuth('login');
  document.querySelectorAll('[data-auth-action]').forEach(btn=>{
    btn.onclick=e=>{ e.preventDefault(); openAuth(btn.dataset.authAction); };
  });
  const ordersBtn=document.getElementById('orders-btn');
  if(ordersBtn) ordersBtn.onclick=()=>toast('Debes iniciar sesión para ver tus compras');

  // --- Sidebar Logic ---
  const burger = document.getElementById('burger');
  const sidebar = document.getElementById('sidebar-menu');
  const scrim = document.getElementById('sidebar-scrim');
  const sidebarClose = document.getElementById('sidebar-close');

  function openSidebar() {
    sidebar.classList.add('open');
    scrim.classList.add('open');
    burger.classList.add('active');
    // Close megamenu if open
    closeMega();
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    scrim.classList.remove('open');
    burger.classList.remove('active');
  }

  if (burger && sidebar && scrim) {
    burger.onclick = e => {
      e.stopPropagation();
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    };
    scrim.onclick = closeSidebar;
    if (sidebarClose) sidebarClose.onclick = closeSidebar;
  }

  // Sidebar link helpers
  const sidebarCatLink = document.getElementById('sidebar-cat-link');
  if (sidebarCatLink) {
    sidebarCatLink.onclick = () => closeSidebar();
  }
  const sidebarAboutLink = document.getElementById('sidebar-about-link');
  if (sidebarAboutLink) {
    sidebarAboutLink.onclick = () => {
      closeSidebar();
      const aboutEl = document.getElementById('nosotros');
      if (aboutEl) aboutEl.scrollIntoView();
    };
  }

  // Secondary sidebar links toasts
  const setLinkToast = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.onclick = e => { e.preventDefault(); toast(msg); };
  };
  setLinkToast('sidebar-settings-link', 'Ajustes de cuenta próximamente');
  setLinkToast('sidebar-help-link', 'Centro de ayuda próximamente');
  setLinkToast('sidebar-lang-link', 'Idioma: Español (ES)');
  setLinkToast('sidebar-history-link', 'Inicia sesión para acceder a tu historial');

  // --- Acciones de cuenta del sidebar (espejo de los íconos ocultos en móvil/tablet) ---
  const bindSidebarAction = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = e => { e.preventDefault(); closeSidebar(); fn(); };
  };
  bindSidebarAction('sb-login-link',    () => openAuth('login'));
  bindSidebarAction('sb-register-link', () => openAuth('register'));
  bindSidebarAction('sb-fav-link',      () => { const n=getFavs().length; toast(n>0 ? ('Tienes '+n+' favorito'+(n>1?'s':'')) : 'No tienes favoritos guardados'); });
  bindSidebarAction('sb-orders-link',   () => toast('Debes iniciar sesión para ver tus compras'));
  bindSidebarAction('sb-notif-link',    () => toast('No tienes notificaciones nuevas'));

  // --- Theme Switcher Logic ---
  const headerToggle = document.getElementById('theme-switch-toggle');
  const sidebarToggle = document.getElementById('sidebar-theme-toggle');
  const sidebarLabel = document.getElementById('sidebar-theme-label');

  const currentTheme = localStorage.getItem('luna_theme') || 'dark';
  setTheme(currentTheme);

  function setTheme(theme) {
    const isLight = theme === 'light';
    if (isLight) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }

    // Update header switch state
    if (headerToggle) {
      headerToggle.classList.toggle('active', isLight);
      headerToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    }

    // Update sidebar switch state
    if (sidebarToggle) {
      sidebarToggle.classList.toggle('active', isLight);
      sidebarToggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    }

    // Update sidebar label text
    if (sidebarLabel) {
      sidebarLabel.textContent = isLight ? 'Claro' : 'Oscuro';
    }

    localStorage.setItem('luna_theme', theme);
    updateBrandLogos();
    // arrancar/pausar las estrellas fugaces según el tema activo
    if (window.LUNA_shootingStars) {
      isLight ? window.LUNA_shootingStars.stop() : window.LUNA_shootingStars.start();
    }
  }

  // Bind click event for both switches
  if (headerToggle) {
    headerToggle.onclick = () => {
      const activeTheme = localStorage.getItem('luna_theme') || 'dark';
      setTheme(activeTheme === 'light' ? 'dark' : 'light');
    };
  }

  if (sidebarToggle) {
    sidebarToggle.onclick = () => {
      const activeTheme = localStorage.getItem('luna_theme') || 'dark';
      setTheme(activeTheme === 'light' ? 'dark' : 'light');
    };
  }

  // --- Megamenu Logic (Hover to Open + Vibrate) ---
  const trigger = document.getElementById('mega-trigger');
  const panel = document.getElementById('megamenu-panel');
  
  let activeCat = (CATEGORIES[0] && CATEGORIES[0].id) || '';
  let activeCol = 'all';
  let megaTimeout;

  function openMega() {
    clearTimeout(megaTimeout);
    if (panel && !panel.classList.contains('open')) {
      panel.classList.add('open');
      trigger.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      renderMegamenu();
      closeSidebar();
    }
  }

  function closeMega() {
    clearTimeout(megaTimeout);
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      trigger.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  function scheduleCloseMega() {
    clearTimeout(megaTimeout);
    megaTimeout = setTimeout(closeMega, 200);
  }

  if (trigger && panel) {
    // Detectar si estamos en la página de catálogo
    const isOnCatalog = location.pathname.endsWith('catalogo.html') ||
                        location.href.includes('catalogo.html');

    // En catálogo: marca el botón como página activa (hover del megamenú sigue activo)
    if (isOnCatalog) trigger.classList.add('catalog-active');

    // Hover del megamenú activo en todas las páginas, incluyendo catalogo.html
    trigger.onmouseenter = () => { openMega(); };
    trigger.onmouseleave = scheduleCloseMega;
    panel.onmouseenter = () => { clearTimeout(megaTimeout); };
    panel.onmouseleave = scheduleCloseMega;

    // Click navega al catálogo completo
    trigger.onclick = e => {
      e.stopPropagation();
      location.href = 'catalogo.html';
    };
  }

  // Close megamenu on outside clicks
  document.addEventListener('click', e => {
    if (panel && panel.classList.contains('open')) {
      if (!panel.contains(e.target) && e.target !== trigger && !trigger.contains(e.target)) {
        closeMega();
      }
    }
  });

  // Escape key closes both
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMega();
      closeSidebar();
    }
  });

  function renderMegamenu() {
    const catsEl = document.getElementById('mega-cats');
    const subsEl = document.getElementById('mega-subs');
    const prodsEl = document.getElementById('mega-prods');
    const titleEl = document.getElementById('mega-prods-title');
    if (!catsEl || !subsEl || !prodsEl || !titleEl) return;

    // Render Categories
    catsEl.innerHTML = CATEGORIES.map(c => `
      <div class="mega-cat-item ${c.id === activeCat ? 'active' : ''}" data-cat="${c.id}">
        <span>${c.name}</span>
        ${svg('chevronRight')}
      </div>
    `).join('');

    // Render Collections (Subcategories)
    subsEl.innerHTML = MEGA_COLLECTIONS.map(col => `
      <div class="mega-sub-item ${col.id === activeCol ? 'active' : ''}" data-col="${col.id}">
        <span>${col.label}</span>
      </div>
    `).join('');

    renderProdsAndTitle();

    // Hover listeners
    catsEl.onmouseover = e => {
      const item = e.target.closest('.mega-cat-item');
      if (!item) return;
      const catId = item.dataset.cat;
      if (catId !== activeCat) {
        activeCat = catId;
        catsEl.querySelectorAll('.mega-cat-item').forEach(el => el.classList.toggle('active', el.dataset.cat === activeCat));
        renderProdsAndTitle();
      }
    };

    // Click en categoría principal → navegar al catálogo filtrado por cat
    catsEl.onclick = e => {
      const item = e.target.closest('.mega-cat-item');
      if (!item) return;
      location.href = `catalogo.html?cat=${encodeURIComponent(item.dataset.cat)}`;
    };

    subsEl.onmouseover = e => {
      const item = e.target.closest('.mega-sub-item');
      if (!item) return;
      const colId = item.dataset.col;
      if (colId !== activeCol) {
        activeCol = colId;
        subsEl.querySelectorAll('.mega-sub-item').forEach(el => el.classList.toggle('active', el.dataset.col === activeCol));
        renderProdsAndTitle();
      }
    };

    function renderProdsAndTitle() {
      const catData = CATEGORIES.find(c => c.id === activeCat);
      const colData = MEGA_COLLECTIONS.find(col => col.id === activeCol);
      if (!catData || !colData) return;

      titleEl.innerHTML = `Mostrando: <strong>${catData.name}</strong> <span class="mega-sep">&gt;</span> <span>${colData.label}</span>`;

      let filtered = PRODUCTS.filter(p => p.cat === activeCat);
      if (colData.test) {
        filtered = filtered.filter(colData.test);
      }

      if (filtered.length === 0) {
        prodsEl.innerHTML = `<div class="mega-empty-state">No hay productos en esta selección.</div>`;
      } else {
        prodsEl.innerHTML = filtered.map(p => `
          <a class="mega-prod-card" href="producto.html?id=${p.id}">
            <div class="mp-icon-box">
              ${svg('cube')}
            </div>
            <span class="mp-name">${p.name}</span>
          </a>
        `).join('');
      }
    }
  }

  // --- Search Bar Functionality ---
  const searchInput = document.getElementById('nav-search-input');
  if (searchInput) {
    initSearchTyping(searchInput);
    searchInput.oninput = () => {
      const query = searchInput.value.toLowerCase().trim();
      const ev = new CustomEvent('luna-search', { detail: query });
      window.dispatchEvent(ev);
    };

    searchInput.onkeydown = e => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        const onHome = !!document.getElementById('filter-cats');
        if (onHome) {
          const catEl = document.getElementById('catalogo');
          if (catEl) catEl.scrollIntoView();
        } else {
          location.href = `index.html?search=${encodeURIComponent(query)}#catalogo`;
        }
      }
    };
  }

  // --- Favorites Button Click ---
  const favBtn = document.getElementById('fav-btn');
  if (favBtn) {
    favBtn.onclick = () => {
      renderFavPopover();
      const favs=getFavs();
      if(!favs.length) toast('No tienes favoritos guardados');
    };
  }

  // Sync badges after building
  setTimeout(() => {
    syncCart();
    syncFavs();
    renderFavPopover();
  }, 10);
}

function initSearchTyping(input){
  if(input.value) return;
  const words = ['Lámpara','Macetero','Regalo','Pokémon','Dragon Ball','Mario Bros','Decoración','Figura Anime','Personalizado','Groot','Stitch','Portalápices','Organizador','Geek','Gamer','Hogar','Oficina','Cumpleaños','Coleccionable','Impresión 3D'];
  let wi=0, ci=0, del=false, pause=0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick=()=>{
    if(document.activeElement===input || input.value || reduce) return;
    const w=words[wi];
    if(pause>0){ pause--; return; }
    ci += del ? -1 : 1;
    input.placeholder = `Buscar "${w.slice(0, Math.max(ci,0))}"`;
    if(!del && ci>=w.length){ del=true; pause=30; } // Pause longer when word is fully typed (~5.7s)
    if(del && ci<=0){ del=false; wi=(wi+1)%words.length; pause=20; } // Pause longer when word is fully deleted (~3.8s)
  };
  tick();
  setInterval(tick, 150 + Math.round(Math.random()*80)); // Slow down typing animation speed
}

function renderFavPopover(){
  const body=document.getElementById('fav-popover-body'); if(!body)return;
  const favs=getFavs().map(id=>PROD_BY_ID[id]).filter(Boolean).slice(0,4);
  if(!favs.length){ body.innerHTML='No tienes favoritos guardados'; return; }
  body.innerHTML=favs.map(p=>
    `<a class="fav-pop-item" href="producto.html?id=${p.id}">`+
    (p.img ? `<img class="fav-pop-thumb" src="${p.img}" alt="${escapeHTML(p.name)}" loading="lazy">` : `<div class="fav-pop-thumb fav-pop-thumb--ph">${svg('cube')}</div>`)+
    `<div class="fav-pop-info"><span>${escapeHTML(p.name)}</span><b>${CLP(p.price)}</b></div>`+
    `</a>`).join('')+
    `<a class="fav-pop-all" href="catalogo.html">Ver catálogo ${svg('arrow')}</a>`;
}


/* ---------- CHROME: FOOTER ---------- */
function buildFooter(){
  const mount=document.getElementById('footer-mount'); if(!mount)return;
  mount.innerHTML=`
  <footer class="footer">
    <div class="wrap">

      <!-- NEWSLETTER (sección destacada) -->
      <section class="footer-newsletter" aria-labelledby="nf-title">
        <div class="fn-text">
          <span class="fn-kicker">${svg('spark')} Comunidad Luna3D</span>
          <h3 class="fn-title" id="nf-title">Suscríbete a nuestro newsletter</h3>
          <p class="fn-sub">Recibe novedades, ofertas exclusivas, lanzamientos y tendencias del mundo de la impresión 3D.</p>
        </div>
        <form class="newsletter-form" id="newsletter-form" novalidate>
          <div class="nf-field">
            <input type="email" id="newsletter-email" placeholder="tu@email.cl" aria-label="Correo electrónico" aria-describedby="newsletter-msg" autocomplete="email">
            <button class="btn primary nf-btn" type="submit">Suscribirme ${svg('arrow')}</button>
          </div>
          <p class="nf-msg" id="newsletter-msg" role="status" aria-live="polite"></p>
        </form>
      </section>

      <!-- GRID PRINCIPAL -->
      <div class="footer-top">
        <div class="footer-brand">
          <img class="brand-logo" src="${LOGO(themeLogoKey())}" alt="Luna3D">
          <p>La revolución de la impresión 3D mediante optimización radical de modelos y un ecosistema completamente autónomo.</p>
        </div>
        <div class="footer-col">
          <h4>Enlaces Útiles</h4>
          <ul>
            <li><a href="index.html#nosotros">Sobre Nosotros</a></li>
            <li><a href="#">Términos y Condiciones</a></li>
            <li><a href="#">Política de Devolución</a></li>
            <li><a href="#">Seguimiento de Envío</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Catálogo</h4>
          <ul>
            <li><a href="index.html#catalogo">Todos los productos</a></li>
            <li><a href="index.html#catalogo">Categorías</a></li>
            <li><a href="index.html#catalogo">Más vendidos</a></li>
            <li><a href="index.html#catalogo">Nuevos lanzamientos</a></li>
          </ul>
        </div>
      </div>

      <!-- REDES SOCIALES (protagonismo) -->
      <section class="footer-social-band" aria-labelledby="fsb-title">
        <div class="fsb-head">
          <h4 class="fsb-title" id="fsb-title">Síguenos en redes</h4>
          <p class="fsb-sub">Inspiración, lanzamientos y el detrás de cámara de cada impresión.</p>
        </div>
        <div class="footer-social">
          <a class="soc soc-ig" href="https://instagram.com/luna3d" target="_blank" rel="noopener" aria-label="Instagram"><span class="soc-ico">${svg('instagram')}</span><span class="soc-txt"><span class="soc-name">Instagram</span><span class="soc-handle">@luna3d</span></span></a>
          <a class="soc soc-fb" href="https://facebook.com/luna3d" target="_blank" rel="noopener" aria-label="Facebook"><span class="soc-ico">${svg('facebook')}</span><span class="soc-txt"><span class="soc-name">Facebook</span><span class="soc-handle">/luna3d</span></span></a>
          <a class="soc soc-tt" href="https://tiktok.com/@luna3d" target="_blank" rel="noopener" aria-label="TikTok"><span class="soc-ico">${svg('tiktok')}</span><span class="soc-txt"><span class="soc-name">TikTok</span><span class="soc-handle">@luna3d</span></span></a>
          <a class="soc soc-yt" href="https://youtube.com/@luna3d" target="_blank" rel="noopener" aria-label="YouTube"><span class="soc-ico">${svg('youtube')}</span><span class="soc-txt"><span class="soc-name">YouTube</span><span class="soc-handle">@luna3d</span></span></a>
          <a class="soc soc-wa" href="${waChatURL()}" target="_blank" rel="noopener" aria-label="WhatsApp"><span class="soc-ico">${svg('whatsapp')}</span><span class="soc-txt"><span class="soc-name">WhatsApp</span><span class="soc-handle">${waDisplay(WHATSAPP_NUMERO)}</span></span></a>
        </div>
      </section>

      <!-- INFORMACIÓN LEGAL -->
      <div class="footer-bottom">
        <div class="fb-left">
          <img class="brand-logo" src="${LOGO(themeLogoKey())}" alt="Luna3D">
          <span>© 2026 Estrella 3D SpA. Todos los derechos reservados.</span>
        </div>
        <div class="fb-legal">
          <a href="#">Términos</a><span class="dot">·</span>
          <a href="#">Privacidad</a><span class="dot">·</span>
          <span>v2.0.0 — Hecho en Chile 🇨🇱</span>
        </div>
      </div>
    </div>
  </footer>`;

  // --- Newsletter: validación elegante en vivo ---
  const form=document.getElementById('newsletter-form');
  if(form){
    const email=document.getElementById('newsletter-email');
    const msg=document.getElementById('newsletter-msg');
    const isValid=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    const setMsg=(text,type)=>{ msg.textContent=text||''; msg.className='nf-msg'+(type?' '+type:''); };
    email.addEventListener('input',()=>{ if(email.classList.contains('invalid') && isValid(email.value.trim())){ email.classList.remove('invalid'); setMsg('',''); } });
    form.onsubmit=e=>{
      e.preventDefault();
      const v=email.value.trim();
      if(!v){ email.classList.add('invalid'); setMsg('Ingresa tu correo para suscribirte.','err'); email.focus(); return; }
      if(!isValid(v)){ email.classList.add('invalid'); setMsg('Ese correo no parece válido. Revísalo e inténtalo de nuevo.','err'); email.focus(); return; }
      email.classList.remove('invalid');
      setMsg('¡Listo! Te sumaste al universo Luna3D. ✨','ok');
      toast('Gracias por suscribirte al universo Luna3D');
      form.reset();
    };
  }
}

/* ---------- CART DRAWER ---------- */
function buildDrawer(){
  if(document.getElementById('drawer'))return;
  const d=document.createElement('div');
  d.innerHTML=`
  <div class="drawer-scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Carrito de compras">
    <div class="drawer-head"><h3>Tu carrito</h3><button class="icon-btn" id="drawer-close" aria-label="Cerrar">${svg('x')}</button></div>
    <div class="drawer-body" id="drawer-body"></div>
    <div class="drawer-foot" id="drawer-foot"></div>
  </aside>`;
  document.body.appendChild(d);
  document.getElementById('scrim').onclick=closeDrawer;
  document.getElementById('drawer-close').onclick=closeDrawer;
}
function openDrawer(){ buildDrawer(); renderDrawer();
  document.getElementById('scrim').classList.add('open');
  document.getElementById('drawer').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeDrawer(){
  const s=document.getElementById('scrim'),dr=document.getElementById('drawer');
  if(s)s.classList.remove('open'); if(dr)dr.classList.remove('open');
  document.body.style.overflow='';
}
function renderDrawer(){
  const body=document.getElementById('drawer-body'),foot=document.getElementById('drawer-foot');
  if(!body)return;
  const c=getCart();
  if(!c.length){
    body.innerHTML=`<div class="drawer-empty"><div class="de-ico">${svg('cart')}</div><div><b style="display:block;color:var(--star);font-family:var(--font-display);font-size:17px;margin-bottom:6px;">Tu carrito está vacío</b>Explora el catálogo y suma piezas únicas.</div><a class="btn primary" href="index.html#catalogo">Ir al catálogo ${svg('arrow')}</a></div>`;
    foot.innerHTML=''; return;
  }
  body.innerHTML=c.map(it=>`
    <div class="cart-item">
      <div class="ci-img"></div>
      <div class="ci-info">
        <b>${it.name}</b>
        <div class="ci-price">${CLP(it.price)}</div>
        <div class="ci-qty">
          <button onclick="LUNA.changeQty('${it.id}',-1)" aria-label="Menos">${svg('minus')}</button>
          <span>${it.qty}</span>
          <button onclick="LUNA.changeQty('${it.id}',1)" aria-label="Más">${svg('plus')}</button>
        </div>
      </div>
      <button class="ci-remove" onclick="LUNA.removeItem('${it.id}')" aria-label="Quitar">${svg('trash')}</button>
    </div>`).join('');
  foot.innerHTML=`
    <div class="dtotal"><span>Total</span><b>${CLP(cartTotal())}</b></div>
    <button class="btn primary block" onclick="LUNA.checkoutWhatsapp()">Pedir por WhatsApp ${svg('whatsapp')}</button>
    <button class="btn ghost block" disabled title="Pago con tarjeta — disponible próximamente">Pagar con tarjeta · pronto</button>`;
}

/* ---------- AUTH MODAL (UI lista; backend pendiente) ---------- */
let authMode='login';
function buildAuth(){
  if(document.getElementById('auth-modal'))return;
  const w=document.createElement('div');
  w.innerHTML=`
  <div class="auth-scrim" id="auth-scrim"></div>
  <div class="auth-modal" id="auth-modal" role="dialog" aria-modal="true" aria-label="Cuenta">
    <button class="auth-close" id="auth-close" aria-label="Cerrar">${svg('x')}</button>
    <div class="auth-brand"><img class="brand-logo" src="${LOGO(themeLogoKey())}" alt="Luna3D"></div>
    <div class="auth-tabs">
      <button data-tab="login" class="active">Ingresar</button>
      <button data-tab="register">Crear cuenta</button>
    </div>
    <div class="auth-providers">
      <button type="button" data-provider="Google">Continuar con Google</button>
      <button type="button" data-provider="Facebook">Continuar con Facebook</button>
      <button type="button" data-provider="Correo">Continuar con correo</button>
    </div>
    <form id="auth-form" class="auth-form" novalidate>
      <label class="af-name"><span>Nombre</span><input type="text" name="name" autocomplete="name" placeholder="Tu nombre"></label>
      <label><span>Correo</span><input type="email" name="email" required autocomplete="email" placeholder="tucorreo@ejemplo.cl"></label>
      <label><span>Contraseña</span><input type="password" name="password" required autocomplete="current-password" placeholder="••••••••"></label>
      <button type="submit" class="btn primary block" id="auth-submit">Ingresar</button>
    </form>
    <p class="auth-note">Pronto podrás guardar tus favoritos, direcciones y pedidos en tu cuenta.</p>
  </div>`;
  document.body.appendChild(w);
  document.getElementById('auth-scrim').onclick=closeAuth;
  document.getElementById('auth-close').onclick=closeAuth;
  w.querySelectorAll('.auth-tabs button').forEach(b=>b.onclick=()=>switchAuth(b.dataset.tab));
  w.querySelectorAll('[data-provider]').forEach(b=>b.onclick=()=>toast(`${b.dataset.provider}: conexión próximamente`));
  document.getElementById('auth-form').onsubmit=e=>{e.preventDefault();closeAuth();
    toast(authMode==='login'?'Inicio de sesión en camino — pronto lo activamos':'Registro en camino — pronto lo activamos');};
}
function switchAuth(mode){
  authMode=mode; buildAuth();
  document.querySelectorAll('.auth-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===mode));
  const nameField=document.querySelector('#auth-form .af-name');
  if(nameField) nameField.style.display = mode==='register'?'flex':'none';
  const sub=document.getElementById('auth-submit'); if(sub) sub.textContent = mode==='register'?'Crear cuenta':'Ingresar';
}
function openAuth(mode){ buildAuth(); switchAuth(mode||'login');
  document.getElementById('auth-scrim').classList.add('open');
  document.getElementById('auth-modal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAuth(){
  const s=document.getElementById('auth-scrim'),m=document.getElementById('auth-modal');
  if(s)s.classList.remove('open'); if(m)m.classList.remove('open');
  document.body.style.overflow='';
}

/* ---------- TOAST ---------- */
let toastTo;
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.className='toast';
    document.body.appendChild(t); }
  t.innerHTML=`<span class="t-ico">${svg('check')}</span>${msg}`;
  requestAnimationFrame(()=>t.classList.add('show'));
  clearTimeout(toastTo); toastTo=setTimeout(()=>t.classList.remove('show'),2400);
}

/* ---------- FLOATING ACTIONS + LOADER ---------- */
function buildFloatingActions(){
  if(document.getElementById('float-actions'))return;
  const d=document.createElement('div');
  d.id='float-actions';
  d.className='float-actions';
  d.innerHTML=`
    <a class="float-btn whatsapp-float" href="${waChatURL()}" target="_blank" rel="noopener" aria-label="WhatsApp">
      ${svg('whatsapp')}
      <span class="float-tip">¿Tienes dudas? Escríbenos por WhatsApp</span>
    </a>
    <button class="float-btn scroll-top" id="scroll-top" aria-label="Volver arriba">${svg('arrowUp')}</button>`;
  document.body.appendChild(d);
  const top=document.getElementById('scroll-top');
  const onScroll=()=>top.classList.toggle('show', scrollY>500);
  top.onclick=()=>scrollTo({top:0,behavior:'smooth'});
  onScroll();
  addEventListener('scroll',onScroll,{passive:true});
}

function buildLoader(){
  if(document.getElementById('luna-loader'))return;
  const d=document.createElement('div');
  d.id='luna-loader';
  d.className='luna-loader';
  d.innerHTML=`
    <div class="loader-orbit">
      <span class="loader-ring"></span>
      <span class="loader-spark"></span>
      <img class="brand-logo" src="${LOGO(themeLogoKey())}" alt="Luna3D">
    </div>
    <p class="loader-tag">Cargando el universo</p>`;
  document.body.appendChild(d);
  const hide=()=>setTimeout(()=>d.classList.add('hide'),520);
  if(document.readyState==='complete') hide(); else addEventListener('load',hide,{once:true});
}

/* ---------- PRODUCT CARD ---------- */
function prodMedia(p){
  return p.img
    ? `<img src="${p.img}" alt="${escapeHTML(p.name)}" loading="lazy">`
    : `<span class="ph-label">FOTO<br>${p.name}</span>`;
}
function productCard(p){
  const buyable = p.price != null;
  const cartBtn = buyable
    ? `<button class="pcart" aria-label="Añadir" onclick="LUNA.add('${p.id}',this)">${svg('plus')}</button>`
    : `<button class="pcart disabled" aria-label="Disponible próximamente" title="Disponible próximamente" disabled>${svg('plus')}</button>`;
  return `
  <article class="prod">
    <a class="pimg" href="producto.html?id=${p.id}">
      ${p.tag?`<span class="pbadge">${p.tag}</span>`:''}
      <button class="pfav ${isFav(p.id)?'on':''}" aria-label="Favorito" aria-pressed="${isFav(p.id)}" onclick="event.preventDefault();LUNA.toggleFav('${p.id}',this)">${svg(isFav(p.id)?'heartFill':'heart')}</button>
      ${prodMedia(p)}
    </a>
    <div class="pbody">
      <span class="pcat">${p.catName}</span>
      <h3 class="pname"><a href="producto.html?id=${p.id}">${p.name}</a></h3>
      <div class="pfoot">
        <span class="price">${CLP(p.price)}</span>
        ${cartBtn}
      </div>
    </div>
  </article>`;
}
function addFromCard(id,btn){
  addToCart(id);
  if(btn){ btn.classList.add('added'); btn.innerHTML=svg('check');
    setTimeout(()=>{btn.classList.remove('added');btn.innerHTML=svg('plus');},1100); }
}

/* ---------- REVEAL ON SCROLL ---------- */
function initReveal(){
  const els=document.querySelectorAll('.reveal'); if(!els.length)return;
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
  els.forEach(e=>io.observe(e));
}

/* ---------- expose + boot ---------- */
window.LUNA={ addToCart, add:addFromCard, changeQty, removeItem, openDrawer, closeDrawer,
  toggleFav, isFav, getFavs, openAuth, productCard, buildNav, buildFooter, svg, toast, CLP,
  checkoutWhatsapp, buildWhatsappOrder };

function boot(){
  buildLoader(); initStars(); buildDaySky(); buildShootingStars(); buildFloatingActions(); buildDrawer(); buildAuth(); syncCart(); syncFavs(); initReveal();
}
if(document.readyState!=='loading') boot(); else addEventListener('DOMContentLoaded',boot);
})();
