# sanear_repo.ps1 - Saneamiento unico del repo Luna3D-3.0 (2026-07-02)
# Correr UNA vez desde PowerShell nativo de Daniel:
#   cd C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0
#   powershell -ExecutionPolicy Bypass -File _tools\sanear_repo.ps1
#
# Que hace (en orden, se detiene si algo falla):
#   1. Verifica que estas en el repo correcto y sin locks de git
#   2. git fetch + reset --hard origin/main (el working tree YA fue verificado
#      identico a origin/main modulo CRLF por la sesion del 2026-07-02;
#      backup completo en _Papelera\2026-07-02_pre_saneamiento)
#   3. Escaneo de bytes nulos post-reset (verificar_integridad.py scan)
#   4. Instala el hook pre-commit del guardian
#   5. core.autocrlf=false + commit de .gitattributes (normalizacion EOL)
#   6. Commit de herramientas nuevas + workflow CI
#   7. Push y verificacion final HEAD == origin/main

# "Continue" a proposito: en PowerShell 5.1, "Stop" convierte cualquier warning
# de git por stderr en excepcion fatal. Los errores reales se controlan con $LASTEXITCODE.
$ErrorActionPreference = "Continue"

function Paso($n, $msg) { Write-Host "`n=== [$n] $msg ===" -ForegroundColor Cyan }
function Falla($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }

# --- 1. Contexto ---
Paso 1 "Verificando contexto"
$root = git rev-parse --show-toplevel 2>$null
if (-not $root) { Falla "No estas dentro del repo. cd a C:\Daniel_Pardo\Estrella_3D_SpA\dev\Luna3D-3.0" }
Set-Location $root
$remote = git remote get-url origin
if ($remote -notmatch "DPEStudios/Luna3D-3.0") { Falla "origin no es el repo real: $remote" }
$locks = Get-ChildItem ".git" -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue
if ($locks) {
    Write-Host "Locks encontrados, eliminando (desde terminal nativa si se puede):"
    $locks | ForEach-Object { Write-Host "  $($_.FullName)"; Remove-Item $_.FullName -Force }
}
if (-not (Test-Path "_Papelera\2026-07-02_pre_saneamiento")) {
    Falla "No existe el backup _Papelera\2026-07-02_pre_saneamiento. No seguir sin backup."
}
Write-Host "Repo OK, backup presente." -ForegroundColor Green

# --- 2. Alinear con GitHub ---
Paso 2 "git fetch + reset --hard origin/main"
git fetch origin
if ($LASTEXITCODE -ne 0) { Falla "git fetch fallo" }
# Guardia anti-perdida: si hay commits locales que origin/main no tiene, ABORTAR.
# (Este script es de UN solo uso; un reset --hard aqui destruiria esos commits.)
$adelante = git rev-list --count "origin/main..HEAD"
if ([int]$adelante -gt 0) {
    Falla "Hay $adelante commit(s) locales sin subir. Este script ya cumplio su funcion; usa _tools\subir_cambios.ps1."
}
git reset --hard origin/main
if ($LASTEXITCODE -ne 0) { Falla "git reset fallo" }
Write-Host "HEAD ahora en: $(git log --oneline -1)" -ForegroundColor Green

# --- 3. Escaneo de integridad ---
Paso 3 "Escaneando bytes nulos en todo el repo"
python _tools\verificar_integridad.py scan .
if ($LASTEXITCODE -ne 0) { Falla "El escaneo detecto archivos corruptos. NO seguir. Avisar a Claude/Daniel." }
Write-Host "0 archivos corruptos." -ForegroundColor Green

# --- 4. Hook pre-commit ---
Paso 4 "Instalando hook pre-commit"
Copy-Item "_tools\pre-commit" ".git\hooks\pre-commit" -Force
if (-not (Test-Path ".git\hooks\pre-commit")) { Falla "No se pudo instalar el hook" }
Write-Host "Hook instalado." -ForegroundColor Green

# --- 5. Normalizacion EOL ---
Paso 5 "core.autocrlf=false + .gitattributes"
git config core.autocrlf false
git add .gitattributes
git add --renormalize .
$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "chore: .gitattributes (EOL consistente LF) + renormalizacion"
    if ($LASTEXITCODE -ne 0) { Falla "Commit de .gitattributes fallo (revisa el mensaje del guardian arriba)" }
} else {
    Write-Host "Nada que renormalizar (repo ya consistente)."
}

# --- 6. Herramientas nuevas + workflow CI ---
Paso 6 "Commit de herramientas nuevas y workflow CI"
git add _tools\sanear_repo.ps1 _tools\subir_cambios.ps1 .github\workflows\integridad.yml 2>$null
$staged = git diff --cached --name-only
if ($staged) {
    git commit -m "chore(tools): flujo de publicacion verificado (subir_cambios.ps1) + CI de integridad"
    if ($LASTEXITCODE -ne 0) { Falla "Commit de herramientas fallo" }
}

# --- 7. Push y verificacion final ---
Paso 7 "Push y verificacion final"
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: push fallo. Si el error menciona 'workflow' scope:" -ForegroundColor Yellow
    Write-Host "  git reset --soft HEAD~1   (deshace solo el ultimo commit local)" -ForegroundColor Yellow
    Write-Host "  y sube .github/workflows/integridad.yml a mano por la web de GitHub." -ForegroundColor Yellow
    exit 1
}
git fetch origin
$local = git rev-parse HEAD
$remoto = git rev-parse origin/main
if ($local -eq $remoto) {
    Write-Host "`nLISTO: HEAD local == origin/main ($local)" -ForegroundColor Green
    Write-Host "Repo saneado. De aqui en adelante usar _tools\subir_cambios.ps1 para publicar." -ForegroundColor Green
} else {
    Falla "HEAD ($local) != origin/main ($remoto). Revisar."
}
