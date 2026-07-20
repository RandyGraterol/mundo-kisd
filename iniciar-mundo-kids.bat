@echo off
setlocal enabledelayedexpansion
set "PORT=3041"
set "URL=http://localhost:3041"

echo ========================================
echo    MUNDO KIDS - Plataforma Educativa
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado.
    pause
    exit /b 1
)

netstat -ano 2>nul | find "LISTENING" | find ":%PORT%" >nul 2>nul
if !errorlevel! EQU 0 (
    echo [!] El servidor ya esta corriendo en el puerto !PORT!.
    start !URL!
    goto :fin
)

if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias.
        pause
        exit /b 1
    )
)

echo Iniciando servidor...
start "Mundo Kids" node server.js
timeout /t 3 /nobreak >nul
start !URL!

echo.
echo ========================================
echo  Mundo Kids esta corriendo!
echo  URL: !URL!
echo ========================================
echo.

:fin
echo Presiona cualquier tecla para cerrar esta ventana.
pause >nul
