/* ============================================================
   LUNA3D — Página de producto (detalle navegable)
   ============================================================ */
(function(){
  LUNA.buildNav('');
  LUNA.buildFooter();

  // Loading mientras llega Supabase.
  const _pdGrid = document.getElementById('pd-grid');
  if(_pdGrid) _pdGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:60px 0;">Cargando producto…</div>';

  (async function(){
    await LUNA_DATA.bootstrap();

  const params=new URLSearchParams(location.search);
  const id=params.get('id');
  const p=PROD_BY_ID[id]||PRODUCTS[0];

  // Empty/Not-found: catálogo vacío (todo en borrador) o id inexistente.
  if(!p){
    const g=document.getElementById('pd-grid');
    if(g) g.innerHTML='<div class="empty-state" style="grid-column:1/-1;padding:60px 0;text-align:center;">'
      +'<p style="font-size:18px;color:var(--star);font-family:var(--font-display);margin-bottom:8px;">Producto no disponible</p>'
      +'Pronto publicaremos nuevos productos. <a href="catalogo.html" style="color:var(--magenta);">Ver catálogo</a></div>';
    const rg=document.getElementById('related-grid'); if(rg) rg.innerHTML='';
    document.title='Producto no disponible — Luna3D';
    return;
  }

  // Variantes desde el producto, con fallback a los valores por defecto de marca.
  const COLORS = p.colors || DEFAULT_COLORS;
  const SIZES  = p.sizes  || DEFAULT_SIZES;
  const hasPrice = p.price != null;
  // Descuento REAL solo si el producto trae un precio de comparación propio (p.compareAt) mayor al actual.
  const compareAt = (hasPrice && p.compareAt != null && p.compareAt > p.price) ? p.compareAt : null;
  const off = compareAt ? Math.round((1 - p.price / compareAt) * 100) : null;

  let qty = 1, color = 0, size = 0, thumb = 0;

  // breadcrumb
  document.getElementById('breadcrumb').innerHTML=
    `<a href="index.html">Inicio</a><span class="sep">/</span>`+
    `<a href="catalogo.html?cat=${p.cat}">${p.catName}</a><span class="sep">/</span>`+
    `<span style="color:var(--silver);">${p.name}</span>`;

  const stars5=`<div class="stars">${LUNA.svg('star').repeat(5)}</div>`;

  // Piezas null-safe (sin inventar precio ni reseñas en productos placeholder).
  const mainMedia = p.img
    ? `<img id="main-img" src="${p.img}" alt="${p.name}">`
    : `<span class="ph-label" id="main-ph">FOTO · ${p.name}</span>`;
  const ratingHtml = (p.rating != null && p.reviews > 0)
    ? `<div class="pd-rating">${stars5}<span><b style="color:var(--star);">${p.rating.toFixed(1)}</b> · ${p.reviews} reseñas</span></div>`
    : `<div class="pd-rating">${stars5}<span>Sé el primero en opinar</span></div>`;
  const priceHtml = hasPrice
    ? `<div class="pd-price"><span class="now">${CLP(p.price)}</span>${compareAt ? `<span class="was">${CLP(compareAt)}</span><span class="off">-${off}%</span>` : ''}</div>`
    : `<div class="pd-price"><span class="now">${CLP(p.price)}</span></div>`;
  // Mostrar selector de tamaño solo si hay más de una opción real.
  const sizeOptHtml = (SIZES.length > 1)
    ? `<div class="pd-opt">
        <span class="opt-label">Tamaño</span>
        <div class="pd-sizes" id="pd-sizes">
          ${SIZES.map((s,i)=>`<button data-size="${i}" class="${i===0?'active':''}">${s}</button>`).join('')}
        </div>
      </div>`
    : '';
  const buyBtnHtml = hasPrice
    ? `<button class="btn primary" style="flex:1;justify-content:center;" id="add-btn">Añadir al carrito · <span id="buy-total">${CLP(p.price)}</span></button>`
    : `<button class="btn primary" style="flex:1;justify-content:center;" id="add-btn" disabled aria-disabled="true">Disponible próximamente</button>`;

  document.getElementById('pd-grid').innerHTML=`
    <div class="pd-gallery">
      <div class="pd-main-img">
        ${p.tag?`<span class="pbadge" style="top:18px;left:18px;">${p.tag}</span>`:''}
        ${mainMedia}
      </div>
      <div class="pd-thumbs" id="pd-thumbs">
        ${[0,1,2,3].map(i=>`<div class="pd-thumb ${i===0?'active':''}" data-thumb="${i}"></div>`).join('')}
      </div>
    </div>
    <div class="pd-info">
      <span class="pd-cat">${p.catName}</span>
      <h1>${p.name}</h1>
      ${ratingHtml}
      ${priceHtml}
      <p class="pd-desc">${p.desc || PROD_DESC}</p>

      <div class="pd-opt">
        <span class="opt-label">Color / Acabado</span>
        <div class="pd-colors" id="pd-colors">
          ${COLORS.map((c,i)=>`<button data-color="${i}" class="${i===0?'active':''}" style="background:${c.css};" title="${c.name}" aria-label="${c.name}"></button>`).join('')}
        </div>
      </div>
      ${sizeOptHtml}

      <div class="pd-buy">
        <div class="qty-stepper">
          <button id="q-minus" aria-label="Menos">${LUNA.svg('minus')}</button>
          <span id="q-val">1</span>
          <button id="q-plus" aria-label="Más">${LUNA.svg('plus')}</button>
        </div>
        ${buyBtnHtml}
      </div>

      <div class="pd-specs">
        <div class="sp"><div class="spk">Material</div><div class="spv">PLA+ premium</div></div>
        <div class="sp"><div class="spk">Resolución</div><div class="spv">0.12 mm</div></div>
        <div class="sp"><div class="spk">Fabricación</div><div class="spv">A pedido · Chile</div></div>
        <div class="sp"><div class="spk">Despacho</div><div class="spv">48 h hábiles</div></div>
      </div>

      <div class="pd-trust">
        <div class="pt"><span class="pt-ico">${LUNA.svg('truck')}</span> Envío a todo Chile</div>
        <div class="pt"><span class="pt-ico">${LUNA.svg('shield')}</span> Garantía de reimpresión</div>
        <div class="pt"><span class="pt-ico">${LUNA.svg('refresh')}</span> 30 días de devolución</div>
      </div>
    </div>`;

  // interactions
  const qVal=document.getElementById('q-val'), buyTotal=document.getElementById('buy-total');
  function refresh(){ qVal.textContent=qty; if(buyTotal && hasPrice) buyTotal.textContent=CLP(p.price*qty); }
  document.getElementById('q-minus').onclick=()=>{qty=Math.max(1,qty-1);refresh();};
  document.getElementById('q-plus').onclick=()=>{qty=Math.min(20,qty+1);refresh();};

  document.getElementById('pd-colors').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    color=+b.dataset.color;document.querySelectorAll('#pd-colors button').forEach(x=>x.classList.toggle('active',x===b));};
  const sizesEl=document.getElementById('pd-sizes');
  if(sizesEl) sizesEl.onclick=e=>{const b=e.target.closest('button');if(!b)return;
    size=+b.dataset.size;sizesEl.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));};
  document.getElementById('pd-thumbs').onclick=e=>{const b=e.target.closest('.pd-thumb');if(!b)return;
    thumb=+b.dataset.thumb;document.querySelectorAll('.pd-thumb').forEach(x=>x.classList.toggle('active',x===b));
    const mph=document.getElementById('main-ph'); if(mph) mph.textContent=`FOTO ${thumb+1} · ${p.name}`;};

  const addBtn=document.getElementById('add-btn');
  if(addBtn && hasPrice) addBtn.onclick=()=>{ LUNA.addToCart(p.id); if(qty>1) LUNA.changeQty(p.id,qty-1); LUNA.openDrawer(); };

  // related
  const rel=PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).concat(PRODUCTS.filter(x=>x.cat!==p.cat)).slice(0,10);
  const relatedGrid = document.getElementById('related-grid');
  relatedGrid.innerHTML=rel.map(x=>LUNA.productCard(x)).join('');
  const moveRelated = dir => relatedGrid.scrollBy({left:dir * Math.min(760, relatedGrid.clientWidth * .9), behavior:'smooth'});
  document.getElementById('related-prev').onclick=()=>moveRelated(-1);
  document.getElementById('related-next').onclick=()=>moveRelated(1);

  // update title
  document.title=`${p.name} — Luna3D`;
  scrollTo(0,0);
  })(); // fin arranque async
})();
