# Diagnóstico y hardening: corrupción de escritura de archivos + desincronización git en Luna3D-3.0

> Prompt preparado para una IA técnica especializada (idealmente con acceso nativo al PC de
> Daniel — ej. Claude Code corriendo en su propia terminal de Windows, no a través de un
> puente/sandbox remoto). Pégalo completo como primer mensaje. Todo lo descrito acá es evidencia
> observada directamente, no especulación.

## Quién soy y qué necesito

Soy Daniel Pardo, dueño de Estrella 3D SpA. Tengo una tienda web (Luna 3D, `luna3d.cl`) — sitio
estático (HTML/CSS/JS vanilla, sin framework/build step) desplegado en Vercel con auto-deploy
desde GitHub (`https://github.com/DPEStudios/Luna3D-3.0`, rama `main`). El código vive en
`C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0` en mi PC Windows.

Vengo arrastrando, hace dos días, un problema serio y todavía no resuelto: **archivos que se
corrompen (quedan truncados o con bytes basura al final) cuando una sesión de IA en la nube
(Cowork, de Claude/Anthropic) los edita a través de su puente hacia mi carpeta**, más
**problemas de git (locks pegados, objetos temporales que no se pueden borrar, HEAD local
desincronizado de GitHub sin que nadie lo note)**. Ya tengo mitigaciones parciales (descritas
abajo) pero son parches reactivos, no una solución de fondo. Necesito que me ayudes a:

1. Entender la causa raíz (o acotarla todo lo posible).
2. Definir un flujo de trabajo confiable para este repo hacia adelante.
3. Dejar el repo git local sano y sincronizado con GitHub.
4. Cerrar los cabos sueltos de las herramientas de integridad que ya empecé a construir.

No necesito que "me creas" — todo lo que sigue está también documentado dentro del propio
repo, en `CLAUDE.md` y `DEPLOY_Vercel.md` (ambos en la raíz), con ejemplos forenses concretos
(hashes, tamaños en bytes). Léelos como parte del diagnóstico.

---

## Bonus: pasó otra vez mientras escribía este mismo documento

Mientras redactaba este archivo (literalmente el que estás leyendo ahora), lo escribí una vez
completo y bien, después hice una corrección de un typo de una sola palabra al principio (un
`old_string`/`new_string` que ACHICABA el archivo en 6 caracteres) — y la escritura resultante
quedó con el contenido correcto pero con **6 bytes `\x00` agregados al final**, dejando el
archivo en el mismo tamaño que tenía antes de la corrección (16.783 B en vez de los 16.777 B que
correspondían). Se detectó al toque leyendo los bytes crudos del archivo por bash y se corrigió
quitando los nulos finales. Es la firma de "cola de bytes nulos" descrita más abajo, ocurriendo
en vivo, en un archivo nuevo, en el mismo directorio scratch, en la misma sesión, apenas minutos
después del incidente con `nosotros.html`/`styles.css`. Dato interesante para quien diagnostique
esto: en los tres casos de hoy la escritura que se corrompió fue una que **achicaba** el archivo
(reemplazar texto por texto más corto); relacionalo con eso si sirve de pista.

## Cronología completa de la evidencia

### Antes (contexto, no es el bug principal)
- **Abril 2026:** un `rm -rf` accidental durante una reorganización de carpetas borró
  `Estrella3D_Maestro.xlsx` (1.716 fórmulas interconectadas), sin papelera de por medio. De ahí
  nació una regla dura ("papelera segura": nunca borrar directo, siempre mover a `_Papelera/`)
  que ahora aplica a todos mis proyectos. No es la causa del bug de corrupción, pero explica por
  qué cualquier operación destructiva en este repo pasa primero por un backup.
- **Sesión previa (~mediados de junio):** un `sed -i` para normalizar fin de línea CRLF→LF sobre
  `app.js` truncó el archivo a mitad de camino. Esto además dejó **casi todo el repo con una
  mezcla inconsistente de CRLF/LF que sigue sin resolverse** (detalle más abajo, sección
  "Ruido de fin de línea").

### 2026-07-01 — primera investigación forense (carpeta aún en Google Drive)
Con la carpeta del proyecto montada como Google Drive para Escritorio, se documentaron **dos
firmas de corrupción reales**, confirmadas byte a byte comparando contra copias buenas guardadas
en `_Papelera/2026-07-01_*`:

1. **Truncamiento.** El archivo corrupto es un *prefijo exacto* del archivo bueno, cortado a
   mitad de token, con **cero bytes nulos**. Ejemplos reales: `styles.css` terminó en
   `…repeat(2,1fr);}\n  .pr`; `app.js` terminó en `…els.forEac`.
2. **Cola de bytes nulos.** El contenido correcto queda completo (idéntico byte a byte al
   bueno) pero se le agrega un bloque contiguo de `\x00` al final, inflando el tamaño.
   Ejemplo real: `styles.css` de 163.559 B (idéntico al bueno) + 578 bytes nulos en un caso, +241
   en otro.

Hipótesis de entonces: carrera entre la escritura de la herramienta de edición y el cliente de
sincronización de Google Drive. A mayor tamaño de archivo, mayor probabilidad — `styles.css`
(el archivo más grande del repo) era la víctima más frecuente.

**Mitigación creada ese día:** `_tools/verificar_integridad.py`, con tres subcomandos:
- `scan [RAIZ]`: recorre el repo y falla si algún archivo de texto (`.css .js .html .md .json
  .svg .txt .xml .csv`) tiene un solo byte `\x00` (nunca son legítimos en esos formatos).
- `verify ORIGEN DESTINO`: compara sha256 + revisa nulos.
- `safecopy ORIGEN DESTINO [INTENTOS]`: copia con verificación sha256 y reintentos; solo sale 0
  si el destino quedó íntegro.

### 2026-07-01, sesión Cowork — se confirma que NO era exclusivo de Google Drive
Se migró la copia de trabajo fuera de Drive, a una carpeta local normal
(`C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0`, con `origin` apuntando al repo real de
GitHub). Se probó el flujo completo (editar `app.js`, commit, push, verificar en `luna3d.cl`,
revertir) **operando desde el puente bash de una sesión de Cowork**. Resultado: **la misma
corrupción ocurrió igual, dos veces en una sesión**, ya fuera de Drive:

1. Un `sed -i` sobre `app.js` (para normalizar CRLF→LF) lo truncó a mitad de archivo — mismo
   patrón de prefijo cortado.
2. Un uso de la herramienta de edición que achicaba el archivo (quitar un botón de prueba) dejó
   el contenido correcto pero con una cola de bytes `\x00` rellenando hasta el tamaño anterior —
   mismo patrón de cola de nulos.

Además, `git add`/`commit`/`push` desde ese mismo puente bash chocaron repetidamente con locks
pegados (`.git/index.lock`, `.git/HEAD.lock`, `.git/refs/remotes/origin/*.lock`) que **no se
podían borrar con `rm` ("Operation not permitted")** — solo se destrababan renombrándolos
(`mv` a otro nombre, nunca `rm`), y usando `GIT_INDEX_FILE` apuntando fuera del mount para el
`add`. Se confirmó en paralelo que el mismo `git add` corriendo en mi PowerShell nativo (sin
pasar por Cowork) **funciona sin ningún problema** — es decir, el origen parecía estar en el
puente de la sesión de Cowork hacia esa carpeta específica, no en el repo ni en la carpeta en sí.

### 2026-07-02 (HOY) — evidencia nueva que amplía el diagnóstico

Le pedí a una sesión de Cowork que cambiara el texto de la página "Nosotros" (`nosotros.html`) y
agregara una regla de CSS (`styles.css`). La sesión, ya consciente de las reglas de arriba, tomó
la precaución de **copiar ambos archivos a una carpeta de trabajo temporal (`outputs/`) que NO
es la carpeta de Drive, NI siquiera la carpeta del repo montada — es un scratch interno de la
propia sesión de Cowork**, para editar "fuera del mount" siguiendo el protocolo documentado.

**Aun así, la escritura se truncó otra vez, en ese scratch interno:**
- `nosotros.html`: la edición (agrandar el archivo, agregar párrafos) resultó en un archivo del
  mismo tamaño que el original (15.477 B) en vez de más grande — perdió por completo el cierre:
  `<script src="app.js?v=20260625b"></script>`, el `<script>` inline de armado de nav/footer, y
  `</body></html>`. Terminaba abruptamente en
  `<script src="authGateway.js"></script>` sin salto de línea final.
- `styles.css`: la edición (agregar una sola línea CSS) truncó el comentario de cierre del
  archivo: `/* ═══════════ fin SOBRE NOSOTROS 2026-06-25 ═══════════ */` quedó cortado en
  `/* ═══════════ fin`, sin el resto ni salto de línea final.

Esto se detectó **antes** de dar el cambio por bueno, comparando con `git diff` contra `HEAD` y
contra un respaldo en `_Papelera/`, y se reconstruyó manualmente byte por byte (comparando con
`git show HEAD:styles.css` y con el backup de `nosotros.html`) antes de subir nada a producción.

**Esto es información nueva importante:** la hipótesis previa (carrera con el cliente de
sincronización de Google Drive, o algo específico del mount hacia la carpeta del proyecto) **no
explica** una corrupción en un directorio scratch interno de la propia sesión, que no está
sincronizado por Drive ni es la carpeta git del usuario. Apunta a que el problema puede estar en
la propia capa de escritura de archivos del entorno de Cowork/Claude (la herramienta de
edición/escritura, o el sistema de archivos del sandbox donde corre esa sesión), no
(solo) en la sincronización hacia el disco de Daniel.

**Además, hoy, al correr `git fetch` sobre el repo local** (para actualizar referencias, sin
tocar el working tree) aparecieron ~15 líneas de:
```
warning: unable to unlink '.git/objects/90/tmp_obj_XXXXXX': Operation not permitted
```
(un mensaje por objeto temporal, con distintos hashes). El fetch terminó "funcionando" (actualizó
`origin/main` correctamente), pero deja la duda de si el `.git` local quedó con basura o algún
objeto en estado inconsistente que no se manifestó todavía.

**Y también:** el `HEAD` del repo local estaba **6 commits detrás de `origin/main`**
(`1d6e45d` local vs `906f0ad`/antes `c88ac47` en remoto), a pesar de que **el contenido de
`styles.css` en el working tree local YA tenía incorporado el trabajo de esos commits remotos**
(una serie de fixes de animación del theme-toggle, commits `1a782a6`..`c88bfb7`). Es decir: en
algún momento el archivo se escribió en el disco local con ese contenido, pero **sin que el git
local supiera nunca de esos commits** (nunca se hizo `pull`/`fetch`+merge correctamente, o el
contenido se escribió por fuera de git). Esto es exactamente el tipo de desincronización
silenciosa que ya causó un incidente real el 2026-07-01 (un deploy revirtió sin querer un fix
del badge del carrito porque se usó un clon de GitHub como base sin diferenciar primero contra
la carpeta local).

---

## Mitigaciones que ya existen (para no reinventar nada)

1. **`_tools/verificar_integridad.py`** (`scan` / `verify` / `safecopy`) — descrito arriba.
   Detecta corrupción POST-HOC comparando hashes; no la previene.
2. **Protocolo manual en `DEPLOY_Vercel.md`** ("Protocolo obligatorio antes de subir cualquier
   cambio"): clonar limpio desde GitHub en disco temporal → diferenciar contra la carpeta
   local (excluyendo `.git .vercel .claude-secrets` y backups) → reconciliar explícitamente
   cualquier diferencia inesperada → aplicar el cambio nuevo → commit+push → verificar en la URL
   real → copiar el resultado final de vuelta a la carpeta local (con respaldo en `_Papelera/`).
   Funciona pero es 100% manual y pesado para cambios chicos.
3. **Guardián de integridad para git hooks**, agregado HOY mismo en el commit `c88ac47`
   ("chore: agregar guardián de integridad (pre-commit)"), aparentemente por otra sesión mía
   trabajando directo en la terminal nativa:
   - `_tools/check.js`, `_tools/pre-commit`, `_tools/instalar_hook.sh` / `.bat`: hook que revisa
     bytes nulos/sintaxis de los archivos en stage antes de cada commit, y bloquea el commit si
     algo está corrupto.
   - **Ojo:** el hook está en el repo pero **no está instalado** en `.git/hooks/pre-commit` de
     mi clon local (hay que correr `_tools/instalar_hook.sh` o `.bat` una vez).
   - El mismo commit dejó una nota pendiente: falta subir
     `.github/workflows/integridad.yml` (un check de CI) porque el token de GitHub que se usó no
     tiene el scope `workflow`. Queda pendiente agregarlo con un token con ese permiso, o que yo
     lo suba manualmente.
4. **Migración fuera de Google Drive** (parcial): la carpeta de trabajo ya es
   `C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0`, local, no sincronizada por Drive. La
   corrupción persiste igual quando se edita vía Cowork (ver evidencia de hoy), así que esta
   migración por sí sola NO resolvió el problema de fondo — solo descartó a Google Drive como
   única causa.

---

## Ruido de fin de línea (CRLF/LF) — problema secundario pero real

Al comparar la carpeta de trabajo local contra un clon limpio de `origin/main`, **~30 de ~35
archivos de texto del repo muestran diffs de "archivo completo"** que, al normalizar fin de
línea antes de comparar (`tr -d '\r'`), resultan ser **0% cambio de contenido real** — es puro
CRLF (local) vs LF (repo). Esto probablemente viene del incidente del `sed -i` de mediados de
junio mencionado arriba, nunca resuelto. Efecto práctico: `git status`/`git diff` casi no sirven
como señal en este repo (todo aparece "modificado"), lo que hace mucho más fácil pasar por alto
una reconciliación mal hecha durante un deploy.

---

## Lo que necesito que hagas

### A. Diagnóstico de causa raíz de la corrupción de escritura
- Determinar (o acotar lo más posible) en qué capa ocurre el truncamiento/cola-de-nulos: ¿el
  propio mecanismo de escritura de archivos de las sesiones de Cowork (herramienta Edit/Write),
  el sandbox Linux donde corren, el puente de red hacia mi disco, o (menos probable ahora, dado
  lo de hoy en el scratch interno) el cliente de Google Drive?
- Si no se puede diagnosticar desde acá (puede requerir reportarlo a Anthropic/soporte de
  Cowork), decilo explícitamente — no inventes una causa que no se pueda sustentar con la
  evidencia de arriba.

### B. Flujo de trabajo confiable hacia adelante
- Proponer (y si es razonable, implementar) un flujo para este repo que minimice la dependencia
  de escrituras poco confiables. Evaluar en concreto: ¿conviene que **todo** el trabajo de
  archivos y git de este repo se haga desde mi terminal nativa (PowerShell, sin pasar por el
  puente de Cowork), dejando que las sesiones de IA en la nube solo lean/propongan diffs en
  texto plano para que yo aplique? ¿O existe una forma de hacer confiable la escritura desde
  Cowork (ej. escribir y verificar con `safecopy` SIEMPRE, nunca `Write`/`Edit` directo, ni
  siquiera sobre `outputs/`)?
- Si la respuesta es "usar siempre `safecopy` con verificación", diseñar el flujo exacto
  (comandos, orden, qué verificar antes de dar cualquier cambio por bueno) para que cualquier
  sesión futura (mía o de otra IA) lo siga sin ambigüedad.

### C. Reparar y sanear el repo git local
- Confirmar si `.git/objects/*/tmp_obj_*` dejó algo corrupto tras los `Operation not permitted`
  de hoy (`git fsck --full`, y lo que corresponda).
- Alinear el `HEAD` local (`1d6e45d`) con `origin/main` (hoy en `906f0ad`) **sin perder nada**:
  ya se confirmó que el contenido del working tree, descontando ruido CRLF/LF, ya coincide con
  producción salvo por mi cambio de hoy (que ya está pusheado) — pero conviene que confirmes esto
  vos mismo antes de tocar nada, no asumas que sigue siendo cierto.
- Dejar una forma simple de detectar a futuro si el HEAD local se desincroniza de `origin/main`
  sin que yo lo note (ej. un chequeo en el mismo pre-commit hook, o algo que corra al abrir una
  sesión).

### D. Normalizar fin de línea del repo completo
- Proponer e implementar de forma segura (con backup y verificación, no un `sed -i` masivo a
  ciegas) una normalización de fin de línea consistente en todo el repo, más un `.gitattributes`
  que la sostenga hacia adelante, para que `git diff` vuelva a ser una señal confiable.

### E. Cerrar cabos sueltos de las herramientas de integridad existentes
- Instalar el hook de pre-commit en mi clon local (`_tools/instalar_hook.sh` o `.bat`) si
  todavía no está.
- Resolver el pendiente del `.github/workflows/integridad.yml` que no se pudo subir por scope
  del token (ver commit `c88ac47`).
- Revisar si `_tools/verificar_integridad.py` necesita ajustarse a la luz de la corrupción de
  hoy en `outputs/` (¿tiene sentido que el guard también pueda usarse para verificar escrituras
  en directorios scratch de sesiones de IA, no solo en el repo?).

---

## Archivos clave para leer primero (en este orden)

1. `CLAUDE.md` (raíz del repo) — reglas no negociables y banner de migración.
2. `DEPLOY_Vercel.md` (raíz del repo) — protocolo de deploy + forense completo de corrupción del
   2026-07-01, con hashes y tamaños exactos.
3. `_tools/verificar_integridad.py`, `_tools/check.js`, `_tools/pre-commit`,
   `_tools/instalar_hook.sh` / `.bat`.
4. `_Papelera/2026-07-01_*` y `_Papelera/2026-07-02_*` — pares de archivos corrupto/bueno
   guardados como evidencia real, con `_INFO.txt` explicando cada caso.
5. `git log --oneline -15` y `git log --oneline -15 origin/main` para ver el historial reciente
   y confirmar en qué estado está el HEAD local al momento de leer esto (puede haber cambiado
   desde que escribí este prompt).

## Qué NO necesito
- No necesito que me expliques de nuevo qué es git ni cómo funciona un mount de red — quiero
  diagnóstico y solución concretos para ESTE caso, con la evidencia de arriba como base.
- No apures una normalización de CRLF/LF masiva ni una reescritura de `.git` sin respaldo primero
  — este repo ya perdió integridad dos veces esta semana; cualquier operación nueva sobre él debe
  verificarse antes de darse por buena (reusar `_tools/verificar_integridad.py` o equivalente).
