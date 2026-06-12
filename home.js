/* ============================================================
   LUNA3D — Home v3: hero + feature strip + categorías + testimonials
   El catálogo completo vive en catalogo.html
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

    // Dots click
    dots.forEach(d => {
      d.addEventListener('click', () => {
        goTo(parseInt(d.dataset.idx, 10));
        resetAuto();
      });
    });

    // Swipe / drag (touch + mouse)
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

    // Pausar auto al hover
    sliderTrack.addEventListener('mouseenter', () => clearInterval(autoTimer));
    sliderTrack.addEventListener('mouseleave', resetAuto);

    // Iniciar
    goTo(0);
    resetAuto();
  })();

  /* ---------- hero: chips = accesos rápidos a categorías ---------- */
  const hc = document.getElementById('hero-chips');
  if(hc){
    hc.innerHTML = CATEGORIES.slice(0,6).map(c =>
      `<a href="catalogo.html?cat=${c.id}">${c.name}</a>`
    ).join('');
  }

  /* ---------- feature strip ---------- */
  const FS = [
    {ico:'star',  b:'Más vendidos', p:'Descubre los productos favoritos de nuestros clientes.'},
    {ico:'gem',   b:'¿Buscas un regalo?', p:'Encuentra ideas únicas para sorprender.'},
    {ico:'spark', b:'Oferta de la semana', p:'Todas las semanas incorporamos promociones especiales.'},
    {ico:'help',  b:'Preguntas frecuentes', p:'Conoce el proceso completo de compra y entrega.'},
  ];
  const fsEl = document.getElementById('feature-strip');
  if(fsEl) {
    const hotProductsForMini = PRODUCTS.filter(p => p.reviews > 80).slice(0, 4);
    fsEl.innerHTML = FS.map((f, i) => {
      let extraHtml = '';
      if (i === 0) {
        extraHtml = `
          <div class="mini-carousel-wrapper">
            <div class="mini-carousel">
              ${hotProductsForMini.map((p, idx) => `
                <a class="mini-slide ${idx === 0 ? 'active' : ''}" href="producto.html?id=${p.id}">
                  <span class="mini-slide-img-placeholder">FOTO</span>
                  <div class="mini-slide-info">
                    <span class="mini-slide-name">${p.name}</span>
                    <span class="mini-slide-price">${CLP(p.price)}</span>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>`;
      }
      return `<div class="fs">
        <div class="fs-ico">${LUNA.svg(f.ico)}</div>
        <b>${f.b}</b>
        <p>${f.p}</p>
        ${extraHtml}
      </div>`;
    }).join('');

    // Mini carousel animation loop
    (function initMiniCarousel() {
      const slides = document.querySelectorAll('.mini-slide');
      if (!slides.length) return;
      let activeIdx = 0;
      setInterval(() => {
        slides[activeIdx].classList.remove('active');
        activeIdx = (activeIdx + 1) % slides.length;
        slides[activeIdx].classList.add('active');
      }, 3000);
    })();
  }

  /* ---------- showcase carousels (Sección 1) ---------- */
  function saleCard(p, tag){
    if (tag === 'Nuevo') {
      return `<article class="show-prod">
        <a class="show-img" href="producto.html?id=${p.id}">
          <span class="pbadge">${tag}</span>
          <span class="ph-label">FOTO<br>${p.name}</span>
        </a>
        <div class="show-body">
          <span class="pcat">${p.catName}</span>
          <h3><a href="producto.html?id=${p.id}">${p.name}</a></h3>
          <div class="show-price"><b>${CLP(p.price)}</b></div>
        </div>
      </article>`;
    }

    const was = Math.round(p.price * 1.22 / 100) * 100;
    const discount = Math.max(10, Math.round((1 - p.price / was) * 100));
    return `<article class="show-prod">
      <a class="show-img" href="producto.html?id=${p.id}">
        <span class="pbadge">${tag}</span>
        <span class="ph-label">FOTO<br>${p.name}</span>
      </a>
      <div class="show-body">
        <span class="pcat">${p.catName}</span>
        <h3><a href="producto.html?id=${p.id}">${p.name}</a></h3>
        <div class="show-price"><b>${CLP(p.price)}</b><span>${CLP(was)}</span><em>-${discount}%</em></div>
      </div>
    </article>`;
  }
  const hotEl = document.getElementById('hot-sale-carousel');
  if(hotEl){
    const hot = PRODUCTS.filter(p => p.reviews > 80).slice(0,8);
    hotEl.innerHTML = hot.map(p => saleCard(p, 'Hot Sale')).join('');
  }
  const newEl = document.getElementById('new-carousel');
  if(newEl){
    const fresh = PRODUCTS.filter(p => p.badge === 'Nuevo').slice(0,8);
    newEl.innerHTML = fresh.map(p => saleCard({...p, price:p.price}, 'Nuevo')).join('');
  }

  /* ---------- regalos (Sección 2 - Gift Finder) ---------- */
  (function initGiftFinder() {
    const resultsEl = document.getElementById('gift-results-grid');
    const recipientOpts = document.getElementById('gift-recipient-opts');
    const budgetOpts = document.getElementById('gift-budget-opts');
    if (!resultsEl || !recipientOpts || !budgetOpts) return;

    let activeRecipient = 'gamer';
    let activeBudget = 'all';

    function updateResults() {
      resultsEl.classList.add('fade-out');
      setTimeout(() => {
        let cats = [];
        if (activeRecipient === 'gamer') cats = ['cat-5', 'cat-10', 'cat-15'];
        else if (activeRecipient === 'hogar') cats = ['cat-1', 'cat-6', 'cat-11'];
        else if (activeRecipient === 'oficina') cats = ['cat-2', 'cat-7', 'cat-12'];
        else if (activeRecipient === 'especial') cats = ['cat-4', 'cat-8', 'cat-14'];

        let list = PRODUCTS.filter(p => cats.includes(p.cat));

        if (activeBudget === 'low') {
          list = list.filter(p => p.price < 8000);
        } else if (activeBudget === 'high') {
          list = list.filter(p => p.price >= 8000);
        }

        const sliced = list.slice(0, 4);

        if (sliced.length === 0) {
          resultsEl.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">No se encontraron regalos que coincidan con los filtros.</div>`;
        } else {
          resultsEl.innerHTML = sliced.map(p => LUNA.productCard(p)).join('');
        }
        resultsEl.classList.remove('fade-out');
      }, 180);
    }

    function bindGroup(container, attr, setter) {
      container.querySelectorAll('.finder-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.finder-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          setter(btn.dataset[attr]);
          updateResults();
        });
      });
    }
    bindGroup(recipientOpts, 'recipient', v => { activeRecipient = v; });
    bindGroup(budgetOpts,    'budget',    v => { activeBudget = v; });

    updateResults();
  })();

  /* ---------- ofertas destacadas (Sección 3) ---------- */
  const offersEl = document.getElementById('offers-grid');
  if (offersEl) {
    const offers = PRODUCTS.filter(p => p.badge === 'Oferta').slice(0, 4);
    offersEl.innerHTML = offers.map(p => LUNA.productCard(p)).join('');
  }

  (function initCountdown() {
    const clock = document.getElementById('timer-clock');
    if (!clock) return;
    // La oferta termina el domingo a las 23:59 de la semana en curso
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

  /* ---------- preguntas frecuentes (Sección 4) ----------
     NOTA: contenido provisorio de proceso (sin cifras inventadas).
     Reemplazar por las políticas reales en la sesión de contenido. */
  const FAQS = [
    { q: '¿Qué pasa después de que hago mi pedido?',
      p: 'Recibimos tu pedido y lo confirmamos contigo. Cada pieza se fabrica a pedido con impresión 3D, así que comenzamos a producirla una vez confirmada la compra.' },
    { q: '¿Hacen envíos a todo Chile?',
      p: 'Sí, despachamos a todo Chile. El costo y el tiempo de envío dependen de tu comuna y se confirman antes de cerrar el pedido.' },
    { q: '¿Puedo pedir un diseño personalizado?',
      p: 'Sí. Puedes enviarnos tu idea o tu modelo 3D y nuestro equipo lo optimiza para fabricarlo. Escríbenos por WhatsApp o al correo de contacto.' },
    { q: '¿Qué pasa si mi pieza llega dañada?',
      p: 'Si tu pieza llega con algún daño o defecto de fabricación, contáctanos con una foto y lo resolvemos: reimprimimos la pieza o te devolvemos tu dinero.' },
  ];
  const faqEl = document.getElementById('faq-list');
  if (faqEl) {
    faqEl.innerHTML = FAQS.map(f => `<details class="faq-item">
      <summary><span>${LUNA.svg('plus')}</span>${f.q}</summary>
      <p>${f.p}</p>
    </details>`).join('');
  }

  /* ---------- testimonios ---------- */
  const tm = document.getElementById('tmarquee');
  if (tm) {
    const card = t => `<div class="tcard">
      <div class="tstars">${LUNA.svg('star').repeat(5)}</div>
      <p>“${t.p}”</p>
      <div class="twho"><div class="tav">${t.name[0]}</div><div class="tmeta"><b>${t.name}</b><span>Compró: ${t.buy}</span></div></div>
    </div>`;
    tm.innerHTML = (TESTIMONIALS.map(card).join('')).repeat(2);
  }

})();
