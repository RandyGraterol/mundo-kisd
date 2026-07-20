@echo off

echo ========================================
echo    Deteniendo Mundo Kids...
echo ========================================
echo.

taskkill /F /IM node.exe >nul 2>nul
if errorlevel 1 (
    echo [!] No habia procesos Node ejecutandose.
) else (
    echo [OK] Servidor detenido correctamente.
)

echo.
pause
