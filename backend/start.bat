@echo off
echo ========================================
echo   INICIANDO BACKEND - Smart Nutrition
echo ========================================
echo.

cd /d "%~dp0"
set PYTHONPATH=%CD%

echo Backend directory: %CD%
echo PYTHONPATH: %PYTHONPATH%
echo.
echo Iniciando servidor en http://0.0.0.0:8000
echo Para acceso local: http://localhost:8000
echo Para acceso movil: http://192.168.18.6:8000
echo.
echo Presiona Ctrl+C para detener
echo.

uvicorn src.main:app --reload --host 0.0.0.0
