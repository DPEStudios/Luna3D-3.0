---
name: producto-borrador
description: Captura productos del catálogo Luna 3D (Estrella 3D, Daniel Pardo) a partir de FOTOS, dejándolos como borradores locales listos para subir a la web. Úsala SIEMPRE que Daniel envíe una o más fotos de un producto impreso en 3D y diga frases como 'nuevo producto', 'guarda esta foto', 'agrega este producto', 'producto para la web', 'este es para Luna 3D', 'captura estos productos', 'arma la ficha de este producto', o pegue fotos de piezas (maceteros, decoración, llaveros, cultura pop, organización/oficina) para el catálogo. La skill MIRA la foto, PROPONE la ficha completa (nombre, categoría, descripción, etiqueta, colores, precio sugerido) para que Daniel solo corrija, PREGUNTA los datos internos que no se ven (costo, gramos, tiempo de impresión), calcula el margen, y guarda todo en la carpeta de borradores con la imagen ya optimizada. NO sube nada a internet (eso lo hace la skill publicar-producto). NUNCA inventa precios ni características: lo que no se sabe, se pregunta o queda pendiente.
---

# Producto Borrador — Captura de catálogo Luna 3D

## Contexto

Daniel Pardo dirige **Estrella 3D** (marca B2C **Luna 3D**). La web `Web_Luna3D_v3/`
ya lee su catálogo **en vivo desde Supabase** (Fase B): publicar un producto es
insertar una fila en la tabla `products` y subir la foto al bucket `productos`.
Esta skill es el **primer paso**: convertir una foto + datos en un **borrador local
ordenado**, sin subir nada todavía.

**Filosofía de velocidad: "propongo y tú corriges".** Daniel pasa muchas fotos.
No le hagas 10 preguntas por producto. Mira la foto, **rellena tú toda la ficha**
con tu mejor propuesta, y deja que él solo ajuste lo que esté mal.

## Reglas duras (no se negocian)

1. **No inventar datos.** El precio real, el costo, los gramos y el tiempo los da
   Daniel. La descripción la propones tú, pero **sin inventar características que no
   se puedan ver** (no "resistente al agua" si no consta). Lo que falte → se pregunta
   o queda como pendiente, nunca se rellena con un dato falso.
2. **Categorías = lista cerrada** (5): `maceteros`, `decoracion`, `llaveros`,
   `cultura-pop`, `oficina`. Si dudas, pregunta.
3. **Papelera segura:** nunca borres fotos ni borradores de Daniel sin invocar la
   skill `papelera-segura`.
4. **Autonomía:** todo vive dentro de `Web_Luna3D_v3/`. No referencies el Excel
   maestro ni otros proyectos (los datos económicos se guardan aquí, en la ficha).

## Flujo de trabajo

### 1. Ubica el proyecto
`Web_Luna3D_v3/` (en sesión, suele estar en `/sessions/<ID>/mnt/AI/01_Estrella3D/Web_Luna3D_v3`).
Si no está montado, pídele a Daniel que lo monte.

### 2. Por cada foto, PROPÓN la ficha completa
Mira la imagen y arma una propuesta. Presenta una tarjeta clara y pídele que
corrija. Propón:

- **name** — nombre comercial corto y atractivo (ej. "Macetero Hexagonal Aurora").
- **cat** — una de las 5 categorías (dedúcela de la foto).
- **desc** — 2–3 frases, tono de marca Luna 3D (premium, impreso a pedido en Chile,
  acabado cuidado), **sin inventar specs**.
- **tag** — `Nuevo`, `Oferta` o ninguno (curación).
- **featured** — true/false (¿lo destacamos en la Home?).
- **colors** — si la foto muestra un color claro, propónlo; si no, deja `null`
  (la web aplica la paleta de marca por defecto).
- **sizes** — normalmente `null` (= "Único"); solo si hay variantes reales.
- **price** — propón un **rango orientativo**, pero **Daniel confirma el precio real**.

### 3. PREGUNTA solo lo que no se ve (datos internos)
En el MISMO mensaje, pide los tres que no se pueden deducir de la foto:

- **costo** (CLP de material+luz+etc. — Daniel lo saca de su calculadora),
- **gramos** (peso de filamento),
- **tiempo_min** (minutos de impresión).

Con `price` y `costo` la skill calcula **margen** = (precio − costo) / precio.
Si Daniel aún no los tiene, guarda igual el borrador y déjalos pendientes.

### 4. Guarda el borrador
Cuando Daniel confirme, ejecuta el script (una vez por producto):

```bash
python3 scripts/guardar_borrador.py \
  --json '{"name":"...","cat":"maceteros","price":6990,"costo":2100,"gramos":85,"tiempo_min":180,"tag":"Nuevo","featured":true,"desc":"..."}' \
  --imagen /ruta/a/la/foto.jpg
# opcional: --galeria /r/g1.jpg /r/g2.jpg   ·   --proyecto /ruta/a/Web_Luna3D_v3
```

El script: genera el `slug` (`<cat>-<nombre>`), **optimiza la foto** (reorienta por
EXIF, quita metadatos, redimensiona a 1400px, JPEG 85), calcula el margen, y guarda
en `_Borradores_Productos/<cat>/<slug>/ficha.json` + `<slug>.jpg`. Marca
`estado_local: borrador`. Si vuelves a guardar el mismo slug, lo actualiza.

### 5. Cierra
Confirma a Daniel qué quedó guardado y si algo quedó **pendiente** (precio/costo/
gramos/tiempo/foto). Cuando tenga varios listos, la skill **`publicar-producto`**
los sube y publica.

## Campos de la ficha (referencia)

| Campo | Origen | Notas |
|---|---|---|
| `name`, `cat`, `desc`, `tag`, `featured`, `colors`, `sizes` | propuesta de Claude + visto bueno | web |
| `price` | **Daniel** | CLP; `null` = "Precio a confirmar" |
| `costo`, `gramos`, `tiempo_min` | **Daniel** | internos; `margen` se calcula |
| `id` (slug), `margen`, `fuente='original'`, `riesgo_ip='verde'`, `estado_local` | automático | — |
| `imagen_local`, `galeria_local` | automático | nombres de archivo guardados |

> La descripción y los flags son editables: si Daniel cambia algo, vuelve a correr
> el script con el mismo `name`/`id` para actualizar el borrador.
