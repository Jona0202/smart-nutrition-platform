# Script para iniciar el servidor
# Ejecuta: .\start.ps1

Write-Host "🚀 Iniciando Smart Nutrition Platform API..." -ForegroundColor Green
Write-Host ""

# Verificar que venv existe
if (-not (Test-Path "venv")) {
    Write-Host "❌ Entorno virtual no encontrado." -ForegroundColor Red
    Write-Host "Ejecuta primero: .\install.ps1" -ForegroundColor Yellow
    exit 1
}

# Iniciar servidor
Write-Host "✓ Servidor iniciando en http://localhost:8000" -ForegroundColor Cyan
Write-Host "✓ Documentación: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

.\venv\Scripts\python.exe -m src.main
