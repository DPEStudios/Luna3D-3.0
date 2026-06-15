# Prompt de traspaso — Web Luna 3D v3 · Editor de borradores + carga de catálogo

> Pega este archivo al inicio de un chat nuevo para retomar sin perder contexto.
> Para: Daniel Pardo (Estrella 3D SpA) · Fecha base: 2026-06-14
> Reemplaza al anterior `PROMPT_Sesion_Catalogo_Productos.md` (ese sigue válido como base de infraestructura).

---

## 0. Lo primero (Claude, al abrir este chat)
1. Lee tu memoria según `CLAUDE.md`:
   - `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/INDEX.md`
   - `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/people/daniel-pardo.md`
   - `/mnt/AI/00_Sistema_Respaldo/Memoria_Proyectos/projects/estrella3d.md`
2. Lee el `README.md` del proyecto y el prompt base `PROMPT_Sesion_Catalogo_Productos.md`.
3. **Trato:** tono formal, español de Chile, profesional. Llámame **Daniel**. Somos
   compañeros de trabajo pero yo estoy a cargo. Conciso y directo. Cuidar tokens.

---

## 1. Objetivo de la próxima sesión
**Ver los productos en la página web.** Ya hay 2 borradores listos/casi listos en
`_Borradores_Productos/`. El siguiente paso es **subirlos y publicarlos** con la skill
`publicar-producto` (subir foto al bucket + UPSERT fila como borrador → `publicar` con
mi OK → aparecen en la web al instante). Antes de publicar la Poké Ball, decidir el tema
de IP (ver §4).

---

## 2. Qué se construyó en la sesión anterior (2026-06-14)

### 2.1 Reglas nuevas (grabadas en la skill `producto-borrador`)
- **La categoría/subcategoría la decide Daniel**, no Claude. Claude propone; Daniel
  ajusta en el editor. (En la práctica: Claude crea el borrador con su mejor propuesta
  y Daniel corrige en el editor visual.)
- **`maceteros` ya NO es categoría.** Pasó a ser **subcategoría de `decoracion`**.
  Lista cerrada de categorías quedó en **4**: `decoracion`, `llaveros`, `cultura-pop`, `oficina`.
- **`subcat`** = subcategoría (texto libre) — nuevo campo de la ficha.
- **`tag` SIEMPRE `null`** (no se usan etiquetas "Nuevo"/"Oferta").
- **`featured` SIEMPRE `false` en la captura** (destacar se decide en sesiones de web/ofertas).
- **`colors` por defecto SIEMPRE:** `Blanco`, `Negro`, `Gris` + el color del objeto en la foto.
- **`dimensiones`** (alto × ancho × largo, en cm) **reemplaza** al viejo campo `sizes`.

### 2.2 Estructura de carpetas de borradores (NUEVA)
Ahora es de 3 niveles: `_Borradores_Productos/<categoria>/<subcategoria>/<id-producto>/`
con: `ficha.json` + `<id>.jpg` (optimizada) + `original_<archivo>` (la cruda archivada).

### 2.3 Flujo acordado (bajo consumo de tokens)
1. Daniel deja la(s) foto(s) cruda(s) en `_Futuros_Productos/` y dice "subí fotos".
2. Claude **mira cada foto** (único paso que gasta tokens), crea la carpeta en la
   subcategoría correcta, genera la ficha completa + foto optimizada, y **mueve la
   imagen cruda fuera del inbox** (queda como `original_…` en la carpeta del producto).
3. Daniel abre el **editor visual** (ver §3), edita todo (precio, colores, dimensiones,
   internos con margen en vivo, categoría/subcat) y pulsa **Guardar** → aviso verde
   "✓ Cambios guardados con éxito". Esto reescribe `ficha.json`. **No sube nada.**
4. Cuando Daniel diga "listo / súbela" → skill `publicar-producto`. Las fichas con
   `descartar: true` no se suben.

### 2.4 Editor visual (carpeta `_editor/`) — construido UNA vez, reutilizable
- `_editor/servidor.py` — mini-servidor con **solo librería estándar de Python**.
  Sirve los estáticos del proyecto (reusa `styles.css` → se ve como la web) y expone:
  - `GET /api/borradores` → lista todas las fichas (recorre `_Borradores_Productos`).
  - `POST /api/guardar` → reescribe el `ficha.json` indicado y **recalcula margen**.
    Valida que la ruta esté dentro de `_Borradores_Productos` (seguridad).
  - Puerto **8090** → `http://localhost:8090`.
- `_editor/index.html` — UI tema Luna 3D (navy + aurora), tarjetas editables con
  estados loading/empty/error, chips de color (sumar/quitar), datos internos
  colapsables con margen en vivo, y **aviso verde de guardado** (toast).
- `_editor/Abrir_Editor_Luna3D.bat` — lanzador para Windows: detecta Python
  (`python`/`py`/`python3`), abre el navegador, levanta el servidor y **graba un log**
  en `_editor/ultimo_arranque.log`. **Verificado funcionando en el PC de Daniel.**
- Cómo lo abre Daniel: doble clic al `.bat` (deja la ventana negra abierta) → navegador
  en `http://localhost:8090`. Para tenerlo a mano: acceso directo en escritorio /
  anclar a barra de tareas / favorito en Chrome (el favorito solo carga con el `.bat`
  corriendo). **Python ya está instalado en su PC.**

### 2.5 Inbox + gitignore
- `_Futuros_Productos/` (con `LEEME.txt`) = bandeja de fotos crudas. Agregado a `.gitignore`.

### 2.6 Bugs corregidos en `scripts/guardar_borrador.py`
- Estaba **truncado**: le faltaba la última línea y la llamada final `if __name__ ==
  "__main__": main()` (por eso "corría" sin hacer nada). **Corregido.**
- Se agregó la construcción de carpeta con subcategoría.

---

## 3. Cómo levantar el editor (resumen rápido)
- **Recomendado:** doble clic en `Web_Luna3D_v3\_editor\Abrir_Editor_Luna3D.bat`.
- Manual (terminal en la raíz del proyecto): `python _editor\servidor.py` → abrir
  `http://localhost:8090`.
- En sesión (sandbox Linux) para pruebas: `cd <proyecto> && EDITOR_PORT=8090 python3 _editor/servidor.py`.

---

## 4. Estado actual de los borradores (al 2026-06-14)

Hay **2 borradores** (ninguno publicado todavía; la web sigue mostrando solo lo que
esté `publicado` en Supabase):

1. **Macetero Espiral Dune** — `decoracion / maceteros /
   decoracion-macetero-espiral-dune/`
   - cat `decoracion`, subcat `Maceteros`, colores Blanco/Negro/Gris/Arena, foto OK.
   - **Pendiente:** `price`, `costo`, `gramos`, `tiempo_min`, `dimensiones` (todos null).
   - `riesgo_ip: verde`, `fuente: original`.

2. **Organizador Poké Ball para juegos Switch** — `cultura-pop / gaming /
   cultura-pop-organizador-poke-ball-para-juegos-switch/`
   - cat `cultura-pop`, subcat `Pokemon` (Daniel lo editó), colores
     Blanco/Negro/Gris/Rojo/Azul, foto OK.
   - `price: 7990`, `dimensiones: "10*10*10"` (editado por Daniel; ojo formato con `*`).
   - **Pendiente:** `costo`, `gramos`, `tiempo_min`.
   - ⚠️ **`riesgo_ip: rojo`** — usa IP de Pokémon/Nintendo. **Decidir si va a la web
     pública o solo a venta directa antes de publicar.**
   - Nota menor: la carpeta quedó bajo `gaming/` pero la subcat ahora dice `Pokemon`
     (el editor no mueve carpetas al cambiar subcat). Cosmético; no bloquea publicar.

---

## 5. Reglas duras (no romper)
- **No inventar datos** (precios, specs). Lo que falte se pregunta o queda pendiente.
  (Excepción puntual ya usada: un ejemplo de prueba con datos inventados, ya descartado.)
- **Trampa de montaje (IMPORTANTE):** para leer `ficha.json` u otros archivos del
  proyecto usa las **file-tools (Read)**, NO bash — bash a veces lee una **vista vieja/
  truncada** del montaje y parece corrupción que NO existe. Para archivos que luego se
  zipean/commitean, **escríbelos con bash**. git NO opera dentro de `/mnt`.
- **Secret de Supabase**: solo en `.claude-secrets/supabase.env` y entorno del hosting.
  Nunca al chat/repo/cliente. Va solo en header `apikey`.
- **Papelera segura:** cualquier borrado/movimiento de archivos del usuario invoca la
  skill `papelera-segura` (mover a `_Papelera/<timestamp>/`, nunca `rm`). En `/mnt` `rm`
  está bloqueado.
- **Autonomía:** todo vive en `Web_Luna3D_v3/`. No referenciar el Excel maestro ni otros
  proyectos.

---

## 6. Datos y rutas clave
- **Proyecto:** `/mnt/AI/01_Estrella3D/Web_Luna3D_v3/` (Windows: `C:\Users\danie\AI\01_Estrella3D\Web_Luna3D_v3\`)
- **Supabase ref:** `dlvechohqlwysryxguqm` · URL `https://dlvechohqlwysryxguqm.supabase.co` (São Paulo)
- **Bucket público de fotos:** `productos`
- **Llaves (secreto):** `.claude-secrets/supabase.env` (`SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`). Legadas anon/service_role
  desactivadas. Web usa publishable; agente usa secret (header `apikey`, nunca Bearer).
- **Estado de la tabla `products`:** 20 filas, todas `borrador` (placeholders migrados),
  0 publicadas. La vista pública es `products_public` (solo `publicado`).
- **Borradores locales:** `_Borradores_Productos/<cat>/<subcat>/<id>/` (gitignored).
- **Inbox de fotos:** `_Futuros_Productos/` (gitignored).
- **Editor:** `_editor/{servidor.py,index.html,Abrir_Editor_Luna3D.bat}` · puerto 8090.
- **Skills (fuente):** `_fabrica_skills/{producto-borrador,publicar-producto}/`
- **WhatsApp comercial:** `56983357145`
- **Servir la web local:** `python -m http.server 8080` → `http://localhost:8080/index.html`

### Recetas (sandbox)
```bash
# Leer llaves
ENVF=<proyecto>/.claude-secrets/supabase.env; set -a; source "$ENVF"; set +a
# Estado de la tabla (agente, secret):
curl -s "$SUPABASE_URL/rest/v1/products?select=id,estado" -H "apikey: $SUPABASE_SECRET_KEY"
# Guardar un borrador desde foto:
python3 _fabrica_skills/producto-borrador/scripts/guardar_borrador.py \
  --json '{"name":"...","cat":"decoracion","subcat":"Maceteros","colors":["Blanco","Negro","Gris","Arena"],"desc":"..."}' \
  --imagen /ruta/foto.jpg --proyecto <proyecto>
# Subir / publicar:
python3 _fabrica_skills/publicar-producto/scripts/subir_producto.py listar
python3 _fabrica_skills/publicar-producto/scripts/subir_producto.py subir --todos
python3 _fabrica_skills/publicar-producto/scripts/subir_producto.py publicar --todos-subidos
```

---

## 7. Pendientes (no perder de vista)
- [ ] **Publicar los 2 borradores** para verlos en la web (objetivo de la próxima sesión).
      Decidir antes la IP de la Poké Ball (pública vs venta directa).
- [ ] Completar economía pendiente (costo/gramos/tiempo en ambos; precio/dimensiones del macetero).
- [ ] **Render de subcategoría en la web (2 niveles):** hoy la web es plana; `subcat` se
      guarda pero no se muestra. Falta columna `subcat` en la DB + filtro en el catálogo.
- [ ] **Migrar los 4 placeholders viejos `maceteros`** de la DB a `decoracion`/subcat Maceteros, y limpiar.
- [ ] **Reinstalar la skill instalada** desde `_fabrica_skills/producto-borrador/` (los
      cambios están en la fuente; la versión instalada puede estar desfasada).
- [ ] Normalizar el formato de `dimensiones` (la Poké Ball quedó "10*10*10"; estándar = "alto × ancho × largo cm").
- [ ] (Heredados) Testimonios/FAQ reales, páginas legales, MercadoPago (sesión 6),
      publicación en luna3d.cl (sesión 8).
