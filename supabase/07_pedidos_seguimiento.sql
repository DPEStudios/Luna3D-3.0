-- ============================================================
-- LUNA 3D — Web v3 · Sesión 7 · SKU de productos + Pedidos & Seguimiento
-- 07_pedidos_seguimiento.sql
--
-- Aplicar en Supabase → SQL Editor o vía Management API. Idempotente.
--
-- Resumen:
--  A) products: + columna sku (LN-<CAT>-<NNNN>), inmutable, autollenada por
--     trigger; backfill de las filas existentes; expuesta en products_public.
--  B) orders: pedido invitado (user_id nullable), código público no secuencial
--     (codigo), bandera confirmado (modelo HÍBRIDO: el pedido nace OCULTO y sólo
--     se hace visible al seguimiento cuando Daniel lo confirma) y máquina de
--     estados validada por CHECK.
--  C) order_events: historial de estados (línea de tiempo), poblado por trigger.
--  D) RPCs: create_order (alta pública segura), track_order (consulta pública
--     por código, sin datos personales) y admin_advance_order (sólo service_role).
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================
-- A) SKU DE PRODUCTOS
-- ============================================================
alter table public.products add column if not exists sku text;

-- Código de 3 letras por categoría (5 conocidas + fallback dinámico).
create or replace function public.sku_cat_code(p_cat text)
returns text language plpgsql immutable as $$
declare c text;
begin
  case p_cat
    when 'maceteros'   then return 'MAC';
    when 'decoracion'  then return 'DEC';
    when 'llaveros'    then return 'LLA';
    when 'cultura-pop' then return 'CUL';
    when 'oficina'     then return 'OFI';
    else
      c := upper(regexp_replace(coalesce(p_cat,''), '[^a-zA-Z]', '', 'g'));
      if length(c) < 3 then c := rpad(c, 3, 'X'); else c := left(c, 3); end if;
      return c;
  end case;
end; $$;

-- Próximo SKU correlativo para una categoría (según su código de 3 letras).
create or replace function public.next_sku(p_cat text)
returns text language plpgsql as $$
declare code text; n int;
begin
  code := public.sku_cat_code(p_cat);
  select coalesce(max( nullif(regexp_replace(split_part(sku,'-',3),'[^0-9]','','g'),'')::int ), 0) + 1
    into n
    from public.products
   where sku like 'LN-'||code||'-%';
  return 'LN-'||code||'-'||lpad(n::text, 4, '0');
end; $$;

-- Trigger: autollena el SKU al insertar; lo deja INMUTABLE al actualizar.
create or replace function public.products_sku_guard()
returns trigger language plpgsql as $$
begin
  if (TG_OP = 'INSERT') then
    if new.sku is null or new.sku = '' then
      new.sku := public.next_sku(new.cat);
    end if;
  elsif (TG_OP = 'UPDATE') then
    if old.sku is not null and old.sku <> '' then
      new.sku := old.sku;                      -- SKU inmutable
    elsif new.sku is null or new.sku = '' then
      new.sku := public.next_sku(new.cat);
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_products_sku on public.products;
create trigger trg_products_sku
  before insert or update on public.products
  for each row execute function public.products_sku_guard();

-- Backfill de filas existentes sin SKU (orden estable por fecha de alta).
with seq as (
  select id,
         'LN-'||public.sku_cat_code(cat)||'-'||
         lpad(row_number() over (partition by public.sku_cat_code(cat)
                                 order by created_at, id)::text, 4, '0') as new_sku
    from public.products
   where sku is null or sku = ''
)
update public.products p
   set sku = seq.new_sku
  from seq
 where seq.id = p.id;

create unique index if not exists products_sku_key on public.products (sku);

-- Exponer SKU en la vista pública (al final, sin reordenar columnas).
create or replace view public.products_public as
  select id, cat, name, price, img, gallery, tag,
         featured, rating, reviews, colors, sizes, "desc",
         cat_nombre, subcat, sku
    from public.products
   where estado = 'publicado';
grant select on public.products_public to anon, authenticated;

-- ============================================================
-- B) ORDERS — pedido invitado + código + máquina de estados
-- ============================================================
alter table public.orders alter column user_id drop not null;
alter table public.orders add column if not exists codigo text;
alter table public.orders add column if not exists confirmado boolean not null default false;
alter table public.orders alter column estado set default 'pendiente';

alter table public.orders drop constraint if exists orders_estado_chk;
alter table public.orders add constraint orders_estado_chk check (estado in (
  'pendiente','recibido','en_revision','en_produccion','listo_despacho','enviado','entregado','cancelado'
));

create unique index if not exists orders_codigo_key on public.orders (codigo);

-- Código corto, legible y no adivinable: LN-XXXXXX (sin 0/O/1/I).
create or replace function public.gen_order_code()
returns text language plpgsql as $$
declare
  abc text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text; i int; ok boolean;
begin
  loop
    code := 'LN-';
    for i in 1..6 loop
      code := code || substr(abc, 1 + floor(random()*length(abc))::int, 1);
    end loop;
    select not exists(select 1 from public.orders where codigo = code) into ok;
    exit when ok;
  end loop;
  return code;
end; $$;

create or replace function public.orders_code_fill()
returns trigger language plpgsql as $$
begin
  if new.codigo is null or new.codigo = '' then
    new.codigo := public.gen_order_code();
  end if;
  return new;
end; $$;

drop trigger if exists trg_orders_code on public.orders;
create trigger trg_orders_code
  before insert on public.orders
  for each row execute function public.orders_code_fill();

-- ============================================================
-- C) ORDER_EVENTS — línea de tiempo del seguimiento
-- ============================================================
create table if not exists public.order_events (
  id         bigint generated always as identity primary key,
  order_id   bigint not null references public.orders(id) on delete cascade,
  estado     text   not null,
  nota       text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

alter table public.order_events enable row level security;
revoke all on public.order_events from anon, authenticated;  -- sólo vía RPC/service_role

-- Log automático: al crear el pedido y ante cada cambio de estado.
create or replace function public.log_order_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'INSERT') then
    insert into public.order_events(order_id, estado) values (new.id, new.estado);
  elsif (TG_OP = 'UPDATE' and new.estado is distinct from old.estado) then
    insert into public.order_events(order_id, estado) values (new.id, new.estado);
  end if;
  return new;
end; $$;

drop trigger if exists trg_orders_log_ins on public.orders;
create trigger trg_orders_log_ins after insert on public.orders
  for each row execute function public.log_order_event();

drop trigger if exists trg_orders_log_upd on public.orders;
create trigger trg_orders_log_upd after update on public.orders
  for each row execute function public.log_order_event();

-- ============================================================
-- D) RPCs
-- ============================================================
-- D.1) Alta de pedido (pública y segura). Crea un pedido 'pendiente' (oculto)
-- y devuelve el código. Enriquece cada ítem con SKU/nombre desde products
-- (fuente de verdad), usando la cantidad/precio del cliente.
create or replace function public.create_order(
  p_items  jsonb,
  p_total  integer default 0,
  p_nombre text default null,
  p_comuna text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_items jsonb := '[]'::jsonb;
  v_elem jsonb; v_id text; v_qty int; v_price int; v_n int := 0;
  v_prod record; v_codigo text; v_estado text;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'items inválidos';
  end if;
  for v_elem in select * from jsonb_array_elements(p_items) loop
    v_n := v_n + 1;
    exit when v_n > 50;                                   -- tope defensivo
    v_id := nullif(v_elem->>'id','');
    v_qty := greatest(1, least(coalesce((v_elem->>'qty')::int, 1), 999));
    v_price := greatest(coalesce((v_elem->>'price')::int, 0), 0);
    select sku, name into v_prod from public.products where id = v_id;
    v_items := v_items || jsonb_build_object(
      'id', v_id,
      'sku', coalesce(v_prod.sku, v_elem->>'sku'),
      'name', coalesce(v_prod.name, v_elem->>'name'),
      'qty', v_qty, 'price', v_price);
  end loop;

  insert into public.orders(user_id, total, items, canal, estado, confirmado, nombre, comuna)
  values (v_uid, greatest(coalesce(p_total,0),0), v_items, 'whatsapp', 'pendiente', false,
          nullif(trim(coalesce(p_nombre,'')),''), nullif(trim(coalesce(p_comuna,'')),''))
  returning codigo, estado into v_codigo, v_estado;

  return jsonb_build_object('ok', true, 'codigo', v_codigo, 'estado', v_estado);
end; $$;
revoke all on function public.create_order(jsonb,integer,text,text) from public;
grant execute on function public.create_order(jsonb,integer,text,text) to anon, authenticated;

-- D.2) Consulta pública de seguimiento. NO expone datos personales. Híbrido:
-- si el pedido no está confirmado por Daniel, responde 'en validación'.
create or replace function public.track_order(p_codigo text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_ord public.orders;
  v_codigo text := upper(regexp_replace(coalesce(p_codigo,''), '\s', '', 'g'));
  v_eventos jsonb;
  v_visible boolean;
begin
  if v_codigo = '' then return jsonb_build_object('found', false); end if;
  select * into v_ord from public.orders
   where upper(codigo) = v_codigo or upper(codigo) = 'LN-'||v_codigo
   limit 1;
  if not found then return jsonb_build_object('found', false); end if;

  -- Visible si Daniel lo confirmó (bandera) o si ya avanzó de estado: así
  -- confirmar desde el Table Editor de Supabase es un solo cambio (estado).
  v_visible := v_ord.confirmado or v_ord.estado <> 'pendiente';
  if not v_visible then
    return jsonb_build_object('found', true, 'confirmado', false,
                              'estado', 'pendiente', 'creado', v_ord.created_at);
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('estado', e.estado, 'fecha', e.created_at)
                            order by e.created_at), '[]'::jsonb)
    into v_eventos
    from public.order_events e
   where e.order_id = v_ord.id and e.estado <> 'pendiente';

  return jsonb_build_object('found', true, 'confirmado', true,
    'codigo', v_ord.codigo, 'estado', v_ord.estado, 'creado', v_ord.created_at,
    'total', v_ord.total, 'items', v_ord.items, 'eventos', v_eventos);
end; $$;
revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;

-- D.3) Avanzar/confirmar estado (operación de Daniel). SÓLO service_role:
-- revocada para anon/authenticated. Mover fuera de 'pendiente' CONFIRMA el
-- pedido (lo hace visible al seguimiento). El trigger registra el evento.
create or replace function public.admin_advance_order(p_codigo text, p_estado text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_codigo text := upper(regexp_replace(coalesce(p_codigo,''),'\s','','g')); v_row public.orders;
begin
  if p_estado not in ('pendiente','recibido','en_revision','en_produccion','listo_despacho','enviado','entregado','cancelado') then
    raise exception 'estado inválido: %', p_estado;
  end if;
  update public.orders
     set estado = p_estado, confirmado = (confirmado or p_estado <> 'pendiente')
   where upper(codigo) = v_codigo or upper(codigo) = 'LN-'||v_codigo
  returning * into v_row;
  if not found then raise exception 'pedido no encontrado: %', p_codigo; end if;
  return jsonb_build_object('ok', true, 'codigo', v_row.codigo, 'estado', v_row.estado, 'confirmado', v_row.confirmado);
end; $$;
revoke all on function public.admin_advance_order(text,text) from public, anon, authenticated;
grant execute on function public.admin_advance_order(text,text) to service_role;

-- Refrescar el caché de PostgREST para exponer las RPCs nuevas.
notify pgrst, 'reload schema';
