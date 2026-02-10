@echo off
echo ========================================
echo  INICIANDO FRONTEND - Smart Nutrition
echo ========================================
echo.

cd /d "%~dp0"

echo Frontend directory: %CD%
echo.
echo Iniciando servidor de desarrollo...
echo Para acceso local: http://localhost:3000
echo Para acceso movil: http://192.168.18.6:3000
echo.
echo Presiona Ctrl+C para detener
echo.

npm run dev
