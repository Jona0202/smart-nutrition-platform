# Script de instalación automatizado para Windows
# Ejecuta: .\install.ps1

Write-Host "🚀 Smart Nutrition Platform - Instalación Automatizada" -ForegroundColor Green
Write-Host ""

# 1. Verificar Python
Write-Host "✓ Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Python no encontrado. Instala Python 3.11+ primero." -ForegroundColor Red
    exit 1
}

# 2. Eliminar venv anterior si existe
if (Test-Path "venv") {
    Write-Host "✓ Eliminando entorno virtual anterior..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

# 3. Crear nuevo venv
Write-Host "✓ Creando entorno virtual..." -ForegroundColor Yellow
python -m venv venv

# 4. Activar venv y actualizar pip
Write-Host "✓ Actualizando pip..." -ForegroundColor Yellow
.\venv\Scripts\python.exe -m pip install --upgrade pip --quiet

# 5. Instalar dependencias
Write-Host "✓ Instalando dependencias (esto puede tardar 2-3 minutos)..." -ForegroundColor Yellow
.\venv\Scripts\pip.exe install -r requirements-demo.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Instalación completada exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Activar entorno: .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  2. Ejecutar tests:  pytest -v" -ForegroundColor White
    Write-Host "  3. Iniciar API:     python -m src.main" -ForegroundColor White
    Write-Host "  4. Abrir docs:      http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error durante la instalación" -ForegroundColor Red
    Write-Host "Revisa el mensaje de error arriba" -ForegroundColor Yellow
    exit 1
}
