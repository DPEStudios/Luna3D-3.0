-- ============================================================
-- LUNA 3D — Migración: categorías dinámicas + subcategorías
-- 2026-06-14  (rev. 2: columnas nuevas al FINAL de la vista)
--
-- Cómo usar: Supabase → SQL Editor → pega TODO → Run.
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Qué hace:
--   1) Agrega columnas cat_nombre (etiqueta visible de la categoría) y
--      subcat (subcategoría libre, ej. 'Pokémon') a la tabla products.
--   2) Recrea la vista pública products_public EXPONIENDO esas columnas.
--      Se agregan AL FINAL del select para no reordenar columnas existentes
--      (Postgres no permite renombrar/reordenar columnas con CREATE OR REPLACE
--       VIEW; por eso van al final). El orden no afecta a la web: lee por nombre.
-- ============================================================

alter table public.products add column if not exists cat_nombre text;
alter table public.products add column if not exists subcat     text;

create or replace view public.products_public as
  select
    id, cat, name, price, img, gallery, tag,
    featured, rating, reviews, colors, sizes, "desc",
    cat_nombre, subcat
  from public.products
  where estado = 'publicado';

-- Verificación rápida (opcional):
-- select id, cat, cat_nombre, subcat from public.products_public limit 20;
