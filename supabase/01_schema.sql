-- ============================================================
-- LUNA 3D — Web v3 · Fábrica de Catálogo · FASE A
-- 01_schema.sql — tabla products + vista pública + RLS + trigger
--
-- Cómo usar: SQL Editor de Supabase → pegar TODO este archivo → Run.
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Diseño según PROMPT_FabricaCatalogo_Web_Luna3D_v3.md §3.
-- Regla dura: la web pública (anon) NUNCA ve borradores ni campos
-- internos (costo, margen, licencia, etc.). Solo lee la vista
-- products_public, que expone columnas seguras y solo filas
-- estado='publicado'. La escritura es exclusiva de service_role.
-- ============================================================

-- ---------- Helper: trigger updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Tabla principal ----------
create table if not exists public.products (
  -- Campos que ya consume la web (misma forma que data.js)
  id          text primary key,                 -- slug estable, ej. 'macetero-espiral-hexagonal'
  cat         text not null,                     -- id de categoría (FK lógica a las 5 categorías de data.js)
  name        text not null,                     -- nombre real
  price       integer,                           -- CLP entero, sin puntos; null = "Precio a confirmar"
  img         text,                              -- URL pública de la foto principal en el bucket
  gallery     jsonb,                             -- URLs de fotos de detalle (-2, -3, …)
  tag         text,                              -- 'Nuevo' | 'Oferta' | null
  featured    boolean not null default false,    -- flag de curación para la Home
  rating      numeric,                           -- null hasta tener reseñas reales
  reviews     integer not null default 0,
  colors      jsonb,                             -- null → paleta de marca por defecto (data.js)
  sizes       jsonb,                             -- null → ['Único']
  "desc"      text,                              -- null → descripción por defecto (data.js)
  cat_nombre  text,                              -- etiqueta visible de la categoría (categorías libres/dinámicas)
  subcat      text,                              -- subcategoría libre (ej. 'Pokémon'); null = sin subcategoría

  -- Campos internos del flujo automático (NO se exponen en la web)
  estado      text not null default 'borrador',  -- 'borrador' | 'publicado' | 'archivado'
  fuente      text,                              -- 'curado' | 'original'
  riesgo_ip   text,                              -- 'verde' (único que permite publicar) | 'rojo'
  licencia    jsonb,                             -- curados: { comercial:true, tipo:'CC-BY', origen:'<url>' }
  costo       numeric,                           -- costo interno (insumo del precio)
  gramos      numeric,                           -- material estimado
  tiempo_min  numeric,                           -- minutos de impresión estimados
  margen      numeric,                           -- margen sobre costo (interno)
  modelo_3d_url text,                            -- ubicación del .STL/.3MF cuando exista

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  -- Listas cerradas (enums vía CHECK, fáciles de migrar)
  constraint products_estado_chk    check (estado in ('borrador','publicado','archivado')),
  constraint products_fuente_chk    check (fuente is null or fuente in ('curado','original')),
  constraint products_riesgo_chk    check (riesgo_ip is null or riesgo_ip in ('verde','rojo')),
  constraint products_tag_chk       check (tag is null or tag in ('Nuevo','Oferta')),
  constraint products_price_chk     check (price is null or price >= 0),

  -- Regla dura de publicación: nada se publica con riesgo IP no-verde,
  -- y un curado solo se publica con licencia comercial.
  -- coalesce en todo: un dato faltante (riesgo_ip null, o curado sin licencia)
  -- debe evaluar a FALSE y BLOQUEAR, no a NULL (que en Postgres pasa el CHECK).
  constraint products_publish_guard check (
    estado <> 'publicado'
    or (
      coalesce(riesgo_ip, '') = 'verde'
      and (
        coalesce(fuente, '') <> 'curado'
        or coalesce((licencia->>'comercial')::boolean, false) = true
      )
    )
  )
);

-- Índices útiles para la web y el pipeline
create index if not exists products_estado_idx   on public.products (estado);
create index if not exists products_cat_idx       on public.products (cat);
create index if not exists products_featured_idx  on public.products (featured) where featured = true;

-- Trigger updated_at
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------- Vista pública (lo único que ve la web) ----------
-- Solo columnas seguras + solo filas publicadas. Sin security_invoker:
-- la vista corre con privilegios de su dueño y lee la tabla pese al RLS,
-- aplicando ella misma el filtro estado='publicado'. Así anon jamás
-- toca la tabla base ni los campos internos.
-- Migración idempotente: si la tabla ya existía, agrega las columnas nuevas
-- (categorías dinámicas). Seguro de correr varias veces.
alter table public.products add column if not exists cat_nombre text;
alter table public.products add column if not exists subcat     text;

create or replace view public.products_public as
  select
    id, cat, name, price, img, gallery, tag,
    featured, rating, reviews, colors, sizes, "desc",
    cat_nombre, subcat
  from public.products
  where estado = 'publicado';

comment on view public.products_public is
  'Vista pública de Luna 3D: solo productos publicados y columnas no sensibles. Es la única superficie que consume la web con la anon key.';

-- ---------- Row Level Security ----------
-- RLS activo en la tabla y SIN política para anon ⇒ acceso directo denegado.
-- service_role omite RLS por diseño ⇒ el agente escribe sin políticas extra.
alter table public.products enable row level security;
-- (No se crea ninguna policy: con RLS activo y sin policy, anon/authenticated
--  no pueden leer ni escribir la tabla directamente. Solo service_role pasa.)

-- ---------- Permisos (GRANTs) ----------
-- anon SOLO puede leer la vista; nunca la tabla base.
revoke all on public.products from anon, authenticated;
grant  select on public.products_public to anon, authenticated;

-- Nota: la escritura (INSERT/UPDATE para alta de borradores y publicación)
-- se hace con la SERVICE ROLE KEY desde el agente/servidor, que omite RLS.
-- Esa llave vive en variable de entorno, jamás en el repo ni en el cliente.
