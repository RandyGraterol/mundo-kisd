@echo off
REM Script para iniciar Mundo Kids automaticamente
REM Desarrollado para U.E.E. "Jacinto Silva" - Valle Morin

echo ========================================
echo    MUNDO KIDS - Plataforma Educativa
echo ========================================
echo.
echo Iniciando servidor...
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado en este equipo.
    echo Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar si las dependencias estan instaladas
if not exist "node_modules\" (
    echo Instalando dependencias por primera vez...
    echo Esto puede tomar unos minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudieron instalar las dependencias.
        pause
        exit /b 1
    )
    echo.
    echo Dependencias instaladas correctamente!
    echo.
)

REM Iniciar el servidor en segundo plano
echo Iniciando servidor en http://localhost:3000
echo.
start /B node server.js

REM Esperar 3 segundos para que el servidor inicie
timeout /t 3 /nobreak >nul

REM Abrir el navegador predeterminado
echo Abriendo navegador...
start http://localhost:3000

echo.
echo ========================================
echo  Mundo Kids esta corriendo!
echo  URL: http://localhost:3000
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo o simplemente cierra esta ventana.
echo.

REM Mantener la ventana abierta y mostrar logs del servidor
node server.js
