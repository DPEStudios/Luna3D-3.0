/* ============================================================
   LUNA3D — Catálogo: filtros, colecciones, orden (funcionales)
   ============================================================ */
(function(){
  LUNA.buildNav('catalogo');
  LUNA.buildFooter();

  // Loading: estado de carga mientras llega Supabase.
  const _catGrid = document.getElementById('catalog-grid');
  if(_catGrid) _catGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Cargando catálogo…</div>';

  // Arranque async: hidrata PRODUCTS desde Supabase (o fallback a data.js),
  // luego construye filtros y render. Empty/Sin resultados ya lo maneja el render.
  (async function(){
    await LUNA_DATA.bootstrap();

  const COLLECTIONS=[
    {id:'all',      label:'Todos'},
    {id:'featured', label:'Destacados', test:p=>p.featured},
    {id:'new',      label:'Novedades',  test:p=>p.tag==='Nuevo'},
  ];
  // Filtros de precio: los productos sin precio (placeholder) solo aparecen en "Todos los precios".
  const PRICE=[
    {id:'all', label:'Todos los precios', test:()=>true},
    {id:'p1',  label:'Bajo $6.000',       test:p=>p.price!=null&&p.price<6000},
    {id:'p2',  label:'$6.000 – $12.000',  test:p=>p.price!=null&&p.price>=6000&&p.price<12000},
    {id:'p3',  label:'Sobre $12.000',     test:p=>p.price!=null&&p.price>=12000},
  ];

  const state={cat:'all',collection:'all',price:'all',sort:'relevance'};

  // read ?cat=
  const params=new URLSearchParams(location.search);
  if(params.get('cat')&&CATEGORIES.some(c=>c.id===params.get('cat'))) state.cat=params.get('cat');

  // ----- build category filter -----
  const fc=document.getElementById('filter-cats');
  const catBtn=(id,label,count)=>`<button data-cat="${id}" class="${state.cat===id?'active':''}">${label}<span class="cnt">${count}</span></button>`;
  fc.innerHTML=catBtn('all','Todo',PRODUCTS.length)+CATEGORIES.map(c=>catBtn(c.id,c.name,PRODUCTS.filter(p=>p.cat===c.id).length)).join('');
  fc.onclick=e=>{const b=e.target.closest('button');if(!b)return;state.cat=b.dataset.cat;syncFilters();render();};

  // ----- price filter -----
  const fp=document.getElementById('filter-price');
  fp.innerHTML=PRICE.map(p=>`<button data-price="${p.id}" class="${state.price===p.id?'active':''}">${p.label}</button>`).join('');
  fp.onclick=e=>{const b=e.target.closest('button');if(!b)return;state.price=b.dataset.price;syncFilters();render();};

  // ----- collection chips -----
  const cc=document.getElementById('collection-chips');
  cc.innerHTML=COLLECTIONS.map(c=>`<button data-col="${c.id}" class="${state.collection===c.id?'active':''}">${c.label}</button>`).join('');
  cc.onclick=e=>{const b=e.target.closest('button');if(!b)return;state.collection=b.dataset.col;syncFilters();render();};

  // ----- sort -----
  document.getElementById('sort').onchange=e=>{state.sort=e.target.value;render();};

  // ----- mobile filter toggle -----
  document.getElementById('filter-toggle').onclick=()=>document.getElementById('filters').classList.toggle('open');

  function syncFilters(){
    fc.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.cat===state.cat));
    fp.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.price===state.price));
    cc.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.col===state.collection));
    // title
    const tEl=document.getElementById('cat-title');
    if(state.cat==='all') tEl.textContent='Todo el catálogo';
    else tEl.textContent=CATEGORIES.find(c=>c.id===state.cat).name;
  }

  function apply(){
    let list=PRODUCTS.slice();
    if(state.cat!=='all') list=list.filter(p=>p.cat===state.cat);
    const col=COLLECTIONS.find(c=>c.id===state.collection); if(col&&col.test) list=list.filter(col.test);
    const pr=PRICE.find(p=>p.id===state.price); if(pr) list=list.filter(pr.test);

    // Apply header search filter
    const searchInput = document.getElementById('nav-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if(query){
      list = list.filter(p => p.name.toLowerCase().includes(query) || p.catName.toLowerCase().includes(query));
    }

    // Orden null-safe: sin precio van al final; sin rating cuentan como 0.
    switch(state.sort){
      case 'price-asc': list.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));break;
      case 'price-desc':list.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));break;
      case 'rating':    list.sort((a,b)=>(b.rating??0)-(a.rating??0));break;
      case 'new':       list.sort((a,b)=>(b.tag?1:0)-(a.tag?1:0));break;
    }
    return list;
  }

  const PAGE_SIZE = 20;
  let curPage = 0;
  let curList = [];

  function render(){
    curPage = 0;
    curList = apply();
    document.getElementById('result-count').innerHTML=`<b>${curList.length}</b> producto${curList.length!==1?'s':''}`;
    renderGrid();
  }

  function renderGrid(){
    const grid = document.getElementById('catalog-grid');
    const shown = curList.slice(0, (curPage + 1) * PAGE_SIZE);
    const hasMore = shown.length < curList.length;

    grid.innerHTML = shown.length
      ? shown.map(p=>LUNA.productCard(p)).join('')
      : `<div class="empty-state" style="grid-column:1/-1;"><p style="font-size:17px;color:var(--star);font-family:var(--font-display);margin-bottom:8px;">Sin resultados</p>Prueba con otra categoría o rango de precio.</div>`;

    let btn = document.getElementById('catalog-load-more');
    if (!btn) {
      btn = document.createElement('div');
      btn.id = 'catalog-load-more';
      btn.className = 'catalog-load-more';
      grid.after(btn);
    }
    if (hasMore) {
      btn.style.display = 'flex';
      btn.innerHTML = `<button class="btn ghost">Ver más productos <span class="load-more-count">${curList.length - shown.length} restantes</span></button>`;
      btn.querySelector('button').onclick = () => { curPage++; renderGrid(); };
    } else {
      btn.style.display = 'none';
    }
  }

  // Listen to search events from header
  window.addEventListener('luna-search', render);

  // If there's a pre-selected collection/filter from URL (e.g. col=staff)
  const colParam = params.get('col');
  if (colParam && COLLECTIONS.some(c=>c.id===colParam)) {
    state.collection = colParam;
  }

  syncFilters(); render();
  })(); // fin arranque async
})();
