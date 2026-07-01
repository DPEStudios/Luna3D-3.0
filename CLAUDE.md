# CLAUDE.md — Web_Luna3D_v3

> Leer ANTES de tocar cualquier archivo de este proyecto (regla del CLAUDE.md
> global de Daniel: todo proyecto con `package.json`/similar debe revisarse
> por instrucciones locales antes de ejecutar nada).

## ⚠ Migración en curso (2026-07-01): el repo está saliendo de Google Drive

Se está moviendo la copia de trabajo a una carpeta **local fuera de Drive**
(`C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0`). Antes de aplicar las reglas
de abajo, fíjate DÓNDE estás trabajando:

- **Carpeta local `C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0` (fuera de
  Drive):** git funciona normal en general (el `origin` sí es el repo real de
  GitHub). Las dos "Reglas no negociables" de más abajo, que se escribieron
  pensando solo en Google Drive, **siguen aplicando igual acá** — ver el
  aviso `⚠ 2026-07-01 (sesión Cowork)` justo abajo: se confirmó que la
  corrupción de archivos y los locks de git pegados también ocurren en esta
  carpeta cuando se opera desde el puente bash de Cowork, aunque no cuando
  Daniel corre git directo en su PowerShell. El guard
  `_tools/verificar_integridad.py` sigue siendo obligatorio, no opcional.

### ⚠ 2026-07-01 (sesión Cowork): la corrupción NO era exclusiva de Google Drive

Se probó el flujo completo (editar `app.js`, commit, push, verificar en
luna3d.cl, revertir) desde esta carpeta ya migrada, operando vía el puente
bash de una sesión de Cowork. Resultado: **la misma corrupción documentada
para el mount de Drive ocurrió acá también, dos veces en una sesión**:

1. Un `sed -i` sobre `app.js` (para normalizar CRLF→LF) lo truncó a mitad de
   archivo — mismo patrón de "prefijo cortado" ya descrito abajo.
2. Un `Edit` que achicaba el archivo (quitar el botón de prueba) dejó el
   contenido correcto pero con una cola de bytes `\x00` rellenando hasta el
   tamaño anterior — mismo patrón de "cola de nulos" ya descrito abajo.

Además, `git add`/`commit`/`push` desde ese mismo puente bash chocan
repetidamente con locks pegados (`.git/index.lock`, `.git/HEAD.lock`,
`.git/refs/remotes/origin/*.lock`) que no se pueden borrar con `rm`
("Operation not permitted") — se destraban renombrándolos (`mv` a otro
nombre, no `rm`) y con `GIT_INDEX_FILE` apuntando fuera del mount para el
`add`. Se confirmó con Daniel, en paralelo, que el mismo `git add` corriendo
en su PowerShell nativo (sin pasar por Cowork) funciona sin ningún problema
— o sea, el origen del problema es el puente de la sesión de Cowork hacia
esta carpeta, no el repo ni la carpeta en sí.

**Conclusión operativa:** sacar el repo de Google Drive NO elimina el riesgo
de corrupción mientras se edite vía una sesión de Cowork/agente. Toda sesión
futura que edite archivos en esta carpeta (venga o no de Drive) debe:
verificar tamaño/hash del archivo contra el blob de git ANTES de hacer
`git add`, evitar `sed -i`/reescrituras in-place de archivos grandes vía
bash, y correr `git fsck --full` + revisar bytes nulos antes de cualquier
`push`. Si algo falla o se ve raro, es más seguro pedirle a Daniel que corra
el `git add`/`commit`/`push` final desde su propia terminal.
- **Carpeta dentro de Google Drive (`...\AI\...\Web_Luna3D_v3`):** la migración
  no se ha completado o estás en la copia vieja. Aplican TODAS las reglas de
  abajo. Corre `MIGRAR_Luna3D_fuera_de_Drive.bat` y pásate a la carpeta local.

## Regla no negociable: esta carpeta NO es la fuente real de git

Esta carpeta (`Web_Luna3D_v3`) está montada desde Google Drive. Git no opera
de forma confiable acá adentro (el `origin` configurado es un bundle local,
no el repo real). El repo real es `https://github.com/DPEStudios/Luna3D-3.0`,
rama `main`, conectado a Vercel con auto-deploy.

**Cualquier cambio que deba llegar a producción (luna3d.cl) DEBE seguir el
protocolo completo descrito en `DEPLOY_Vercel.md` → sección "Protocolo
obligatorio antes de subir cualquier cambio"**: clonar limpio desde GitHub,
comparar diferencias contra esta carpeta ANTES de tocar nada, fusionar lo que
corresponda, push, verificar en la URL real, y copiar el resultado final de
vuelta a esta carpeta (con respaldo en `_Papelera/` vía skill
`papelera-segura`).

Saltarse ese protocolo causó un incidente real el 2026-07-01: un despliegue
revirtió silenciosamente un fix que solo existía en esta carpeta (badge del
carrito) porque se usó GitHub como base sin diferenciar primero. No repetir
ese error.

## Regla no negociable #2: el mount CORROMPE los archivos que se escriben en él

Investigado y confirmado el 2026-07-01 (detalle forense completo en
`DEPLOY_Vercel.md` → "Corrupción binaria de archivos en el mount"). Escribir un
archivo directamente sobre esta carpeta montada en Google Drive con las
herramientas de edición (Read/Edit/Write) puede dañarlo en el disco de dos
formas: (1) **truncamiento** —la escritura se corta a mitad y el archivo queda
como un prefijo cortado a mitad de token—; o (2) **cola de bytes nulos** —el
contenido queda completo pero se le agregan `\x00` al final—. La causa es una
carrera entre la escritura y el cliente de sincronización de Google Drive; a
mayor tamaño de archivo, mayor probabilidad (`styles.css`, el más grande, es la
víctima más frecuente).

**Reglas duras para toda sesión (sin excepción):**

1. **No editar archivos grandes in-place sobre el mount.** Editar siempre en una
   copia FUERA del mount (clon en `/tmp` del sandbox, o `outputs/`), y traer el
   resultado UNA sola vez.
2. **Toda copia de vuelta al mount se verifica.** Usar el guard
   `_tools/verificar_integridad.py`:
   - `python3 _tools/verificar_integridad.py safecopy <origen> <destino>`
     copia con verificación sha256 + reintento; solo sale 0 si el destino quedó
     íntegro.
   - `python3 _tools/verificar_integridad.py scan .` escanea todo el repo y
     falla (exit 1) si algún archivo de texto tiene bytes nulos.
3. **Nunca hacer `git push` / desplegar si `scan` o `verify` fallan.** Un
   archivo que no pasó la verificación JAMÁS llega a producción.
4. Al cerrar sesión, correr `scan .` y confirmar que da 0 corruptos.

> Solución de fondo (en curso): sacar el repo de Google Drive y trabajar en una
> carpeta local normal — ver el banner de arriba y `DEPLOY_Vercel.md`. Mientras
> sigas dentro de Drive, las reglas de arriba son obligatorias.

## Al terminar cualquier sesión que haya tocado archivos de producción

Dejar esta carpeta y el `main` de GitHub con contenido idéntico en los
archivos tocados. Si quedan diferencias pendientes de reconciliar (por
ejemplo, algo que el usuario pidió pero no se alcanzó a subir), decírselo
explícitamente a Daniel — no asumir que "ya quedó" sin haberlo