/* ============================================================
   LUNA3D — Home v3: hero + galería (poster + 6 productos) × 4 + FAQ
   El catálogo completo vive en catalogo.html
   Estructura del body (index.html):
     hero-banner  → se mantiene
     l3d-promo    → 3 imágenes con mini-carrusel (luna3d-promo.js)
     gal-1..gal-4 → galería (este archivo)
     faq          → preguntas frecuentes (estático en index.html)
     footer       → se mantiene
   ============================================================ */
(function(){
  LUNA.buildNav('home');
  LUNA.buildFooter();

  /* ---------- hero banner slider ---------- */
  (function initHeroSlider() {
    const sliderTrack = document.getElementById('hero-slider');
    const dotsEl      = document.getElementById('hero-dots');
    if (!sliderTrack || !dotsEl) return;

    const slides    = sliderTrack.querySelectorAll('.hero-slide');
    const dots      = dotsEl.querySelectorAll('.hero-dot');
    const total     = slides.length;
    let current     = 0;
    let autoTimer   = null;
    let isDragging  = false;
    let dragStartX  = 0;

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      sliderTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 5000);
    }

    dots.forEach(d => {
      d.addEventListener('click', () => {
        goTo(parseInt(d.dataset.idx, 10));
        resetAuto();
      });
    });

    sliderTrack.addEventListener('touchstart', e => {
      dragStartX = e.touches[0].clientX;
    }, { passive: true });

    sliderTrack.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - dragStartX;
      if (Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
        resetAuto();
      }
    }, { passive: true });

    sliderTrack.addEventListener('mousedown', e => {
      isDragging = true;
      dragStartX = e.clientX;
    });
    window.addEventListener('mouseup', e => {
      if (!isDragging) return;
      isDragging = false;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 40) {
        goTo(dx < 0 ? current + 1 : current - 1);
        resetAuto();
      }
    });

    sliderTrack.addEventListener('mouseenter', () => clearInterval(autoTimer));
    sliderTrack.addEventListener('mouseleave', resetAuto);

    goTo(0);
    resetAuto();
  })();

  /* ---------- estado de carga de los grids de galería ---------- */
  (function showGalleryLoading(){
    const LOAD = '<div class="empty-state" style="grid-column:1/-1;">Cargando productos…</div>';
    ['gal-nuevos','gal-vendidos','gal-regalos','gal-ofertas'].forEach(id=>{
      const el=document.getElementById(id); if(el && !el.innerHTML.trim()) el.innerHTML=LOAD;
    });
  })();

  // SVG de cámara para las tarjetas placeholder ("FOTO", fondo rayado).
  const PH_CAM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
  // Descuentos de muestra para los placeholders de Ofertas (visual, no precios reales).
  const PH_DISCOUNTS = [50, 40, 30, 35, 25, 45, 20, 55, 15, 30, 40, 25];

  /* ---------- catálogo async: Supabase (o fallback data.js) → render ---------- */
  (async function renderGallery(){
    await LUNA_DATA.bootstrap();

    // Tarjeta REAL de producto (mismo estilo que el catálogo).
    function realCard(p) {
      const img = p.img
        ? `<img src="${p.img}" alt="${p.name}" loading="lazy">`
        : `<span class="cc-ph">${LUNA.svg('cube')}</span>`;
      return `<a class="compact-card" href="producto.html?id=${p.id}">`+
        `<div class="cc-img">${img}</div>`+
        `<div class="cc-info">`+
          `<span class="cc-name">${p.name}</span>`+
          `<span class="cc-price">${CLP(p.price)}</span>`+
        `</div>`+
      `</a>`;
    }

    /* Tarjeta PLACEHOLDER inventada: fondo rayado + "FOTO".
       Si recibe discount, muestra el badge de descuento (Ofertas).
       No representa un producto real ni un precio real. */
    function phCard(discount) {
      const badge = discount ? `<span class="cc-badge">-${discount}%</span>` : '';
      const priceTxt = discount ? 'En oferta' : 'Próximamente';
      return `<div class="compact-card cc-placeholder" aria-hidden="true">`+
        `<div class="cc-img cc-ph-striped">${badge}`+
          `<span class="cc-foto">${PH_CAM}<span>FOTO</span></span>`+
        `</div>`+
        `<div class="cc-info">`+
          `<span class="cc-name">Producto Luna 3D</span>`+
          `<span class="cc-price">${priceTxt}</span>`+
        `</div>`+
      `</div>`;
    }

    /* Construye un grid SIEMPRE de 6: primero productos reales que cumplen
       el filtro, y completa con placeholders inventados hasta llegar a 6.
       opts.discounts activa los badges de descuento (bloque Ofertas). */
    function buildGrid(id, filterFn, opts) {
      const el = document.getElementById(id);
      if (!el) return;
      opts = opts || {};
      const total = opts.count || 6;
      const real = PRODUCTS.filter(filterFn).slice(0, total);
      const out = real.map(realCard);
      let k = real.length;
      while (out.length < total) {
        const disc = opts.discounts ? PH_DISCOUNTS[k % PH_DISCOUNTS.length] : null;
        out.push(phCard(disc));
        k++;
      }
      el.innerHTML = out.join('');
    }

    // Categorías "de regalo" leídas desde los datos (persona 'especial').
    const giftCats = CATEGORIES
      .filter(c => (c.personas || []).includes('especial'))
      .map(c => c.id);

    buildGrid('gal-nuevos',   p => p.tag === 'Nuevo');
    buildGrid('gal-vendidos', p => p.featured);
    buildGrid('gal-regalos',  p => giftCats.includes(p.cat));
    buildGrid('gal-ofertas',  p => p.tag === 'Oferta', { discounts: true, count: 6 });

    /* ---------- carrusel de ofertas (flechas + deslizar + indicador tipo hero) ---------- */
    (function initOffersCarousel(){
      const track  = document.getElementById('gal-ofertas');
      const wrap   = track && track.closest('.po-carousel-wrap');
      const panel  = track && track.closest('.promo-unified');
      if (!track || !wrap) return;
      const prev   = wrap.querySelector('.po-prev');
      const next   = wrap.querySelector('.po-next');
      const dotsEl = panel ? panel.querySelector('#ofertas-dots') : null;
      const cards  = () => Array.from(track.children).filter(el => !el.classList.contains('empty-state'));
      const step   = () => Math.max(track.clientWidth * 0.8, 200);
      function toCard(i){ const c = cards()[i]; if (c) track.scrollTo({ left: c.offsetLeft - track.offsetLeft, behavior:'smooth' }); }
      function buildDots(){
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        cards().forEach((_, i) => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'po-dot'; b.setAttribute('aria-label', 'Ir al producto ' + (i + 1));
          b.addEventListener('click', () => toCard(i));
          dotsEl.appendChild(b);
        });
      }
      function currentIndex(){
        const cs = cards(); if (!cs.length) return 0;
        const center = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bd = Infinity;
        cs.forEach((c, i) => { const mid = (c.offsetLeft - track.offsetLeft) + c.clientWidth / 2; const d = Math.abs(mid - center); if (d < bd){ bd = d; best = i; } });
        return best;
      }
      function update(){
        const overflow = (track.scrollWidth - track.clientWidth) > 4;
        track.classList.toggle('is-centered', !overflow);
        if (prev) prev.hidden = !overflow;
        if (next) next.hidden = !overflow;
        if (dotsEl) dotsEl.style.display = overflow ? '' : 'none';
        if (overflow){
          if (prev) prev.disabled = track.scrollLeft <= 2;
          if (next) next.disabled = track.scrollLeft >= (track.scrollWidth - track.clientWidth - 2);
          if (dotsEl){ const ci = currentIndex(); Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === ci)); }
        }
      }
      if (prev) prev.addEventListener('click', () => track.scrollBy({ left:-step(), behavior:'smooth' }));
      if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior:'smooth' }));
      track.addEventListener('scroll', update, { passive:true });
      addEventListener('resize', update);
      buildDots(); update();
    })();
  })();

  /* ---------- contador de ofertas (Bloque 4) ---------- */
  (function initCountdown() {
    const clock = document.getElementById('timer-clock');
    if (!clock) return;
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + ((7 - now.getDay()) % 7));
    end.setHours(23, 59, 59, 0);
    if (end <= now) end.setDate(end.getDate() + 7);

    function tick() {
      const ms = end - new Date();
      if (ms <= 0) { clock.textContent = '¡Terminó!'; clearInterval(timer); return; }
      const d = Math.floor(ms / 864e5);
      const h = Math.floor(ms % 864e5 / 36e5);
      const m = Math.floor(ms % 36e5 / 6e4);
      const s = Math.floor(ms % 6e4 / 1e3);
      const pad = n => String(n).padStart(2, '0');
      clock.textContent = `${pad(d)}d : ${pad(h)}h : ${pad(m)}m : ${pad(s)}s`;
    }
    tick();
    const timer = setInterval(tick, 1000);
  })();


  /* ---------- FAQ: mostrar/ocultar la lista con el botón "?" ---------- */
  (function initFaqToggle(){
    const sec = document.getElementById('faq');
    const btn = document.getElementById('faq-toggle');
    if (!sec || !btn) return;
    btn.addEventListener('click', () => {
      const open = sec.classList.toggle('faq-open');
      btn.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  })();

})();
