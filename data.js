/* ============================================================
   LUNA3D — Datos del catálogo (v3)
   SESIÓN 2 (2026-06-12): estructura de catálogo REAL.

   5 categorías reales (Set 5) × 4 slots placeholder cada una = 20.
   Cada slot está listo para llenar con contenido VERDADERO en la
   sesión 3 (nombre, foto, precio, variantes), según la pauta de
   fotos y precios.

   REGLA (no inventar datos): los slots traen
     price:null    → la UI muestra "Precio a confirmar"
     img:null      → la UI muestra el placeholder "FOTO"
     reviews:0, rating:null  → sin reseñas inventadas
   'featured' y 'tag' son flags de CURACIÓN (no métricas de venta):
   sirven para poblar las secciones de la Home y son editables.

   Para llenar un producto real en la sesión 3, basta reemplazar
   name, price e img (y opcionalmente colors/sizes/desc/tag).
   ============================================================ */

/* Precio CLP — null-safe: sin precio aún → "Precio a confirmar" */
const CLP = n => (n == null || Number.isNaN(n))
  ? "Precio a confirmar"
  : "$" + n.toLocaleString("es-CL");

/* ---------- Variantes por defecto (sobrescribibles por producto) ----------
   Colores = paleta de marca (Manual de Marca v1.0). Los colores REALES de
   filamento en stock se definen producto por producto en la sesión 3
   (ver pauta). Un producto puede traer su propio `colors` y `sizes`. */
const DEFAULT_COLORS = [
  { name:'Aurora',   css:'linear-gradient(125deg,#E81F9D,#9B27E0)' },
  { name:'Magenta',  css:'#E81F9D' },
  { name:'Violeta',  css:'#9B27E0' },
  { name:'Estrella', css:'#F5F6FB' },
  { name:'Espacial', css:'#0B1437' },
];
/* Sin tallas inventadas: un único tamaño hasta que Daniel defina variantes */
const DEFAULT_SIZES = ['Único'];

/* ---------- CATEGORÍAS REALES (Set 5) ----------
   `personas` mapea cada categoría a los perfiles del buscador de regalos
   de la Home (gamer / hogar / oficina / especial). Así el gift finder
   lee desde los datos en vez de IDs hardcodeados. */
const CATEGORIES = [
  { id:'maceteros',   name:'Maceteros y jardín',           icon:'plant', desc:'Maceteros, materas y piezas para tus plantas, impresos a pedido en Chile.',  personas:['hogar'] },
  { id:'decoracion',  name:'Decoración hogar',             icon:'home',  desc:'Objetos decorativos y funcionales para darle personalidad a tus espacios.',  personas:['hogar','especial'] },
  { id:'llaveros',    name:'Llaveros y accesorios',        icon:'gem',   desc:'Llaveros, pines y accesorios personalizables, ideales para regalar.',        personas:['especial'] },
  { id:'cultura-pop', name:'Cultura pop y coleccionables', icon:'star',  desc:'Figuras, coleccionables y piezas de cultura pop, gaming y geek.',             personas:['gamer','especial'] },
  { id:'oficina',     name:'Organización y oficina',       icon:'cube',  desc:'Organizadores, soportes y utilidades para tu escritorio y home office.',     personas:['oficina'] },
];

const CAT_NAME = Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]));

/* ---------- CATÁLOGO INICIAL (slots placeholder) ----------
   Definición compacta por categoría:
     [ catId, prefijoNombre, nº slots, featuredSlots[], nuevoSlots[] ]
   featured/nuevo son flags de curación para la Home (editables). */
const CATALOG_SEED = [
  ['maceteros',   'Macetero',      4, [1, 2], [3]],
  ['decoracion',  'Decoración',    4, [1],    [2]],
  ['llaveros',    'Llavero',       4, [1],    []],
  ['cultura-pop', 'Coleccionable', 4, [1],    [2]],
  ['oficina',     'Organizador',   4, [1],    []],
];

const PRODUCTS = [];
CATALOG_SEED.forEach(([cat, label, count, featured, nuevo]) => {
  for (let j = 1; j <= count; j++) {
    PRODUCTS.push({
      id:       `${cat}-${j}`,
      cat,
      catName:  CAT_NAME[cat],
      name:     `${label} ${j}`,        // PLACEHOLDER — reemplazar en sesión 3
      price:    null,                    // sin precio inventado
      img:      null,                    // sin foto aún → placeholder "FOTO"
      tag:      nuevo.includes(j) ? 'Nuevo' : null,   // 'Nuevo' | 'Oferta' | null
      featured: featured.includes(j),    // destacado del equipo (no métrica)
      rating:   null,                    // sin reseñas reales
      reviews:  0,
      colors:   null,                    // null → DEFAULT_COLORS
      sizes:    null,                    // null → DEFAULT_SIZES
      desc:     null,                    // null → PROD_DESC
    });
  }
});

const PROD_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

/* ---------- Testimonios — PROVISORIOS ----------
   Se reemplazan por reseñas reales en la sesión 3. `buy` referencia
   la categoría para no apuntar a productos placeholder. */
const TESTIMONIALS = [
  { name:'Valentina', p:'La calidad de impresión es brutal y el acabado mate se ve premium.',          buy:'Maceteros y jardín' },
  { name:'Matías',    p:'Encajó perfecto y llegó súper rápido. Lo recomiendo 100%.',                    buy:'Organización y oficina' },
  { name:'Camila',    p:'Un regalo ideal, a mi hermana le fascinó. La atención al detalle es increíble.', buy:'Llaveros y accesorios' },
  { name:'Joaquín',   p:'Calidad superior a lo esperado, con empaque cuidado y entrega puntual.',        buy:'Cultura pop y coleccionables' },
  { name:'Francisca', p:'Perfecto para mi home office, encajó exacto con lo que buscaba.',               buy:'Decoración hogar' },
  { name:'Tomás',     p:'Se nota el diseño premium y la pieza es resistente y bien terminada.',          buy:'Cultura pop y coleccionables' },
];

/* Descripción por defecto (cuando un producto aún no tiene `desc` real) */
const PROD_DESC = "Pieza impresa en 3D a pedido en Chile, con tecnología de alta resolución. Diseño optimizado, acabado premium y resistente. El detalle real de este producto se completará pronto.";
