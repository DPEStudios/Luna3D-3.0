/* ============================================================
   LUNA3D — Catálogo: filtros, colecciones, orden (funcionales)
   Categorías y SUBCATEGORÍAS dinámicas: las categorías conocidas
   (data.js) se complementan con las que traigan los productos, y
   cada categoría muestra sus subcategorías reales (campo subcat).
   ============================================================ */
(function(){
  LUNA.buildNav('catalogo');
  LUNA.buildFooter();

  const _catGrid = document.getElementById('catalog-grid');
  if(_catGrid) _catGrid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">Cargando catálogo…</div>';

  (async function(){
    await LUNA_DATA.bootstrap();

  const COLLECTIONS=[
    {id:'all',      label:'Todos'},
    {id:'featured', label:'Destacados', test:p=>p.featured},
    {id:'new',      label:'Novedades',  test:p=>p.tag==='Nuevo'},
  ];
  const PRICE=[
    {id:'all', label:'Todos los precios', test:()=>true},
    {id:'p1',  label:'Bajo $6.000',       test:p=>p.price!=null&&p.price<6000},
    {id:'p2',  label:'$6.000 – $12.000',  test:p=>p.price!=null&&p.price>=6000&&p.price<12000},
    {id:'p3',  label:'Sobre $12.000',     test:p=>p.price!=null&&p.price>=12000},
  ];

  // ----- Categorías DINÁMICAS: conocidas (data.js) + las que traigan productos -----
  const _known = new Set((typeof CATEGORIES!=='undefined'?CATEGORIES:[]).map(c=>c.id));
  const CATLIST = (typeof CATEGORIES!=='undefined'?CATEGORIES:[]).map(c=>({id:c.id,name:c.name}));
  PRODUCTS.forEach(p=>{
    if(p.cat && !_known.has(p.cat)){ _known.add(p.cat); CATLIST.push({id:p.cat,name:p.catName||p.cat}); }
  });
  const catNameOf = id => (CATLIST.find(c=>c.id===id)||{}).name || id;

  // ----- Subcategorías reales por categoría (desde los productos) -----
  const SUBMAP = {};
  PRODUCTS.forEach(p=>{
    if(p.subcat){ (SUBMAP[p.cat]=SUBMAP[p.cat]||[]); if(!SUBMAP[p.cat].includes(p.subcat)) SUBMAP[p.cat].push(p.subcat); }
  });
  Object.values(SUBMAP).forEach(arr=>arr.sort((a,b)=>a.localeCompare(b,'es')));

  const state={cat:'all',subcat:'all',collection:'all',price:'all',sort:'relevance'};

  // read ?cat= y ?subcat=
  const params=new URLSearchParams(location.search);
  if(params.get('cat')&&CATLIST.some(c=>c.id===params.get('cat'))) state.cat=params.get('cat');
  if(params.get('subcat')) state.subcat=params.get('subcat');
  // read ?col= (colección/curación): acepta ids EN y alias ES usados en la home.
  const COL_ALIAS={featured:'featured',destacados:'featured',new:'new',nuevo:'new',nuevos:'new'};
  const _colId=COL_ALIAS[(params.get('col')||'').toLowerCase()];
  if(_colId&&COLLECTIONS.some(c=>c.id===_colId)) state.collection=_colId;

  // ----- category filter -----
  const fc=document.getElementById('filter-cats');
  const catBtn=(id,label,count)=>`<button data-cat="${id}" class="${state.cat===id?'active':''}">${label}<span class="cnt">${count}</span></button>`;
  fc.innerHTML=catBtn('all','Todo',PRODUCTS.length)+CATLIST.map(c=>catBtn(c.id,c.name,PRODUCTS.filter(p=>p.cat===c.id).length)).join('');
  fc.onclick=e=>{const b=e.target.closest('button');if(!b)return;state.cat=b.dataset.cat;state.subcat='all';syncFilters();render();};

  // ----- subcategory filter (inyectado bajo Categorías) -----
  let fsGroup=document.getElementById('filter-subs-group');
  if(!fsGroup){
    fsGroup=document.createElement('div');
    fsGroup.className='filter-group';
    fsGroup.id='filter-subs-group';
    fsGroup.innerHTML='<h4>Subcategoría</h4><div class="filter-chips" id="filter-subs"></div>';
    const catsGroup=fc.closest('.filter-group');
    if(catsGroup&&catsGroup.parentNode) catsGroup.parentNode.insertBefore(fsGroup, catsGroup.nextSibling);
  }
  const fs=document.getElementById('filter-subs');
  function renderSubs(){
    const subs=(state.cat!=='all'&&SUBMAP[state.cat])?SUBMAP[state.cat]:[];
    if(!subs.length){ fsGroup.style.display='none'; fs.innerHTML=''; return; }
    fsGroup.style.display='';
    const subBtn=(id,label)=>`<button data-subcat="${id}" class="${state.subcat===id?'active':''}">${label}</button>`;
    fs.innerHTML=subBtn('all','Todas')+subs.map(s=>subBtn(s,s)).join('');
  }
  fs.onclick=e=>{const b=e.target.closest('button');if(!b)return;state.subcat=b.dataset.subcat;syncFilters();render();};

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
    renderSubs();
    fs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.subcat===state.subcat));
    const tEl=document.getElementById('cat-title');
    if(state.cat==='all') tEl.textContent='Todo el catálogo';
    else tEl.textContent=catNameOf(state.cat)+(state.subcat!=='all'?(' › '+state.subcat):'');
  }

  function apply(){
    let list=PRODUCTS.slice();
    if(state.cat!=='all') list=list.filter(p=>p.cat===state.cat);
    if(state.subcat!=='all') list=list.filter(p=>p.subcat===state.subcat);
    const col=COLLECTIONS.find(c=>c.id===state.collection); if(col&&col.test) list=list.filter(col.test);
    const pr=PRICE.find(p=>p.id===state.price); if(pr) list=list.filter(pr.test);

    const searchInput = document.getElementById('nav-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if(query){
      list = list.filter(p => p.name.toLowerCase().includes(query) || p.catName.toLowerCase().includes(query) || (p.subcat||'').toLowerCase().includes(query));
    }

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

  window.addEventListener('luna-search', render);

  const colParam = params.get('col');
  if (colParam && COLLECTIONS.some(c=>c.id===colParam)) {
    state.collection = colParam;
  }

  syncFilters(); render();
  })();
})();
