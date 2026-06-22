# Arquitectura — Fábrica de Catálogo semi-autónoma · Web Luna 3D v3

> Documento de diseño (no de ejecución). Define cómo Claude descubre, analiza, diseña,
> previsualiza y **publica** productos en luna3d.cl con un solo "OK" de Daniel.
> Autor: Arquitecto de Sistemas Principal (Claude) · Para: Daniel Pardo (Estrella 3D SpA)
> Fecha: 2026-06-13 · Proyecto: `C:\Users\danie\AI\01_Estrella3D\Web_Luna3D_v3`

---

## 0. Decisiones ya tomadas con Daniel (2026-06-13)

1. **Arquitectura de catálogo:** Supabase (base de datos `products` + Storage para imágenes).
   El alta de un producto pasa de "editar código + redeploy" a **un INSERT por API**.
2. **Riesgo de propiedad intelectual:** **solo diseños sin dueño.** El descubrimiento
   descarta personajes y marcas protegidas *antes* de mostrárselos a Daniel. Para diseños
   curados, además se exige **licencia que permita uso comercial**.

---

## 1. Visión y alcance

Convertir el crecimiento del catálogo en un flujo casi autónomo:

- Claude **busca** diseños 3D exitosos/tendencia con buena economía de impresión
  (relación tamaño/precio, rápidos y baratos de imprimir, buen margen).
- Claude **diseña** productos originales propios cuando detecta una tendencia (concepto +
  imágenes; ver límite de modelo 3D en §8).
- Para cada candidato, Claude **hace los números** (costo, precio, margen) con el Excel Maestro.
- Claude **prepara la ficha** (imagen + datos + precio) y se la muestra a Daniel **tal como
  se vería en la web**.
- Daniel solo dice **OK** → el producto entra en vivo, sin que toque nada técnico.

**Lo que el sistema automatiza al 100%:** descubrimiento, análisis económico, generación de
imágenes, armado de la ficha y publicación.
**Lo que queda como paso humano/asistido:** el archivo imprimible (.STL/.3MF) — ver §8.

### Regla suprema (no inventar)
Está prohibido inventar nombres, precios, reseñas, plazos o datos. Solo se carga lo que
Daniel apruebe o lo derivable de una fuente verificable (Excel, fuente del diseño). Lo que
falte queda como placeholder honesto o se omite.

---

## 2. Arquitectura general (el pipeline)

```
┌─────────────────────────────────────────────────────────────────────┐
│  AGENTE (Claude, tarea agendada)                                      │
│                                                                       │
│  [1] Descubrimiento ──► [2] Análisis económico ──► [3] Assets        │
│       (tendencias)          (Excel Maestro)          (imagen IA /     │
│       filtra IP+licencia     costo/precio/margen      brief 3D)       │
│                                   │                                    │
│                                   ▼                                    │
│                          [4] Alta como BORRADOR                        │
│                          (INSERT en Supabase + imagen al bucket)      │
└───────────────────────────────────┬───────────────────────────────────┘
                                     │  (Claude muestra la ficha en el chat)
                                     ▼
                         ┌───────────────────────┐
                         │  DANIEL revisa y       │
                         │  dice "OK" / "no"      │
                         └───────────┬───────────┘
                                     │  OK → Claude hace UPDATE estado='publicado'
                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE                                                             │
│   · tabla products  (la web lee SOLO estado='publicado')             │
│   · Storage bucket 'productos' (imágenes públicas vía CDN)           │
└───────────────────────────────────┬───────────────────────────────────┘
                                     ▼
                         luna3d.cl muestra el producto al instante
                                     (sin redeploy)
```

Principio clave: **el "OK" de Daniel es el interruptor de publicación.** Mientras un producto
está en `borrador` es invisible en la web; al pasar a `publicado` aparece de inmediato.
Reversible en cualquier momento (volver a `borrador` lo baja).

---

## 3. Capa de datos — tabla `products` (Supabase / PostgreSQL)

El esquema **extiende** la forma actual del producto en `data.js`
(`id, cat, catName, name, price, img, tag, featured, rating, reviews, colors, sizes, desc`)
con los campos que el flujo automático necesita.

| Columna            | Tipo            | Notas |
|--------------------|-----------------|-------|
| `id`               | text (PK)       | slug estable, ej. `macetero-espiral-hexagonal` |
| `cat`              | text            | id de categoría (FK lógica a las 5 categorías reales) |
| `name`             | text            | nombre real |
| `price`            | integer, null   | CLP entero, sin puntos; null = "Precio a confirmar" |
| `img`              | text, null      | URL pública de la foto principal en el bucket |
| `gallery`          | jsonb, null     | URLs de fotos de detalle (`-2`, `-3`, …) |
| `tag`              | text, null      | `'Nuevo' | 'Oferta' | null` |
| `featured`         | boolean         | flag de curación para la Home |
| `rating`           | numeric, null   | null hasta tener reseñas reales |
| `reviews`          | integer         | default 0 |
| `colors`           | jsonb, null     | null → paleta de marca por defecto |
| `sizes`            | jsonb, null     | null → `['Único']` |
| `desc`             | text, null      | null → descripción por defecto |
| **`estado`**       | text            | `'borrador' | 'publicado' | 'archivado'` (default `'borrador'`) |
| **`fuente`**       | text            | `'curado' | 'original'` |
| **`riesgo_ip`**    | text            | `'verde'` (único permitido para publicar) `| 'rojo'` |
| **`licencia`**     | jsonb, null     | curados: `{ comercial:true, tipo:'CC-BY', origen:'<url>' }` |
| **`costo`**        | numeric, null   | costo interno (insumo del precio) — no se expone en la web |
| **`gramos`**       | numeric, null   | material estimado |
| **`tiempo_min`**   | numeric, null   | minutos de impresión estimados |
| **`margen`**       | numeric, null   | margen sobre costo (interno) |
| **`modelo_3d_url`**| text, null      | ubicación del .STL/.3MF cuando exista |
| `created_at`       | timestamptz     | default now() |
| `updated_at`       | timestamptz     | trigger updated_at |

### Seguridad (RLS — Row Level Security)
- **Anónimo (la web pública):** solo `SELECT` de filas con `estado = 'publicado'`.
  Nunca ve borradores, ni campos internos sensibles (se sirve una *vista* pública que
  excluye `costo`, `margen`, `licencia`, etc.).
- **Escritura (Claude/agente):** solo con la **service role key**, que vive en variable de
  entorno del lado servidor — **nunca** en el repo ni en el cliente.
- Regla dura: ningún producto puede pasar a `publicado` si `riesgo_ip != 'verde'` o, para
  curados, si `licencia.comercial != true`. Se valida en la capa de servicio.

---

## 4. Capa de imágenes — Storage bucket `productos`

- Bucket **`productos`**, lectura pública (servido por CDN de Supabase).
- Convención de rutas: `productos/<id>/<id>-1.jpg` (principal), `<id>-2.jpg`, `<id>-3.jpg` (galería).
- Formato objetivo (igual que la pauta de la sesión 3): **1:1, ~1600 px, JPG/WebP, < 400 KB, sRGB**,
  sin marcos ni texto. Claude optimiza antes de subir (Pillow/ImageMagick).
- Las imágenes generadas por IA y las optimizadas de curados se suben por API al bucket;
  el repo del sitio **deja de almacenar binarios de producto** (más liviano, sin redeploy por foto).

---

## 5. Conexión de la web a Supabase (lectura)

Hoy `data.js` define el catálogo en memoria. La migración mínima y de bajo riesgo:

1. Crear un módulo de datos (`catalogData.js`) que, al cargar la página, consulta la **vista
   pública** de Supabase (REST/`supabase-js` con la **anon key**, de solo lectura) y obtiene
   los productos `publicado`.
2. Mapear el resultado a **la misma forma de objeto** que ya consumen `home.js`, `catalog.js`
   y `product.js`. Así esas páginas **no cambian** (UI tonta, lógica ciega: SoC).
3. **Resiliencia visual obligatoria:** estados de *Loading / Error / Empty*. Si Supabase no
   responde, la web muestra un estado vacío honesto, nunca se rompe.
4. La venta por WhatsApp y el carrito **quedan intactos** (operan sobre el catálogo en memoria,
   venga de donde venga).
5. Wrapper agnóstico: el acceso a datos vive detrás de una sola interfaz
   (`window.LUNA_DATA.getCatalog()`), igual que `LUNA_PAY` para pagos. Si mañana se cambia de
   Supabase a otra DB, se toca un solo archivo.

`data.js` queda como **fallback/semilla** y como fuente de las constantes de presentación
(`CLP`, `DEFAULT_COLORS`, `PROD_DESC`, categorías).

---

## 6. El pipeline del agente, etapa por etapa

### [1] Descubrimiento (tarea agendada, ej. semanal)
- Claude rastrea tendencias y modelos con buen desempeño (marketplaces de modelos 3D, redes,
  búsquedas de tendencia).
- **Filtro IP/licencia (duro):** descarta de inmediato todo personaje o marca con dueño
  (Harry Potter, Labubu, Furby, Pokémon, Disney, clubes, etc.) y todo modelo cuya licencia
  no permita venta comercial. Solo avanzan diseños **genéricos/originales y comercializables**.
- Salida: lista de candidatos con fuente, descripción y por qué podría convenir.

### [2] Análisis económico (con el Excel Maestro)
- Para cada candidato, estima **gramos** y **tiempo de impresión**, y calcula **costo** con la
  hoja `🧮 Calculadora_Costo` de `Estrella3D_Maestro.xlsx`
  (`Finanzas/00_Control_Financiero/`) o la skill `estrella-3d-finanzas`.
- Propone **precio** = costo + margen objetivo + **redondeo comercial** (terminado en $90/$990).
- Calcula y guarda `margen`. Marca como buen candidato los de alta relación precio/tiempo
  (rápidos, poco material, buen margen).

### [3] Generación de assets
- **Imágenes:** Claude genera el/los render(s) con IA, los optimiza (§4) y los sube al bucket.
- **Modelo 3D:** según fuente (ver §8).

### [4] Alta como borrador
- `INSERT` en `products` con `estado='borrador'`, imagen ya en el bucket, todos los campos
  económicos llenos y `riesgo_ip='verde'`.

### [5] Presentación y publicación
- Claude muestra a Daniel **la ficha como se vería en la web** (tarjeta con estilos reales) +
  tabla económica (costo, precio, margen, tiempo) en el chat.
- Daniel responde "OK al 2 y al 5", "sube el precio del 3 a $X", "descarta el 1", etc.
- Con el OK, Claude hace `UPDATE estado='publicado'` (aplicando primero los ajustes pedidos).
  El producto aparece en luna3d.cl al instante.

---

## 7. Flujo de aprobación (cómo lo vive Daniel)

- Todo ocurre **en el chat de Cowork**: Claude renderiza la(s) ficha(s) y la tabla de números.
- Daniel aprueba, ajusta (precio, nombre, descripción) o descarta. Claude ejecuta.
- **Daniel siempre aprueba el precio final** antes de publicar (regla de la pauta de precios).
- Nada se publica sin OK explícito. Nada inventado entra al chat siquiera (filtro previo).

---

## 8. El punto honesto: el modelo 3D imprimible

Generar un .STL/.3MF imprimible de calidad desde cero **no es algo que Claude pueda hacer de
forma confiable** (la generación texto-a-3D existe pero da geometría pobre para impresión).
Por eso el sistema distingue dos fuentes:

- **Curados:** el modelo ya existe en repositorios (MakerWorld, Printables, etc.). Claude
  **solo lo propone si la licencia permite uso comercial**; guarda `modelo_3d_url` y la
  licencia. El riesgo aquí es de licencia, no técnico.
- **Originales (inventados por Claude):** Claude entrega concepto, renders y un **brief de
  diseño detallado**; el modelo imprimible final lo cierra Daniel (o se encarga a un servicio
  texto-a-3D y Daniel valida la impresión). No se promete el .3MF automático.

Conclusión: el catálogo puede crecer casi solo en *descubrimiento + números + imagen + ficha +
publicación*; el **modelo imprimible** es el eslabón humano/asistido.

---

## 9. Seguridad y reglas duras

- **Claves:** `anon key` (solo lectura, puede ir al cliente) vs **`service role key`**
  (escritura, solo servidor/agente, jamás en repo ni en el browser; vive en `.env`/variable
  de entorno; `.gitignore` ya excluye `.env*` y `.claude-secrets/`).
- **Publicación condicionada:** sin `riesgo_ip='verde'` (y licencia comercial en curados) no
  hay publicación. Se valida en código, no solo por convención.
- **No destructivo:** cualquier baja es `estado='archivado'`, no `DELETE`. Respaldos de datos
  antes de migraciones. Para archivos locales, regla `papelera-segura`.
- **Compatibilidad:** WhatsApp, carrito y MercadoPago no se tocan en la migración a DB.

---

## 10. Secuencia de construcción (por fases, sin romper lo vivo)

1. **Fase A — Cimientos Supabase.** Daniel crea el proyecto Supabase y entrega `URL` + `anon key`
   + `service role key`. Claude crea la tabla `products` (esquema §3), la vista pública, las
   políticas RLS y el bucket `productos`. Migra el catálogo actual de `data.js` → `products`.
2. **Fase B — Web lee de Supabase.** `catalogData.js` + wrapper `LUNA_DATA`, con Loading/Error/
   Empty. Verificar `node --check` + smoke test jsdom (3 páginas) = 0 fallos. WhatsApp intacto.
3. **Fase C — Pipeline del agente.** Implementar descubrimiento + filtro IP/licencia + análisis
   económico (Excel) + generación/optimización de imagen + alta como borrador.
4. **Fase D — Aprobación fina.** Pulir la presentación de fichas en el chat y los comandos de
   ajuste/publicación.
5. **Fase E — Agendar.** Tarea recurrente de descubrimiento (ej. semanal) que deja borradores
   listos para que Daniel revise cuando quiera.

> **Prioridad:** esto es la visión de mediano plazo. **No reemplaza la Sesión 3** (subir los
> primeros productos reales con foto y precio), que es lo que más acerca a la primera venta.
> Lo ideal: cargar los primeros a mano (Sesión 3) y montar esta fábrica en paralelo.

---

## 11. Pendiente de Daniel (insumos para arrancar la Fase A)

1. Crear cuenta y proyecto en Supabase (https://supabase.com → New Project).
2. Settings → API: entregar `Project URL`, `anon public key` y `service_role key`
   (esta última es secreta; se guarda en variable de entorno, no en el repo).
3. Confirmar el hosting de luna3d.cl (probable Vercel/Next, por confirmar con acceso al panel)
   para definir dónde corre la escritura del agente con la service role key.

---

## 12. Definición de hecho (de la fábrica completa)

- Tabla `products` + vista pública + RLS + bucket `productos` operativos en Supabase.
- La web lee de Supabase (solo `publicado`), con estados Loading/Error/Empty, y WhatsApp +
  carrito intactos. `node --check` + smoke test jsdom = 0 fallos.
- Pipeline que deja **borradores** con imagen, números y `riesgo_ip='verde'`.
- Aprobación en el chat: Daniel ve la ficha + números, da OK, el producto se publica al instante.
- Ningún producto con dueño/licencia no comercial llega siquiera a la etapa de aprobación.
- Memoria (`estrella3d.md`) y README actualizados al cerrar cada fase.
