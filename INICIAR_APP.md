# 🚀 Cómo Iniciar la Aplicación

## ⚡ Inicio Rápido (Recomendado)

### 1️⃣ Iniciar Backend
```bash
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend
start.bat
```

**O doble click en:** `backend\start.bat`

### 2️⃣ Iniciar Frontend
```bash
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\frontend
start.bat
```

**O doble click en:** `frontend\start.bat`

---

## 📱 URLs de Acceso

### En tu PC:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000

### En tu Celular (mismo WiFi):
- **Frontend:** http://192.168.18.6:3000
- **Backend:** http://192.168.18.6:8000

---

## 🛑 Detener Servidores

En cada ventana de terminal: **Ctrl + C**

---

## 📋 Comandos Manuales (Alternativa)

### Backend (PowerShell):
```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend
$env:PYTHONPATH = "C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend"
uvicorn src.main:app --reload --host 0.0.0.0
```

### Frontend (PowerShell):
```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\frontend
npm run dev
```

---

## ✅ Verificación

**Backend correcto si ves:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Frontend correcto si ves:**
```
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.18.6:3000/
```

---

## 🔧 Solución de Problemas

### Backend no inicia:
```powershell
cd backend
pip install -r requirements.txt
```

### Frontend no inicia:
```powershell
cd frontend
npm install
```

### Puerto ocupado:
- Cierra otras instancias de la app
- O cambia el puerto en el comando
