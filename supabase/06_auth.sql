-- ============================================================
-- LUNA 3D — Web v3 · Sesión 6 (Fase 6) · Cuentas de usuario
-- 06_auth.sql — perfiles + pedidos + RLS + trigger de alta
--
-- Aplicar en Supabase → SQL Editor (o vía Management API).
-- Idempotente: se puede correr más de una vez sin romper nada.
--
-- Modelo de seguridad (RLS estricta, patrón canónico Supabase):
--   • profiles: 1 fila por usuario (id = auth.users.id). Cada usuario
--     SOLO lee/escribe su propia fila (auth.uid() = id).
--   • orders: pedidos del usuario. Cada usuario SOLO ve/inserta los
--     suyos (auth.uid() = user_id). Sin UPDATE/DELETE público.
--   • Trigger handle_new_user: crea el perfil al registrarse, tomando
--     el nombre desde raw_user_meta_data->>'nombre'.
--   • La publishable key (rol anon) no puede leer estas tablas sin un
--     JWT de usuario: la RLS la deja en cero filas.
-- ============================================================

-- ---------- Helper updated_at (idempotente; ya existe del esquema base) ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text,
  telefono   text,
  comuna     text,
  direccion  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- Alta automática del perfil al registrarse ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, nullif(new.raw_user_meta_data->>'nombre', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ORDERS (pedidos; hoy se cierran por WhatsApp y se registran aquí
-- cuando el usuario tiene sesión iniciada)
-- ============================================================
create table if not exists public.orders (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  total      integer not null default 0,
  items      jsonb   not null default '[]'::jsonb,
  canal      text    not null default 'whatsapp',
  estado     text    not null default 'enviado',
  nombre     text,
  comuna     text
);

alter table public.orders enable row level security;

create index if not exists orders_user_created_idx
  on public.orders (user_id, created_at desc);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert to authenticated with check (auth.uid() = user_id);
