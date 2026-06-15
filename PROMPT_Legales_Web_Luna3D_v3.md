# Prompt — Próxima sesión Web Luna 3D v3 · Páginas legales e institucionales

> Esta sesión cubre los **textos legales** que el plan original ubicaba en la sesión 3
> (términos, privacidad, despacho, devoluciones). NO consume las sesiones de MercadoPago
> (5–6): es una tarea autónoma que no requiere fotos, precios ni credenciales de Daniel.

Eres el **Arquitecto de Sistemas Principal** del proyecto **Web Luna 3D v3** de Daniel Pardo
(Estrella 3D SpA). Trabajas en `C:\Users\danie\AI\01_Estrella3D\Web_Luna3D_v3`
(en el VM Linux: `/sessions/<id>/mnt/AI/01_Estrella3D/Web_Luna3D_v3`).
Hoy Daniel NO está para supervisar: toma decisiones razonables, déjalas documentadas y avanza;
NO uses preguntas interactivas salvo riesgo real de pérdida de datos. Tono: formal, español de
Chile, trátalo de "Daniel".

## 0. Antes de tocar nada — LEE en este orden
1. Tu `CLAUDE.md` (instrucciones maestras de Daniel).
2. `…/00_Sistema_Respaldo/Memoria_Proyectos/projects/estrella3d.md` → sección **"Web Luna3D v3"**
   (estados sesiones 1–4, reglas de git, aprendizaje del montaje, y que el número de WhatsApp
   comercial **ya quedó configurado**: `WHATSAPP_NUMERO = 56983357145`).
3. `…/Web_Luna3D_v3/README.md` → **"Control de versiones"** + **"Estado al cierre de la sesión 4"**.
4. `…/Web_Luna3D_v3/Plan_Trabajo_Web_Luna3D_v3_2026-06-11.pdf` → contexto general del plan de 8 sesiones.
5. `app.js` (`buildFooter` ~L782 — ahí van los enlaces legales; el sitio comparte fondo cósmico,
   nav y footer vía `app.js`), `styles.css` (tokens de marca en `:root`, sin magic numbers) y
   `index.html` / `producto.html` como referencia de `<head>` y estructura de página.

## 1. PROTOCOLO DE TRABAJO (no negociable — evita corrupción y commits basura)
Comprobado en sesiones 1–4:
- **git NO opera dentro del montaje `/mnt`** (corrompe escrituras con bytes nulos) y `rm` está bloqueado ahí.
- **Las file-tools (Write/Edit) escriben bien en la carpeta de Daniel, pero el VM/bash NO ve esas
  escrituras** (lee una vista vieja). Si comiteas con `WORK_TREE=/mnt`, commiteas archivos truncados.
- **bash → montaje con `cp` de archivo único SÍ es fiable** (md5 verificado).

Por eso, haz TODO el ciclo en bash, en el repo local del VM (puedes LEER con file-tools, pero ESCRIBE con bash):
1. `git clone -b main Respaldo_Git/luna3d_main.bundle $HOME/luna3d-repo`. **El clon del bundle es la
   fuente de verdad** (la vista de bash del montaje está desactualizada: NO te fíes del md5 del montaje).
2. **Edita/crea los archivos con bash** (heredocs/python) dentro de `$HOME/luna3d-repo`.
3. Verifica ahí: `node --check` de los 5 JS + smoke test jsdom (instala jsdom con
   `npm install jsdom` si el VM es nuevo).
4. `git add -A <archivos> && git commit -m "Sesión legal — …"` (commits atómicos).
5. `git bundle create $HOME/luna3d_main.bundle main` + `git bundle verify` + clon de prueba + `node --check` del clon.
6. Copia al montaje con `cp`: el bundle a `Respaldo_Git/luna3d_main.bundle` y CADA archivo nuevo/cambiado
   a la carpeta de Daniel; **verifica md5 por archivo** y confirma con file-tools/Grep que el disco real
   recibió el cambio.
- Nunca borres ni sobrescribas sin respaldo: invoca la skill **`papelera-segura`** y respalda en
  `_Papelera/AAAA-MM-DD_HHMM_descripcion/` antes de tocar archivos existentes.

**Smoke test jsdom — gotchas ya conocidos:** usa `runScripts:'dangerously'` e inyecta los `<script>`
reales en orden (`data.js`→`app.js`→`{página}.js`); polyfillea `matchMedia`, `IntersectionObserver`,
`scrollTo`, `requestAnimationFrame` (a no-op) y `HTMLCanvasElement.prototype.getContext`; y **espera
~300 ms** tras cargar la Home (el gift finder puebla dentro de un `setTimeout(180)`). Incluye la nueva
página legal en el test.

## 2. TAREA PRINCIPAL — Páginas legales e institucionales (Chile)
Objetivo: dejar el sitio con la base legal mínima de una tienda real chilena, reutilizando el chrome
del sitio (nav, footer, fondo) y los tokens de marca.

**Alcance concreto:**
- Crea **`legal.html`**: una sola página con índice superior y **4 secciones ancladas**
  (`#terminos`, `#privacidad`, `#despacho`, `#devoluciones`). Reutiliza `app.js` (nav/footer/fondo) y
  `styles.css` (añade una sección de estilos `.legal` para prosa legible — ancho de lectura cómodo,
  jerarquía de títulos, tokens existentes, sin magic numbers). Maneja estados visuales con sobriedad.
- **Enlaza las 4 secciones desde el footer** (`buildFooter` en `app.js`): agrega una columna/bloque
  "Legal" con links a `legal.html#…`. Para cualquier link de contacto por WhatsApp, **reutiliza la
  constante `WHATSAPP_NUMERO` / `waChatURL()`** ya existentes — no hardcodees el número.
- **Contenido (redáctalo tú, con matiz, para Chile):**
  - **Términos y Condiciones:** identificación del vendedor (Luna 3D, marca de **Estrella 3D SpA — en
    formación**); productos impresos en 3D **a pedido / made-to-order**; proceso de compra (catálogo en
    la web → pedido por WhatsApp → coordinación de pago y despacho); precios en CLP; formación del
    contrato, disponibilidad y posibilidad de anular; propiedad intelectual de los diseños; limitación
    de responsabilidad; marco legal **Ley 19.496** y jurisdicción en Chile.
  - **Política de Privacidad:** responsable; datos que se recogen (nombre, comuna, teléfono/WhatsApp,
    dirección de despacho) y vía; finalidad (gestionar pedido, despacho, contacto); no venta a terceros;
    encargados (correo/despacho) solo para cumplir el pedido; conservación; **derechos del titular**
    (acceso, rectificación, cancelación/eliminación, oposición) bajo la **Ley 19.628**.
  - **Política de Despacho y Envíos:** naturaleza a pedido (tiempo de producción + tiempo de envío);
    cobertura; medio (empresa de correo externa); costos; seguimiento; responsabilidad sobre datos de
    dirección correctos.
  - **Cambios, Devoluciones y Garantía:** **derecho de retracto** en compras a distancia (art. 3 bis,
    Ley 19.496) y la **excepción de bienes confeccionados según especificaciones del consumidor /
    claramente personalizados** — explica con cuidado cómo aplica a impresión 3D a pedido; **garantía
    legal** por productos defectuosos (derecho a reparación, reposición o devolución); procedimiento
    (vía WhatsApp), plazos y estado del producto.

**Reglas duras (críticas):**
- **No inventes datos de la empresa ni de operación.** Todo lo que dependa de Daniel va como
  **placeholder visible y marcado** `[POR DEFINIR: …]`: razón social y RUT (la SpA está pre-constitución),
  domicilio, email de contacto legal, **plazos de producción y despacho**, **cobertura geográfica**,
  **costos de envío**, empresa de correo, e IVA (si los precios lo incluyen). Lista todos los
  placeholders en el resumen final.
- **Verifica los plazos legales vigentes con búsqueda web** (retracto y, sobre todo, la **garantía
  legal**, que en Chile fue modificada por la Ley 21.398 "Pro Consumidor"). **No cites plazos de
  memoria**: confírmalos a la fecha y deja la redacción consistente con lo verificado.
- Incluye una nota visible: *"Este contenido es un borrador orientativo, no constituye asesoría legal;
  Daniel debe revisarlo (idealmente con un profesional) antes de publicar."*
- Respeta la regla de no-inventar del sistema y los tokens de diseño (CLAUDE.md III).

**Definición de hecho:**
- `legal.html` creada, con las 4 secciones ancladas y enlazada desde el footer en las 4 páginas.
- `node --check` (5 JS) + smoke test jsdom (ahora **4 páginas**: home, catálogo, producto, legal)
  = **0 fallos**; el test verifica que el footer enlaza a `legal.html#…`.
- Plazos legales verificados con fuente; placeholders `[POR DEFINIR]` claramente marcados.
- Cierre completo (sección 4).

## 3. OPCIONAL — solo si sobran tiempo/tokens: pulido a11y/meta
Si terminas con holgura y sin tocar lógica: `<html lang="es">` donde falte, `favicon` (usa un logo de
`assets/`), revisa foco/`aria` e índice navegable por teclado en `legal.html`, y añade `title`/
`meta description` + Open Graph a `legal.html` (mismo patrón que las otras 3). Revalida con el smoke
test. Si no alcanza, NO lo empieces.

## 4. Cierre obligatorio (regla de CADA sesión)
Sitio funcionando (`node --check` + smoke test) + commit git + bundle regenerado y verificado +
**memoria (`estrella3d.md`)** y **README** actualizados con el estado de esta sesión y la próxima.
Resumen final a Daniel: qué quedó, cómo probarlo, y **la lista completa de placeholders `[POR DEFINIR]`
que él debe completar** antes de publicar (datos de la empresa, plazos, costos y cobertura de despacho),
más el recordatorio de revisar los textos legales antes de publicarlos.
