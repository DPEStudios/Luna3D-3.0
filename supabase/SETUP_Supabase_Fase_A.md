# Fase A — Cimientos Supabase (guía pegar-y-ejecutar)

> Web Luna 3D v3 · Fábrica de Catálogo. Esta guía deja la base de datos lista
> para que el alta de un producto pase de "editar código + redeploy" a **un INSERT por API**.
> Cuando termines estos pasos, la **Fase B** (que la web lea de Supabase) ya tiene de dónde leer.

Todo está pensado para que **no tengas que saber SQL**: creas el proyecto, copias 3 llaves,
y pegas 3 archivos en el SQL Editor en orden. Nada de esto toca la web actual ni la venta por
WhatsApp: solo crea la base de datos en paralelo.

---

## Paso 1 — Crear el proyecto en Supabase

1. Entra a **https://supabase.com** → *Start your project* / inicia sesión (puedes usar tu cuenta de Google).
2. **New project**:
   - **Name:** `luna3d` (o el que quieras).
   - **Database Password:** genera una fuerte y **guárdala** (la pide para administración; no es ninguna de las 3 llaves de abajo).
   - **Region:** la más cercana — *South America (São Paulo)* es la mejor para Chile.
3. Espera ~2 minutos a que el proyecto quede listo.

---

## Paso 2 — Copiar las 3 llaves

En el proyecto → **Settings (engranaje) → API**. Copia:

| Llave | Dónde dice | Qué es | Dónde vive |
|---|---|---|---|
| **Project URL** | *Project URL* | dirección del proyecto | pública (segura) |
| **anon public** | *Project API keys → anon / public* | lectura pública (con RLS) | pública (va al cliente) |
| **service_role** | *Project API keys → service_role* | **escritura, SECRETA** | solo servidor/agente |

Pégalas en **`.claude-secrets/supabase.env`** (usa `ENV_TEMPLATE.txt` como molde).
Esa carpeta está en `.gitignore`: **no se sube al repo**.

> ⚠️ La **service_role** omite toda la seguridad. Nunca la pegues en el chat, en el código del
> sitio, ni en un archivo que se suba a git. Solo en `.claude-secrets/` y, más adelante, en las
> variables de entorno del hosting (Vercel/Netlify).

Cuando las tengas ahí, avísame ("ya pegué las llaves") y yo sigo con la Fase B.

---

## Paso 3 — Crear las tablas y la seguridad (SQL Editor)

En el proyecto → **SQL Editor** → *New query*. Pega y ejecuta **en este orden**, un archivo por vez (botón **Run**):

1. **`01_schema.sql`** → crea la tabla `products`, la vista pública `products_public`,
   el RLS (la web solo verá productos publicados y nunca los campos internos) y el trigger de fechas.
2. **`02_seed.sql`** → carga los 20 productos actuales como **borradores** (invisibles en la web hasta publicarlos).
3. **`03_storage.sql`** → crea el bucket de imágenes **`productos`** (público) y sus permisos.

Cada archivo termina con un comentario de verificación. Si Run dice *Success. No rows returned*, está OK.

---

## Paso 4 — Verificar (30 segundos)

En **Table Editor** deberías ver la tabla **`products`** con **20 filas**, todas con `estado = borrador`.

Para confirmar que la **vista pública no filtra nada todavía** (porque no hay publicados), corre en el SQL Editor:

```sql
select count(*) as publicados from public.products_public;   -- debe dar 0 (aún no hay publicados)
select estado, count(*) from public.products group by estado; -- debe dar borrador = 20
```

En **Storage** debería aparecer el bucket **`productos`** marcado como *Public*.

---

## Qué queda hecho al terminar la Fase A

- Tabla `products` con el esquema completo (campos de la web + campos internos del pipeline).
- Vista `products_public`: **lo único** que leerá la web (solo `publicado`, sin `costo`/`margen`/`licencia`).
- RLS: anon (la web) no puede tocar la tabla base; la escritura es exclusiva de la `service_role`.
- Bucket `productos` para las fotos, servido por CDN.
- Los 20 productos actuales migrados como borradores (nada cambia en la web pública).

## Lo que sigue (yo lo hago)

- **Fase B:** `catalogData.js` + wrapper `LUNA_DATA.getCatalog()` con estados Loading/Error/Empty,
  para que la web lea de la vista pública. WhatsApp y carrito quedan intactos.
- **Fase C+:** el pipeline del agente (descubrimiento → números → imagen → borrador → tu OK → publicado).

---

### Orden de archivos en esta carpeta

```
supabase/
├── 01_schema.sql              ← tabla + vista + RLS + trigger
├── 02_seed.sql                ← migra los 20 productos actuales (borradores)
├── 03_storage.sql             ← bucket 'productos' + permisos
├── ENV_TEMPLATE.txt           ← molde para .claude-secrets/supabase.env
└── SETUP_Supabase_Fase_A.md   ← esta guía
```
