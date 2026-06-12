/* ============================================================
   LUNA3D — Página de producto (detalle navegable)
   ============================================================ */
(function(){
  LUNA.buildNav('');
  LUNA.buildFooter();

  const params=new URLSearchParams(location.search);
  const id=params.get('id');
  const p=PROD_BY_ID[id]||PRODUCTS[0];

  const COLORS=[
    {name:'Aurora',  css:'linear-gradient(125deg,#E81F9D,#8E2BE6)'},
    {name:'Magenta', css:'#E81F9D'},
    {name:'Violeta', css:'#9B27E0'},
    {name:'Estrella',css:'#F5F6FB'},
    {name:'Espacial',css:'#0B1437'},
  ];
  const SIZES=['S','M','L','XL'];
  const was=Math.round(p.price*1.25/100)*100;
  const off=Math.round((1-p.price/was)*100);

  let qty=1, color=0, size=1, thumb=0;

  // breadcrumb
  document.getElementById('breadcrumb').innerHTML=
    `<a href="index.html">Inicio</a><span class="sep">/</span>`+
    `<a href="index.html?cat=${p.cat}#catalogo">${p.catName}</a><span class="sep">/</span>`+
    `<span style="color:var(--silver);">${p.name}</span>`;

  const stars5=`<div class="stars">${LUNA.svg('star').repeat(5)}</div>`;

  document.getElementById('pd-grid').innerHTML=`
    <div class="pd-gallery">
      <div class="pd-main-img">
        ${p.badge?`<span class="pbadge" style="top:18px;left:18px;">${p.badge}</span>`:''}
        <span class="ph-label" id="main-ph">FOTO · ${p.name}</span>
      </div>
      <div class="pd-thumbs" id="pd-thumbs">
        ${[0,1,2,3].map(i=>`<div class="pd-thumb ${i===0?'active':''}" data-thumb="${i}"></div>`).join('')}
      </div>
    </div>
    <div class="pd-info">
      <span class="pd-cat">${p.catName}</span>
      <h1>${p.name}</h1>
      <div class="pd-rating">${stars5}<span><b style="color:var(--star);">${p.rating.toFixed(1)}</b> · ${p.reviews} reseñas</span></div>
      <div class="pd-price">
        <span class="now">${CLP(p.price)}</span>
        <span class="was">${CLP(was)}</span>
        <span class="off">-${off}%</span>
      </div>
      <p class="pd-desc">${PROD_DESC}</p>

      <div class="pd-opt">
        <span class="opt-label">Color / Acabado</span>
        <div class="pd-colors" id="pd-colors">
          ${COLORS.map((c,i)=>`<button data-color="${i}" class="${i===0?'active':''}" style="background:${c.css};" title="${c.name}" aria-label="${c.name}"></button>`).join('')}
        </div>
      </div>
      <div class="pd-opt">
        <span class="opt-label">Tamaño</span>
        <div class="pd-sizes" id="pd-sizes">
          ${SIZES.map((s,i)=>`<button data-size="${i}" class="${i===1?'active':''}">${s}</button>`).join('')}
        </div>
      </div>

      <div class="pd-buy">
        <div class="qty-stepper">
          <button id="q-minus" aria-label="Menos">${LUNA.svg('minus')}</button>
          <span id="q-val">1</span>
          <button id="q-plus" aria-label="Más">${LUNA.svg('plus')}</button>
        </div>
        <button class="btn primary" style="flex:1;justify-content:center;" id="add-btn">Añadir al carrito · <span id="buy-total">${CLP(p.price)}</span></button>
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
  function refresh(){ qVal.textContent=qty; buyTotal.textContent=CLP(p.price*qty); }
  document.getElementById('q-minus').onclick=()=>{qty=Math.max(1,qty-1);refresh();};
  document.getElementById('q-plus').onclick=()=>{qty=Math.min(20,qty+1);refresh();};

  document.getElementById('pd-colors').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    color=+b.dataset.color;document.querySelectorAll('#pd-colors button').forEach(x=>x.classList.toggle('active',x===b));};
  document.getElementById('pd-sizes').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    size=+b.dataset.size;document.querySelectorAll('#pd-sizes button').forEach(x=>x.classList.toggle('active',x===b));};
  document.getElementById('pd-thumbs').onclick=e=>{const b=e.target.closest('.pd-thumb');if(!b)return;
    thumb=+b.dataset.thumb;document.querySelectorAll('.pd-thumb').forEach(x=>x.classList.toggle('active',x===b));
    document.getElementById('main-ph').textContent=`FOTO ${thumb+1} · ${p.name}`;};

  document.getElementById('add-btn').onclick=()=>{ LUNA.addToCart(p.id); if(qty>1) LUNA.changeQty(p.id,qty-1); LUNA.openDrawer(); };

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
})();
