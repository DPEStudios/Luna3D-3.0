---
name: producto-borrador
description: Captura productos del catálogo Luna 3D (Estrella 3D, Daniel Pardo) a partir de FOTOS, dejándolos como borradores locales listos para subir a la web. Úsala SIEMPRE que Daniel envíe una o más fotos de un producto impreso en 3D y diga frases como 'nuevo producto', 'guarda esta foto', 'agrega este producto', 'producto para la web', 'este es para Luna 3D', 'captura estos productos', 'arma la ficha de este producto', o pegue fotos de piezas para el catálogo. La skill MIRA la foto, PROPONE la ficha completa (nombre, descripción, colores, precio sugerido, y una categoría/subcategoría sugerida), e invita a Daniel a confirmar la categoría. Las categorías y subcategorías son LIBRES y dinámicas: si no existen, se crean; si existen, se reutilizan. Los datos internos que no se ven (costo, gramos, tiempo) se AUTOINVENTAN con valores razonables salvo que Daniel los entregue. Guarda todo en la carpeta de borradores con la imagen ya optimizada. NO sube nada a internet (eso lo hace la skill publicar-producto).
---

# Producto Borrador — Captura de catálogo Luna 3D

## Contexto

Daniel Pardo dirige **Estrella 3D** (marca B2C **Luna 3D**). La web `Web_Luna3D_v3/`
lee su catálogo **en vivo desde Supabase** (Fase B): publicar un producto es insertar
una fila en la tabla `products` y subir la foto al bucket `productos`. Esta skill es el
**primer paso**: convertir una foto + datos en un **borrador local ordenado**, sin
subir nada todavía.

**Filosofía de velocidad: "propongo y tú corriges".** Daniel pasa muchas fotos.
No le hagas preguntas que no hacen falta. Mira la foto, **rellena tú toda la ficha**
con tu mejor propuesta (incluidos los datos internos), y deja que él solo ajuste lo
que esté mal.

## Reglas duras (no se negocian)

1. **Categorías y subcategorías DINÁMICAS (texto libre, no hay lista fija).**
   Daniel no quiere categorías predefinidas: imprime una pieza y al cargarla decide
   su categoría/subcategoría. Si la que indica no existe, **se crea sola**; si ya
   existe, **se reutiliza**. No valides contra ninguna lista cerrada.
   - **`cat`** = el texto que indique Daniel (ej. "Cultura pop", "Stickers"). El
     script lo convierte en `slug` estable (`cat`) y guarda la etiqueta visible en
     `cat_nombre`.
   - **`subcat`** = texto libre (ej. "Pokémon", "Zelda", "Maceteros") o `null`.
   - **Propón** la categoría/subcategoría que mejor calce con la foto, pero deja que
     **Daniel la confirme o cambie**. No la des por cerrada sin su visto bueno.
2. **Datos internos (costo, gramos, tiempo): AUTOINVENTAR.** Salvo que Daniel los
   comente, invéntalos con valores razonables según el tamaño/complejidad que se ve
   en la foto, y calcula el margen. Si después da los reales, se actualizan. (Cambio
   pedido por Daniel: ya NO se preguntan.)
3. **Precio:** propón un precio coherente. Daniel puede ajustarlo; si no dice nada,
   el propuesto queda válido.
4. **Descripción honesta.** Propones tú la `desc`, pero **sin inventar características
   que no se puedan ver** (no "resistente al agua" si no consta).
5. **Tag/etiqueta: NUNCA usar.** `tag` siempre `null`. (Las ofertas se manejan aparte.)
6. **Destacado (`featured`): NO se decide aquí.** Siempre `false` en la captura.
7. **Colores por defecto SIEMPRE:** `Blanco`, `Negro`, `Gris` + **el color que se
   vea en la foto del objeto** (ej. "Arena"). No preguntes colores salvo que Daniel
   quiera agregar/quitar alguno.
8. **Dimensiones (`dimensiones`), NO "tamaños":** tamaño físico **alto × ancho ×
   largo** (cm). `null` si no se sabe.
9. **Decisión y estado.** Cada borrador nace con `decision: pendiente` y
   `estado_local: borrador`. La decisión (pendiente / listo / rechazado) la marca
   Daniel en el editor; el `estado_local` lo maneja `publicar-producto`.
10. **Papelera segura:** nunca borres fotos ni borradores de Daniel sin invocar la
    skill `papelera-segura`.
11. **Autonomía:** todo vive dentro de `Web_Luna3D_v3/`. No referencies el Excel
    maestro ni otros proyectos.

## Flujo de trabajo

### 1. Ubica el proyecto
`Web_Luna3D_v3/`. Si no está montado, pídele a Daniel que lo monte.

### 2. Por cada foto, PROPÓN la ficha completa
Mira la imagen y arma una propuesta. Presenta una tarjeta clara y pídele que confirme
sobre todo la **categoría/subcategoría**. Propón:

- **name** — nombre comercial corto y atractivo.
- **cat** — categoría sugerida (texto libre). Sugiere la que más calce; **Daniel
  confirma o la cambia/crea**.
- **subcat** — subcategoría sugerida (texto libre) o `null`.
- **desc** — 2–3 frases, tono Luna 3D (premium, impreso a pedido en Chile, acabado
  cuidado), sin inventar specs.
- **colors** — `Blanco`, `Negro`, `Gris` + el color del objeto en la foto.
- **dimensiones** — alto × ancho × largo (cm), o `null`.
- **price** — precio propuesto coherente.
- **costo / gramos / tiempo_min** — **autoinventados** (regla dura 2), no se preguntan.

### 3. Guarda el borrador
Cuando Daniel confirme la categoría, ejecuta el script (una vez por producto):

```bash
python3 scripts/guardar_borrador.py \
  --json '{"name":"...","cat":"Cultura pop","subcat":"Pokémon","price":12990,"costo":3400,"gramos":95,"tiempo_min":360,"dimensiones":"8 × 6 × 4 cm","colors":["Blanco","Negro","Gris"],"tag":null,"featured":false,"desc":"..."}' \
  --imagen /ruta/a/la/foto.jpg
# opcional: --galeria /r/g1.jpg /r/g2.jpg   ·   --proyecto /ruta/a/Web_Luna3D_v3
```

El script: convierte `cat` en `slug` + guarda `cat_nombre`, genera el `id`
(`<cat>-<nombre>`), **optimiza la foto** (EXIF, sin metadatos, 1400px, JPEG 85),
calcula el margen, y guarda en
`_Borradores_Productos/<cat>/[<subcat>/]<id>/ficha.json` + `<id>.jpg`. Marca
`estado_local: borrador` y `decision: pendiente`. Re-guardar el mismo `id` lo actualiza.

### 4. Cierra
Confirma a Daniel qué quedó guardado. Las categorías/subcategorías nuevas quedan
disponibles automáticamente para el editor y la web. Cuando tenga varios decididos,
la skill **`publicar-producto`** sube y publica solo los marcados **listo**.

## Flujo recomendado: carpeta `_Futuros_Productos` + editor visual

1. **Daniel deja las fotos crudas** en `Web_Luna3D_v3/_Futuros_Productos/` y dice
   "subí fotos" / "revisa las fotos".
2. **Claude mira cada foto** y, por cada una, corre `guardar_borrador.py` con la ficha
   completa (sugiriendo categoría/subcat, autoinventando internos). Tras procesar,
   ofrece mover las fotos crudas a `_Papelera` vía `papelera-segura`.
3. **Daniel edita y decide en el navegador, gratis:** levanta el editor con
   `python3 _editor/servidor.py` y abre `http://localhost:8090`. Ahí ajusta nombre,
   descripción, precio, colores, dimensiones, **categoría/subcategoría (puede elegir
   una existente o escribir una nueva)** e internos, y marca el **estado**:
   **Pendiente / Listo para lanzar / Rechazado**. Rechazar mueve el borrador a
   `_Papelera`. **El editor NO sube nada a internet.**
4. **Cuando Daniel diga "súbelos / publícalos"** → skill `publicar-producto`
   (sube y publica solo los marcados **Listo para lanzar**).

> El editor (`_editor/servidor.py` + `_editor/index.html`) reusa `styles.css` para
> verse idéntico a la web. Solo librería estándar de Python; sin instalar nada.

## Campos de la ficha (referencia)

| Campo | Origen | Notas |
|---|---|---|
| `cat`, `cat_nombre`, `subcat` | **Daniel confirma** (Claude sugiere) | libres/dinámicos; `cat` = slug, `cat_nombre` = etiqueta, `subcat` = texto libre o `null` |
| `name`, `desc` | propuesta de Claude + visto bueno | web |
| `tag`, `featured` | fijos | `tag`=`null` siempre; `featured`=`false` siempre |
| `colors` | automático | Blanco/Negro/Gris + color del objeto |
| `dimensiones` | Daniel u opcional | alto × ancho × largo (cm) |
| `price` | propuesto por Claude / ajusta Daniel | CLP; `null` = "Precio a confirmar" |
| `costo`, `gramos`, `tiempo_min` | **autoinventados** salvo que Daniel los dé | internos; `margen` se calcula |
| `decision` | Daniel (en editor) | `pendiente` (default) / `listo` / `rechazado` |
| `estado_local` | automático (pipeline) | `borrador` / `subido` / `publicado` |
| `id` (slug), `margen`, `fuente='original'`, `riesgo_ip='verde'` | automático | — |
| `imagen_local`, `galeria_local` | automático | nombres de archivo guardados |
