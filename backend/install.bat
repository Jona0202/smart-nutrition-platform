@echo off
REM Script SIMPLIFICADO - Sin NumPy/SciPy

echo ========================================
echo Smart Nutrition Platform - Instalacion
echo (Version simplificada - sin SciPy)
echo ========================================
echo.

REM 1. Limpiar venv anterior
if exist venv (
    echo [1/4] Eliminando entorno virtual anterior...
    rmdir /s /q venv
)

REM 2. Crear nuevo venv
echo [2/4] Creando entorno virtual...
python -m venv venv
if errorlevel 1 (
    echo ERROR: No se pudo crear el entorno virtual
    pause
    exit /b 1
)

REM 3. Instalar dependencias MINIMAS (solo FastAPI + Pydantic)
echo [3/4] Instalando dependencias (30 segundos)...
venv\Scripts\pip.exe install -r requirements-demo.txt --quiet
if errorlevel 1 (
    echo ERROR: Falló la instalación
    pause
    exit /b 1
)

REM 4. Éxito
echo.
echo [4/4] Instalacion completada!
echo.
echo ========================================
echo Proximos pasos:
echo ========================================
echo 1. Ejecutar: start.bat
echo 2. Abrir: http://localhost:8000/docs
echo.
echo NOTA: Esta es una version simplificada
echo sin NumPy/SciPy para evitar problemas de
echo compilacion en Windows.
echo.

pause
