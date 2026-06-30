-- ============================================================
-- LUNA 3D — Web v3 · Fábrica de Catálogo · FASE A
-- 02_seed.sql — migración del catálogo actual de data.js → products
--
-- Cómo usar: correr DESPUÉS de 01_schema.sql, en el SQL Editor.
-- Idempotente: ON CONFLICT (id) DO NOTHING → no duplica ni pisa datos.
--
-- Migra los 20 slots actuales tal como están en data.js (sesión 2):
-- 5 categorías × 4 slots placeholder. SIN inventar nada:
--   price = null   → la web mostrará "Precio a confirmar"
--   img   = null   → placeholder "FOTO"
--   rating= null, reviews = 0  → sin reseñas
-- Todos entran como estado='borrador' (INVISIBLES en la web hasta
-- que Daniel los publique) y fuente='original', riesgo_ip='verde'
-- (son diseños propios de Luna 3D, sin problema de propiedad intelectual).
--
-- NOTA: estos son los slots placeholder. La carga de contenido REAL
-- (nombres, fotos, precios) es la sesión 3; se hará con UPDATEs o
-- reemplazando estos ids por slugs reales.
-- ============================================================

insert into public.products
  (id, cat, name, price, img, tag, featured, rating, reviews,
   colors, sizes, "desc", estado, fuente, riesgo_ip)
values
  -- Maceteros y jardín
  ('maceteros-1',   'maceteros',   'Macetero 1',      null, null, null,    true,  null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('maceteros-2',   'maceteros',   'Macetero 2',      null, null, null,    true,  null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('maceteros-3',   'maceteros',   'Macetero 3',      null, null, 'Nuevo', false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('maceteros-4',   'maceteros',   'Macetero 4',      null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  -- Decoración hogar
  ('decoracion-1',  'decoracion',  'Decoración 1',    null, null, null,    true,  null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('decoracion-2',  'decoracion',  'Decoración 2',    null, null, 'Nuevo', false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('decoracion-3',  'decoracion',  'Decoración 3',    null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('decoracion-4',  'decoracion',  'Decoración 4',    null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  -- Llaveros y accesorios
  ('llaveros-1',    'llaveros',    'Llavero 1',       null, null, null,    true,  null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('llaveros-2',    'llaveros',    'Llavero 2',       null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('llaveros-3',    'llaveros',    'Llavero 3',       null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('llaveros-4',    'llaveros',    'Llavero 4',       null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  -- Cultura pop y coleccionables
  ('cultura-pop-1', 'cultura-pop', 'Coleccionable 1', null, null, null,    true,  null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('cultura-pop-2', 'cultura-pop', 'Coleccionable 2', null, null, 'Nuevo', false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('cultura-pop-3', 'cultura-pop', 'Coleccionable 3', null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('cultura-pop-4', 'cultura-pop', 'Coleccionable 4', null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  -- Organización y oficina
  ('oficina-1',     'oficina',     'Organizador 1',   null, null, null,    true,  null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('oficina-2',     'oficina',     'Organizador 2',   null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('oficina-3',     'oficina',     'Organizador 3',   null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde'),
  ('oficina-4',     'oficina',     'Organizador 4',   null, null, null,    false, null, 0, null, null, null, 'borrador', 'original', 'verde')
on conflict (id) do nothing;

-- Verificación rápida (debería devolver 20 filas, todas 'borrador'):
--   select estado, count(*) from public.products group by estado;
