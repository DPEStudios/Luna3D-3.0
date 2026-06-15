@echo off
cd /d "%~dp0"
set "LOG=%~dp0ultimo_arranque_web.log"
echo ===== Arranque WEB ===== > "%LOG%"
echo Fecha: %date% %time% >> "%LOG%"
echo Carpeta: %cd% >> "%LOG%"

echo.
echo ==================================================
echo    WEB LUNA 3D (vista local)
echo    Esta ventana debe quedar ABIERTA mientras la ves.
echo ==================================================
echo.

set "PYEXE="
for %%P in (python.exe py.exe python3.exe) do (
  if not defined PYEXE (
    where %%P >nul 2>nul && set "PYEXE=%%P"
  )
)
echo PYEXE detectado: %PYEXE% >> "%LOG%"

if not defined PYEXE (
  echo [PROBLEMA] No encontre Python en este PC.
  echo [PROBLEMA] No encontre Python. >> "%LOG%"
  echo.
  echo Instala Python desde https://www.python.org/downloads/
  echo y MARCA "Add python.exe to PATH". Luego vuelve a abrir este archivo.
  echo.
  pause
  exit /b
)

echo Python OK: %PYEXE%
echo Abriendo el navegador en http://localhost:8080/index.html ...
echo (Si dice "no se puede acceder", espera 2 seg y pulsa Volver a cargar.)
echo.
start "" http://localhost:8080/index.html
%PYEXE% -m http.server 8080 >> "%LOG%" 2>&1
echo Servidor termino. Codigo: %errorlevel% >> "%LOG%"

echo.
echo --- La web local se detuvo. Si algo fallo, esta en ultimo_arranque_web.log ---
pause
