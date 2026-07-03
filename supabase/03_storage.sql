-- ============================================================
-- LUNA 3D — Web v3 · Fábrica de Catálogo · FASE A
-- 03_storage.sql — bucket de imágenes 'productos' + políticas
--
-- Cómo usar: correr en el SQL Editor (después de 01 y 02).
-- Idempotente. Alternativa: crear el bucket a mano en
-- Storage → New bucket → nombre 'productos' → Public.
--
-- Diseño según §4: bucket público (servido por CDN), rutas
-- 'productos/<id>/<id>-1.jpg' (principal), '-2', '-3' (galería).
-- Lectura pública; escritura SOLO con service_role (el agente
-- sube las imágenes ya optimizadas). anon nunca escribe.
-- ============================================================

-- ---------- Crear el bucket público ----------
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

-- ---------- Políticas de acceso a los objetos del bucket ----------
-- Lectura pública (cualquiera puede VER las imágenes vía URL/CDN).
drop policy if exists "productos lectura publica" on storage.objects;
create policy "productos lectura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'productos');

-- Escritura: NINGUNA política para anon/authenticated ⇒ no pueden subir.
-- service_role omite RLS, así que el agente sube/edita/borra imágenes
-- con la service role key sin necesidad de políticas adicionales.

-- Verificación: en Storage debería aparecer el bucket 'productos' (Public).
