---
name: publicar-producto
description: Sube y publica en la web Luna 3D (Estrella 3D, Daniel Pardo) los productos que están como borradores locales en _Borradores_Productos/. Usa esta skill SIEMPRE que Daniel diga frases como "subamos a la web", "sube los productos", "publica tal producto", "publiquemos los que estén listos", "qué borradores tengo", "qué productos faltan por subir", "baja/despublica tal producto", "actualiza tal producto en la web", o cualquier referencia a llevar los borradores de Luna 3D a Supabase / a la página. La skill sube la foto al bucket público `productos`, hace UPSERT de la fila en la tabla `products` como borrador, y la PUBLICA solo con el OK de Daniel (cambia estado='publicado' y aparece en la web al instante). También lista el estado de cada borrador, avisa cuáles tienen datos faltantes, y permite despublicar. NO inventa datos: sube exactamente lo que hay en cada ficha.json. Distinta de 'producto-borrador' (que CAPTURA fotos a borradores): esta SUBE y PUBLICA.
---

# Publicar Producto — Subida del catálogo Luna 3D a la web

## Contexto

La web `Web_Luna3D_v3/` lee su catálogo **en vivo desde Supabase** (vista pública
`products_public`, solo `estado='publicado'`). Esta skill toma los borradores
locales que dejó la skill **`producto-borrador`** y los lleva a la web. **No hay que
tocar código ni re-desplegar**: publicar = cambiar un campo en la base de datos.

### Cómo funciona la subida (3 pasos, todo automático con el script)
1. **Foto → bucket.** Sube `<slug>.jpg` al bucket público `productos`. Queda con URL
   pública permanente (`…/storage/v1/object/public/productos/<slug>.jpg`).
2. **Fila → tabla `products`.** UPSERT de la fila con esa URL en `img` + todos los
   datos, como **`estado='borrador'`** (todavía invisible en la web).
3. **Publicar.** Con el OK de Daniel, `estado='publicado'` → aparece en la web al
   instante.

## Reglas duras

1. **Seguridad:** la **secret key** se lee del archivo `.claude-secrets/supabase.env`
   del proyecto. **Nunca** la imprimas, la repitas en el chat, ni la pongas en el
   repo. El script la usa solo en el header `apikey`.
2. **No publicar sin OK.** Subir (a borrador) puede ser automático; **publicar
   requiere visto bueno explícito de Daniel**, producto por producto o "todos los
   listos".
3. **No inventar datos.** Si a un borrador le falta precio/costo/gramos/tiempo/foto,
   **no lo subas**: avísale a Daniel qué le falta y déjalo pendiente.
4. **Respeta la DECISIÓN de Daniel** (campo `decision` en la ficha):
   - `listo` → candidato a subir/publicar. `subir --todos` solo toma estos.
   - `pendiente` → NO entra en lote; solo se sube si Daniel lo nombra por slug.
   - `rechazado` → NUNCA se sube (el editor ya lo movió a `_Papelera`).
5. **Categorías libres.** No valides contra ninguna lista cerrada. Se envían a la
   base `cat` (slug), `cat_nombre` (etiqueta) y `subcat`.
6. **Papelera segura** para cualquier borrado de archivos del usuario.

## Flujo de trabajo

### 1. Mostrar el estado de los borradores
```bash
python3 scripts/subir_producto.py listar
```
Muestra cada borrador con su `estado_local` (📝 borrador / ⬆️ subido / ✅ publicado),
su `decision` (🕓 pendiente / 🟢 listo / 🔴 rechazado), categoría › subcategoría,
precio, y si está **LISTO** o qué datos le **faltan**. Resume esto a Daniel y
pregúntale cuáles subir/publicar.

### 2. Subir (a borrador en la DB) los que estén listos
```bash
python3 scripts/subir_producto.py subir <slug> [<slug> ...]
python3 scripts/subir_producto.py subir --todos          # todos los que estén LISTOS
```
Sube foto(s) al bucket + UPSERT de la fila como borrador. Salta los que tengan datos
faltantes y lo informa. Actualiza cada `ficha.json` a `estado_local: subido` y guarda
la URL pública de la imagen.

### 3. Publicar (con el OK de Daniel)
```bash
python3 scripts/subir_producto.py publicar <slug> [<slug> ...]
python3 scripts/subir_producto.py publicar --todos-subidos
```
Cambia `estado='publicado'`. Aparece en la web de inmediato. (La regla
`products_publish_guard` de la base exige `riesgo_ip='verde'`; los productos propios
de Daniel ya lo cumplen.)

### 4. Despublicar / corregir
```bash
python3 scripts/subir_producto.py despublicar <slug>     # vuelve a borrador (sale de la web)
```
Para **modificar** un producto ya publicado: edita su `ficha.json` (o re-captúralo con
`producto-borrador`), vuelve a `subir` (UPSERT lo actualiza) y, si hace falta, `publicar`.

## Notas

- **Ubicación:** el script autodescubre `Web_Luna3D_v3/`. Si no, pásale
  `--proyecto /ruta/a/Web_Luna3D_v3`.
- **slug = id** del producto en la base. Re-subir el mismo slug **actualiza** la fila
  y reemplaza la foto (no duplica).
- **Categorías y testimonios** de la Home siguen en `data.js` (no en la DB todavía);
  esta skill solo maneja productos.
- Tras una tanda de publicaciones, ofrécele a Daniel revisar la web local
  (`python3 -m http.server 8080` → `http://localhost:8080`).
