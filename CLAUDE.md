# CLAUDE.md — Web_Luna3D_v3

> Leer ANTES de tocar cualquier archivo de este proyecto (regla del CLAUDE.md
> global de Daniel: todo proyecto con `package.json`/similar debe revisarse
> por instrucciones locales antes de ejecutar nada).

## ⚠ Migración en curso (2026-07-01): el repo está saliendo de Google Drive

Se está moviendo la copia de trabajo a una carpeta **local fuera de Drive**
(`C:\Daniel Pardo\Estrella 3D SpA\dev\Luna3D-3.0`). Antes de aplicar las reglas
de abajo, fíjate DÓNDE estás trabajando:

- **Carpeta local `C:\Daniel Pardo\Estrella 3D SpA\dev\Luna3D-3.0` (fuera de
  Drive):** git
  funciona normal y no hay corrupción de mount. Las dos "Reglas no negociables"
  de más abajo (que son específicas de Google Drive) **ya no aplican**; trabaja
  con git estándar: editar → commit → push a GitHub → Vercel despliega. El guard
  `_tools/verificar_integridad.py` queda como red de seguridad opcional.
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