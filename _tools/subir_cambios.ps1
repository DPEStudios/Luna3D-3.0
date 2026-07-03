# subir_cambios.ps1 - Flujo UNICO para publicar cambios de Luna3D a produccion.
# Correr SIEMPRE desde PowerShell nativo (nunca desde el puente de una sesion IA):
#   cd C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0
#   powershell -ExecutionPolicy Bypass -File _tools\subir_cambios.ps1
#
# Flujo: integridad -> sincronia con GitHub -> revision de cambios ->
#        confirmacion -> commit -> push -> verificacion.
# Las sesiones de IA solo editan archivos; git vive aca.

# "Continue" a proposito: en PowerShell 5.1, "Stop" convierte cualquier warning
# de git por stderr en excepcion fatal. Los errores reales se controlan con $LASTEXITCODE.
$ErrorActionPreference = "Continue"

function Paso($n, $msg) { Write-Host "`n=== [$n] $msg ===" -ForegroundColor Cyan }
function Falla($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }

$root = git rev-parse --show-toplevel 2>$null
if (-not $root) { Falla "No estas dentro del repo Luna3D-3.0" }
Set-Location $root

# --- 1. Integridad ---
Paso 1 "Escaneo de integridad (bytes nulos)"
python _tools\verificar_integridad.py scan .
if ($LASTEXITCODE -ne 0) { Falla "Hay archivos corruptos. NO se publica nada. Repara primero." }
Write-Host "OK: 0 corruptos" -ForegroundColor Green

# --- 2. Sincronia con GitHub (detecta desincronizacion silenciosa) ---
Paso 2 "Verificando sincronia con origin/main"
git fetch origin
if ($LASTEXITCODE -ne 0) { Falla "git fetch fallo (red o credenciales)" }
$base = git merge-base HEAD origin/main
$local = git rev-parse HEAD
$remoto = git rev-parse origin/main
if ($local -ne $remoto) {
    if ($base -eq $local) {
        Write-Host "HEAD esta DETRAS de origin/main. Commits remotos nuevos:" -ForegroundColor Yellow
        git log --oneline "$local..$remoto"
        $r = Read-Host "Traerlos con pull --ff-only antes de seguir? (s/n)"
        if ($r -eq "s") {
            git pull --ff-only origin main
            if ($LASTEXITCODE -ne 0) { Falla "pull fallo" }
        } else { Falla "No se publica con HEAD desincronizado." }
    } elseif ($base -eq $remoto) {
        Write-Host "Hay commits locales sin push (normal, se subiran ahora)."
    } else {
        Falla "HEAD y origin/main DIVERGIERON. Resolver a mano antes de publicar (git log --oneline --all --graph)."
    }
} else {
    Write-Host "OK: sincronizado con GitHub" -ForegroundColor Green
}

# --- 3. Revision de cambios ---
Paso 3 "Cambios a publicar"
$cambios = git status --short
if (-not $cambios -and (git rev-parse HEAD) -eq (git rev-parse origin/main)) {
    Write-Host "No hay nada que publicar. Working tree limpio y sin commits pendientes."
    exit 0
}
git status --short
Write-Host ""
git diff --stat
$r = Read-Host "`nRevisa la lista. Publicar estos cambios? (s/n)"
if ($r -ne "s") { Write-Host "Cancelado. No se toco nada."; exit 0 }

# --- 4. Commit ---
if ($cambios) {
    Paso 4 "Commit"
    $msg = Read-Host "Mensaje de commit (ej: fix(header): ...)"
    if (-not $msg) { Falla "Mensaje vacio" }
    git add -A
    git commit -m $msg
    if ($LASTEXITCODE -ne 0) { Falla "Commit bloqueado o fallido (mensaje del guardian arriba)" }
}

# --- 5. Push + verificacion ---
Paso 5 "Push a GitHub"
git push origin main
if ($LASTEXITCODE -ne 0) { Falla "Push fallo" }
git fetch origin
if ((git rev-parse HEAD) -eq (git rev-parse origin/main)) {
    Write-Host "`nPUBLICADO: HEAD == origin/main == $(git rev-parse --short HEAD)" -ForegroundColor Green
    Write-Host "Vercel desplegara automaticamente. Verifica en https://luna3d.cl en ~1 min." -ForegroundColor Green
} else {
    Falla "Push termino pero HEAD != origin/main. Revisar."
}
