/* ============================================================
   LUNA3D — Mini-carruseles de la sección Promo (autónomo)
   Sin dependencias. Se auto-inicializa al cargar el DOM.
   ------------------------------------------------------------
   CÓMO USAR
   1. Incluye luna3d-promo.css en el <head>.
   2. Pega el bloque <section class="l3d-promo"> de luna3d-promo.html.
   3. Incluye este archivo antes de </body>.
   Cada panel se rellena solo según su atributo data-set
   ("best" | "gift" | "offer").
   ------------------------------------------------------------
   PERSONALIZAR
   - PRODUCT_URL: a dónde lleva cada tarjeta (página de producto).
   - SETS: qué productos muestra cada panel (por id).
   - PRODUCTS: catálogo. Añade "img" a un producto para usar foto
     real en la miniatura; si no, se muestra el placeholder "Foto".
   ============================================================ */
(function () {
  "use strict";

  /* === A DÓNDE LLEVA CADA TARJETA (edítalo a tu URL de producto) === */
  var PRODUCT_URL = function (id) { return "producto.html?id=" + id; };

  /* === CATÁLOGO === (price en pesos; img opcional) */
  var PRODUCTS = [
    { id:"busto-mandaloriano", name:"Busto Mandaloriano",       price:24900, rating:4.9, badge:null,    img:null },
    { id:"figura-starwars",    name:"Figura StarWars Decorativa",price:19990, rating:4.8, badge:"Nuevo", img:null },
    { id:"soporte-joyeria",    name:"Soporte de Joyería",       price:6990,  rating:4.7, badge:null,    img:null },
    { id:"colgante-luna",      name:"Colgante Luna Mística",    price:4500,  rating:5.0, badge:"Nuevo", img:null },
    { id:"arana-xxl",          name:"Araña de Juguete XXL",     price:7990,  rating:4.6, badge:null,    img:null },
    { id:"soporte-celular",    name:"Soporte Celular Tech",     price:5490,  rating:4.8, badge:null,    img:null },
    { id:"macetero-geo",       name:"Macetero Geométrico",      price:8500,  rating:4.9, badge:null,    img:null },
    { id:"soporte-auri",       name:"Soporte Auriculares Gamer",price:12900, rating:4.7, badge:null,    img:null },
    { id:"lampara-moderna",    name:"Lámpara Hogar Moderna",    price:14990, rating:4.9, badge:"Nuevo", img:null },
    { id:"llavero-estrella",   name:"Llavero Estrella 3D",      price:3500,  rating:4.8, badge:"Nuevo", img:null },
    { id:"lampara-luna",       name:"Lámpara Luna Creciente",   price:16900, rating:5.0, badge:null,    img:null },
    { id:"organizador-mod",    name:"Organizador Modular",      price:9990,  rating:4.6, badge:null,    img:null },
    { id:"dragon-articulado",  name:"Figura Articulada Dragón", price:11990, rating:4.9, badge:null,    img:null },
    { id:"jarron-espiral",     name:"Jarrón Espiral",           price:13500, rating:4.7, badge:null,    img:null },
    { id:"posavasos-geo",      name:"Posavasos Geométrico",     price:5990,  rating:4.5, badge:null,    img:null },
    { id:"maceta-auto",        name:"Maceta Auto-regable",      price:10900, rating:4.8, badge:"Nuevo", img:null },
    { id:"soporte-monitor",    name:"Soporte Monitor Luna",     price:15900, rating:4.9, badge:null,    img:null },
    { id:"dino-articulado",    name:"Dinosaurio Articulado",    price:8990,  rating:4.7, badge:null,    img:null }
  ];
  var BY_ID = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; });

  /* === QUÉ PRODUCTOS MUESTRA CADA PANEL === */
  var SETS = {
    best:  ["soporte-celular","lampara-luna","figura-starwars","busto-mandaloriano","dragon-articulado","llavero-estrella","soporte-monitor","macetero-geo","jarron-espiral"],
    gift:  ["colgante-luna","lampara-luna","dragon-articulado","dino-articulado","llavero-estrella","busto-mandaloriano","lampara-moderna","soporte-joyeria","arana-xxl"],
    offer: ["macetero-geo","lampara-moderna","jarron-espiral","organizador-mod","maceta-auto","posavasos-geo","soporte-auri","arana-xxl","soporte-celular"]
  };

  var GAP = 10;
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.6 6.1 6.6.5-5 4.3 1.5 6.5L12 16.9 6.3 20.4l1.5-6.5-5-4.3 6.6-.5z" fill="currentColor"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function clp(n) { return "$" + Number(n).toLocaleString("es-CL"); }

  function card(p, theme) {
    var off = theme === "offer";
    var newPrice = off ? Math.round(p.price * 0.9 / 10) * 10 : p.price;
    var badge = off ? "-10%" : (p.badge || "");
    var thumb = p.img
      ? '<img src="' + p.img + '" alt="' + p.name + '">'
      : '<span class="l3d-ph">Foto</span>';
    return (
      '<a class="l3d-prod" href="' + PRODUCT_URL(p.id) + '">' +
        '<div class="l3d-thumb">' +
          (badge ? '<span class="l3d-badge">' + badge + '</span>' : '') +
          thumb +
        '</div>' +
        '<div class="l3d-info">' +
          '<h4 class="l3d-name">' + p.name + '</h4>' +
          '<div class="l3d-meta">' +
            '<span class="l3d-price">' + clp(newPrice) + (off ? '<s>' + clp(p.price) + '</s>' : '') + '</span>' +
            '<span class="l3d-rate">' + STAR + p.rating.toFixed(1) + '</span>' +
          '</div>' +
        '</div>' +
      '</a>'
    );
  }

  function build(el) {
    var theme = el.getAttribute("data-set");
    var prods = (SETS[theme] || []).map(function (id) { return BY_ID[id]; }).filter(Boolean);
    if (!prods.length) return;

    el.innerHTML =
      '<div class="l3d-panel">' +
        '<button class="l3d-arrow prev" type="button" aria-label="Anterior">' + CHEV + '</button>' +
        '<div class="l3d-viewport"><div class="l3d-track">' +
          prods.map(function (p) { return card(p, theme); }).join("") +
        '</div></div>' +
        '<button class="l3d-arrow next" type="button" aria-label="Siguiente">' + CHEV + '</button>' +
      '</div>' +
      '<div class="l3d-dots"></div>';

    var vp = el.querySelector(".l3d-viewport");
    var dotsWrap = el.querySelector(".l3d-dots");
    var prev = el.querySelector(".l3d-arrow.prev");
    var next = el.querySelector(".l3d-arrow.next");
    var pages = 1, active = 0;

    function rebuild() {
      var c = vp.querySelector(".l3d-prod"); if (!c) return;
      var stride = c.getBoundingClientRect().width + GAP;
      var per = Math.max(1, Math.round(vp.clientWidth / stride));
      pages = Math.max(1, Math.ceil(prods.length / per));
      active = Math.min(active, pages - 1);
      var html = "";
      for (var k = 0; k < pages; k++) {
        html += '<button class="l3d-dot' + (k === active ? " on" : "") + '" type="button" data-i="' + k +
                '" aria-label="Página ' + (k + 1) + ' de ' + pages + '"></button>';
      }
      dotsWrap.innerHTML = html;
      dotsWrap.querySelectorAll(".l3d-dot").forEach(function (d) {
        d.addEventListener("click", function () { vp.scrollTo({ left: (+d.getAttribute("data-i")) * vp.clientWidth, behavior: "smooth" }); });
      });
      var single = pages < 2;
      prev.classList.toggle("l3d-hide", single);
      next.classList.toggle("l3d-hide", single);
      dotsWrap.style.display = single ? "none" : "";
    }
    function syncDots() {
      active = Math.max(0, Math.min(pages - 1, Math.round(vp.scrollLeft / vp.clientWidth)));
      dotsWrap.querySelectorAll(".l3d-dot").forEach(function (d, k) { d.classList.toggle("on", k === active); });
    }

    prev.addEventListener("click", function () { vp.scrollBy({ left: -vp.clientWidth, behavior: "smooth" }); });
    next.addEventListener("click", function () { vp.scrollBy({ left: vp.clientWidth, behavior: "smooth" }); });

    var st = null;
    vp.addEventListener("scroll", function () {
      if (st) cancelAnimationFrame(st);
      st = requestAnimationFrame(syncDots);
    }, { passive: true });

    var rt = null;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(rebuild, 160); });

    rebuild();
  }

  function init() {
    document.querySelectorAll(".l3d-mini[data-set]").forEach(build);
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
