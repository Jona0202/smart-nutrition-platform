# Instrucciones de Instalación - Windows

## 🚀 Quick Start (Sin Base de Datos)

### 1. Abrir PowerShell en el directorio del proyecto

```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend
```

### 2. Crear entorno virtual

```powershell
python -m venv venv
```

### 3. Activar entorno virtual

```powershell
.\venv\Scripts\Activate.ps1
```

**Si tienes error de permisos**, ejecuta esto primero:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4. Instalar dependencias DEMO (sin PostgreSQL)

```powershell
pip install --upgrade pip
pip install -r requirements-demo.txt
```

### 5. Ejecutar el servidor

```powershell
python -m src.main
```

### 6. Abrir en navegador

```
http://localhost:8000/docs
```

## 🧪 Ejecutar Tests

```powershell
pytest -v
```

## ⚠️ Si quieres instalar TODO (incluyendo PostgreSQL)

Necesitas instalar Visual Studio Build Tools primero, luego:

```powershell
pip install -r requirements.txt
```

Pero para el **demo del API**, `requirements-demo.txt` es suficiente.

## 📝 Probar Endpoints

### Endpoint 1: Calcular BMR

```bash
POST http://localhost:8000/demo/calculate-bmr
Content-Type: application/json

{
  "weight_kg": 80,
  "height_cm": 180,
  "age": 30,
  "gender": "male",
  "body_fat_percentage": 15
}
```

### Endpoint 2: Perfil Completo

```bash
POST http://localhost:8000/demo/calculate-profile
Content-Type: application/json

{
  "gender": "male",
  "date_of_birth": "1994-01-01",
  "height_cm": 180,
  "current_weight_kg": 80,
  "body_fat_percentage": 15,
  "activity_level": "moderate",
  "goal": "cutting"
}
```

---

## 🔧 Troubleshooting

### Error: "python no se reconoce"
- Asegúrate de tener Python 3.11+ instalado
- Añade Python al PATH

### Error: "Activate.ps1 cannot be loaded"
- Ejecuta: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Error: "ModuleNotFoundError"
- Verifica que el venv esté activado (deberías ver `(venv)` en el prompt)
- Reinstala: `pip install -r requirements-demo.txt`
