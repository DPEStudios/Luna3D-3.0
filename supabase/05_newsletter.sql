-- ============================================================
-- LUNA3D — Newsletter (captura de correos del footer) · Sesión 3 (T11)
-- Pegar y ejecutar en Supabase → SQL Editor (proyecto dlvechohqlwysryxguqm).
-- Idempotente: se puede ejecutar más de una vez sin romper nada.
--
-- Patrón de seguridad (escritura pública canónica de Supabase):
--   • La web NUNCA toca la tabla directamente: la publishable key (rol anon)
--     no tiene NINGÚN permiso sobre newsletter_subscribers.
--   • El único camino público es la función subscribe_newsletter(...), que es
--     SECURITY DEFINER: corre con los permisos del dueño, valida el formato,
--     normaliza el correo y hace ON CONFLICT DO NOTHING (no duplica ni revela
--     si el correo ya existía). Solo la SECRET/service_role puede LEER la lista.
-- ============================================================

create extension if not exists citext;

create table if not exists public.newsletter_subscribers (
  id          bigint generated always as identity primary key,
  email       citext  not null unique,            -- único, case-insensitive
  source      text,                                -- p. ej. 'web_footer'
  created_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- El rol público (anon) y authenticated NO tocan la tabla directamente.
revoke all on public.newsletter_subscribers from anon, authenticated;
-- (Sin policies para anon/authenticated → ni leer ni escribir directo.)

-- Único camino público: función de alta. SECURITY DEFINER = corre como el dueño.
create or replace function public.subscribe_newsletter(p_email text, p_source text default 'web')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_email is null
     or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'correo inválido' using errcode = '22023';
  end if;
  insert into public.newsletter_subscribers(email, source)
  values (lower(p_email), coalesce(nullif(p_source,''),'web'))
  on conflict (email) do nothing;
end;
$$;

-- Solo se puede EJECUTAR la función (no leer la tabla).
revoke all on function public.subscribe_newsletter(text, text) from public;
grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;
