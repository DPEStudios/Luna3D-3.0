@echo off
REM Instala el hook pre-commit del guardian de integridad (Windows).
for /f "delims=" %%i in ('git rev-parse --show-toplevel') do set ROOT=%%i
copy /Y "%ROOT%\_tools\pre-commit" "%ROOT%\.git\hooks\pre-commit" >nul
echo Hook instalado. El guardian correra en cada commit.
