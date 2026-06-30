# Diseño — SKU de productos + Pedidos & Seguimiento (Web Luna 3D v3)

**Fecha:** 2026-06-24 · **Sesión 7** · Autor: Claude (para Daniel Pardo)
**Estado:** Implementado y en vivo en https://luna3d.cl

---

## 1. Resumen y decisiones

Se implementaron dos sistemas que pidió Daniel, priorizando buenas prácticas de e-commerce y escalabilidad:

1. **Identificador único de producto (SKU)** — código operativo legible e inmutable.
2. **Seguimiento de pedidos por código** — el cliente ingresa un código y ve el estado de su pedido.

Decisiones tomadas (vía preguntas a Daniel):
- **SKU:** se conserva el `slug` como identificador de URL y se agrega un **SKU** `LN-CAT-NNNN`.
- **Flujo de pedido:** **híbrido** — la web crea el pedido pero queda **oculto** hasta que Daniel lo confirma.
- **Alcance:** implementación completa (base de datos + web + despliegue), no solo diseño.

---

## 2. Identificador de producto (SKU)

### Por qué tres identificadores y no uno
En e-commerce profesional conviven identificadores con propósitos distintos:

| Identificador | Para qué sirve | Cambia? | Ejemplo |
|---|---|---|---|
| **slug / Product ID** | URL y relaciones internas | Puede cambiar (al renombrar) | `maceteros-1` |
| **SKU** | Inventario, etiquetas, pedidos, contabilidad, Excel | **Nunca** (inmutable) | `LN-MAC-0042` |
| **SKU de variante** (futuro) | Color/talla específicos | Nunca | `LN-MAC-0042-AZ-L` |

Usar el slug como SKU sería un error: el slug es para SEO/URL y puede cambiar; el SKU debe ser estable para que el inventario y los pedidos históricos no se rompan.

### Formato elegido: `LN-CAT-NNNN`
- `LN` = marca Luna 3D.
- `CAT` = código de 3 letras de la categoría: MAC (maceteros), DEC (decoración), LLA (llaveros), CUL (cultura-pop), OFI (oficina). Categorías nuevas obtienen un código automático (3 primeras letras).
- `NNNN` = correlativo por categoría (0001, 0002, …).

### Cómo se genera
- Una función de base de datos (`next_sku`) y un **trigger** asignan el SKU automáticamente al crear un producto. **No hay que escribirlo a mano.**
- Es **inmutable**: si un producto ya tiene SKU, ninguna edición lo cambia (lo garantiza el trigger).
- Los 23 productos actuales recibieron su SKU (backfill): `LN-CUL-0001…0006`, `LN-DEC-0001…0005`, `LN-LLA-0001…0004`, `LN-MAC-0001…0004`, `LN-OFI-0001…0004`.
- El SKU se expone en la vista pública del catálogo, así viaja en cada pedido (snapshot) y conecta web ↔ Excel Maestro ↔ pedidos con un solo código.

---

## 3. Modelo de datos: cómo se relacionan productos, pedidos y seguimiento

```
 products ──(snapshot SKU/nombre/precio en cada ítem)──► orders ──1:N──► order_events
   │  id (slug, PK)                                        │  id (interno)     │ estado
   │  sku  (LN-CAT-NNNN)                                   │  codigo (público) │ fecha
   │  name, price, ...                                     │  estado           └─ línea de tiempo
   └─ products_public (vista: + sku)                       │  confirmado
                                                           │  items (jsonb: snapshot)
                                                           │  total, canal, nombre, comuna, user_id?
```

### Decisión clave: el pedido guarda un *snapshot*, no una llave dura al producto
Cada línea del pedido (`items`) guarda una **copia** de `{id, sku, nombre, qty, precio}` al momento de comprar. Esto es práctica estándar y deliberada:
- El pedido histórico **no se altera** si después editas, renombras o eliminas el producto.
- El **SKU** queda como llave de unión para análisis (qué SKU se vendió), sin bloquear cambios en el catálogo.

### Tablas
- **`orders`** (cabecera): `codigo` (público, no secuencial), `estado`, `confirmado`, `items` (snapshot), `total`, `canal`, `nombre`, `comuna`, `user_id` (opcional — null para invitados).
- **`order_events`** (historial): una fila por cada cambio de estado, con fecha. Es la **línea de tiempo** del seguimiento y la base para notificaciones futuras. Se llena **sola** mediante un trigger cada vez que cambia el estado del pedido.

---

## 4. Máquina de estados

```
 pendiente ──► recibido ──► en_revision ──► en_produccion ──► listo_despacho ──► enviado ──► entregado
 (interno/oculto)                                                                          
        └────────────────────────────► cancelado (en cualquier momento)
```

- `pendiente` es **interno**: el pedido existe pero el seguimiento público no lo muestra (responde "En validación").
- Los 6 estados visibles coinciden con los que pediste: **Pedido recibido → En revisión → En producción → Listo para despacho → Enviado → Entregado**.
- Validado por restricción `CHECK` en la base (no se puede escribir un estado inválido).

---

## 5. Flujo híbrido (cómo nace y se confirma un pedido)

1. El cliente arma el carrito y pulsa **"Pedir por WhatsApp"**.
2. La web crea el pedido en estado `pendiente` (**oculto**) y genera el **código** (ej. `LN-7K3QX9`).
3. El código se **inyecta en el mensaje de WhatsApp** (queda en su chat) y se le muestra en la web.
4. **Daniel revisa y confirma** el pedido (lo pasa a *Pedido recibido*). Recién ahí el cliente lo ve avanzar en el seguimiento.
5. Daniel va avanzando los estados a medida que produce/despacha. Cada cambio queda con su fecha en la línea de tiempo.

> Tolerancia a fallos: si la creación del pedido fallara, **igual se abre WhatsApp** (la venta nunca se bloquea); simplemente ese pedido no tendría código hasta crearlo manualmente.

---

## 6. Seguridad (qué ve el público y qué no)

- La web usa la **llave publishable** (pública) y **nunca** toca las tablas directamente: llama a funciones `SECURITY DEFINER` (mismo patrón seguro del newsletter).
  - `create_order(...)` → crea el pedido oculto y devuelve el código.
  - `track_order(codigo)` → devuelve **solo** estado + línea de tiempo + ítems + total. **No** expone nombre, dirección ni teléfono, ni permite listar pedidos ajenos.
- La tabla `orders` está protegida con RLS: con la llave pública **no se puede leer** (se verificó: devuelve vacío).
- El código es **corto y no secuencial** (`LN-XXXXXX`, sin caracteres ambiguos): no se puede adivinar el pedido de otra persona ni deducir el volumen de ventas.
- La función de administración (`admin_advance_order`) **solo** es ejecutable con la llave secreta (servidor) — la llave pública recibe "permiso denegado" (verificado).

---

## 7. Cómo operas tú los pedidos (guía rápida)

Tienes dos formas de **confirmar y avanzar** un pedido:

### A) Desde Supabase (Table Editor) — un clic
1. Entra a Supabase → **Table Editor** → tabla `orders`.
2. Busca el pedido (los nuevos llegan como `estado = pendiente`).
3. Cambia `estado` al siguiente valor: `recibido` → `en_revision` → `en_produccion` → `listo_despacho` → `enviado` → `entregado`.
   - Apenas lo sacas de `pendiente`, el cliente ya lo ve en el seguimiento (con la fecha del cambio).
   - Cada cambio se registra solo en la línea de tiempo.
4. Para cancelar: pon `estado = cancelado`.

### B) Pidiéndomelo a mí (Claude)
- "Confirma el pedido LN-7K3QX9" → lo paso a *recibido*.
- "Pasa LN-7K3QX9 a en producción" / "márcalo como enviado", etc.
- "¿Qué pedidos tengo pendientes?" → te los listo.

Los clientes consultan su pedido en **https://luna3d.cl/seguimiento** (enlace ya en el pie de página).

---

## 8. Futuras ampliaciones (la estructura ya las soporta)

1. **Variantes con SKU propio** (`LN-MAC-0042-AZ-L`): cuando definas colores/tallas vendibles por separado.
2. **`order_items` normalizado**: si más adelante quieres reportería avanzada (ventas por SKU), se deriva del snapshot sin romper nada.
3. **Notificaciones automáticas**: como `order_events` ya registra cada cambio con fecha, se puede disparar un WhatsApp/email al cliente en cada avance.
4. **Panel de administración propio** (en vez del Table Editor): una página protegida para gestionar pedidos.
5. **Integración con pago (MercadoPago)**: el pedido ya existe con código; al integrar el pago, el estado puede avanzar automáticamente al aprobarse.

---

## 9. Archivos de esta sesión

- `supabase/07_pedidos_seguimiento.sql` — migración (SKU + pedidos + seguimiento + RPCs). Idempotente.
- `catalogData.js` — wrappers `LUNA_DATA.createOrder` / `trackOrder` + `sku` en el catálogo.
- `seguimiento.html` + `seguimiento.js` — página pública de seguimiento (stepper).
- `app.js` — checkout híbrido + enlace del pie.
- `account.js` — historial con código + estado.
- `styles.css` — estilos del stepper.

**Verificación:** `node --check` 11/11 · smoke jsdom 27/27 · e2e real contra Supabase (alta pública, ocultamiento, confirmación, avance, limpieza) · verificación en vivo en producción.
