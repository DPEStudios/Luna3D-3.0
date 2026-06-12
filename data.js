/* ============================================================
   LUNA3D — Datos del catálogo (v3)
   15 categorías × 20 productos = 300 productos.
   Nombres simples y placeholders, listos para reemplazar por el
   contenido real (nombre, precio, foto) producto por producto.
   Generación determinista: los valores no cambian entre cargas.
   ============================================================ */
const CLP = n => "$" + n.toLocaleString("es-CL");

const CAT_ICONS = ["home","chip","star","gem","toy","plant","cube","spark","shield","truck","home","chip","star","gem","toy"];

const CATEGORIES = Array.from({ length: 15 }, (_, i) => ({
  id:   `cat-${i + 1}`,
  name: `Categoría ${i + 1}`,
  icon: CAT_ICONS[i % CAT_ICONS.length],
  desc: `Productos de la categoría ${i + 1}, impresos a pedido en Chile.`,
}));

const PRODUCTS = [];
CATEGORIES.forEach((c, ci) => {
  for (let j = 1; j <= 20; j++) {
    const seed    = ci * 20 + j;
    const price   = 2000 + ((seed * 733) % 19) * 1000;     // $2.000 – $20.000
    const rating  = Math.round((4 + (seed % 11) / 10) * 10) / 10; // 4.0 – 5.0
    const reviews = (seed * 37) % 260;                     // 0 – 259
    const badge   = j % 7 === 0 ? "Nuevo" : (seed % 13 === 0 ? "Oferta" : null);
    PRODUCTS.push({
      id:      `${c.id}-p${j}`,
      name:    `Producto ${j}`,
      cat:     c.id,
      catName: c.name,
      price,
      badge,
      rating,
      reviews,
      fav:     seed % 5 === 0,        // marca de "favorito del staff" (no es el favorito del usuario)
    });
  }
});

const PROD_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

/* Selecciones para la Home */
const FEATURED  = CATEGORIES.slice(0, 8).map(c => `${c.id}-p1`);
const NOVEDADES = PRODUCTS.filter(p => p.badge === "Nuevo").slice(0, 6).map(p => p.id);
const HERO_CHIPS = CATEGORIES.slice(0, 6).map(c => c.name);

const TESTIMONIALS = [
  { name:"Daniel",    p:"Me encantó el diseño, la calidad de impresión es brutal y llegó súper rápido.",      buy:"Producto 3" },
  { name:"Valentina", p:"Perfecto para mi escritorio, el acabado mate se ve premium. Lo recomiendo 100%.",     buy:"Producto 7" },
  { name:"Matías",    p:"Muy buen producto, encajó perfecto. Le falta un poco de color, pero se ve genial.",   buy:"Producto 12" },
  { name:"Camila",    p:"Un regalo ideal, a mi hermana le fascinó. La atención al detalle es increíble.",      buy:"Producto 5" },
  { name:"Joaquín",   p:"Calidad superior a lo esperado. El empaque cuidado y la entrega puntual.",            buy:"Producto 9" },
  { name:"Francisca", p:"Ideal para mi home office. Encajó exacto con lo que buscaba.",                        buy:"Producto 2" },
  { name:"Javiera",   p:"Los detalles impresos son impresionantes. Se nota el diseño premium.",                buy:"Producto 15" },
  { name:"Tomás",     p:"Mi hijo quedó feliz con el juguete. Resistente y bien terminado.",                    buy:"Producto 8" },
];

const PROD_DESC = "Pieza hiper-optimizada e impresa en 3D con tecnología de alta resolución. Diseño de calidad crepuscular y alta ingeniería, fabricado en Chile a pedido. Acabado premium, resistente y listo para sorprender.";
