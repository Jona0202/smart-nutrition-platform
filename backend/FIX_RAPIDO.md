# 🚀 SOLUCIÓN RÁPIDA - Windows

## ❌ Problema que tuviste:
- `psycopg2-binary` requiere compilación C++ en Windows
- FastAPI no se instaló porque requirements. txt falló

## ✅ Solución (2 opciones):

### **Opción 1: Instalación Automática (RECOMENDADA)**

```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend

# Ejecutar script de instalación
.\install.ps1

# Luego iniciar servidor
.\start.ps1
```

Si sale error de permisos:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Opción 2: Instalación Manual**

```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend

# 1. Crear entorno virtual limpio
python -m venv venv

# 2. Activar
.\venv\Scripts\Activate.ps1

# 3. Actualizar pip
python -m pip install --upgrade pip

# 4. Instalar SOLO las dependencias del demo (sin PostgreSQL)
pip install -r requirements-demo.txt

# 5. Iniciar servidor
python -m src.main
```

## 🎯 Después de la instalación:

```powershell
# Ejecutar tests
pytest -v

# Iniciar API
python -m src.main
```

Abre en navegador: http://localhost:8000/docs

## 📝 Probar el API

En Swagger UI (http://localhost:8000/docs):

1. **POST /demo/calculate-bmr**
```json
{
  "weight_kg": 80,
  "height_cm": 180,
  "age": 30,
  "gender": "male"
}
```

2. **POST /demo/calculate-profile**
```json
{
  "gender": "male",
  "date_of_birth": "1994-01-01",
  "height_cm": 180,
  "current_weight_kg": 80,
  "activity_level": "moderate",
  "goal": "cutting"
}
```

## ⏱️ Nota sobre instalación

- La primera instalación tarda **2-3 minutos** porque NumPy y SciPy son paquetes grandes
- Es normal, solo espera a que termine
- Verás barras de progreso descargando e instalando

## 🔧 Si aún tienes errores:

1. **Verifica Python 3.11+**: `python --version`
2. **Reinstala desde cero**: Elimina carpeta `venv` y vuelve a ejecutar `.\install.ps1`
3. **Desactiva antivirus temporalmente** (a veces bloquea la instalación de paquetes)
