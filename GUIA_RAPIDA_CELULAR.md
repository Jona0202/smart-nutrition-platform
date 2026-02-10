# 📱 GUÍA RÁPIDA: Abrir App en Celular

## 🎯 TUS IPs DETECTADAS:

```
✅ IP 1: 192.168.56.1
✅ IP 2: 192.168.125.1
```

## 📲 URLs PARA PROBAR EN TU CELULAR:

Abre Chrome en tu celular y prueba **una de estas**:

```
http://192.168.56.1:3001
```

O si no funciona, prueba:

```
http://192.168.125.1:3001
```

---

## ⚡ PASO A PASO ULTRA RÁPIDO:

### 1️⃣ Asegúrate que los servidores estén corriendo:

**Terminal 1 (Backend):**
```powershell
cd backend
$env:PYTHONPATH = "C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend"
uvicorn src.main:app --reload --host 0.0.0.0
```
✅ Debe decir: `Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
✅ Debe mostrar: `Network: http://192.168.x.x:3001/`

### 2️⃣ Abre Firewall (PowerShell como Administrador):

```powershell
New-NetFirewallRule -DisplayName "Backend 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Frontend 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### 3️⃣ En tu celular:

1. **Conéctate a la misma WiFi** que tu PC
2. Abre **Chrome**
3. Escribe: `http://192.168.56.1:3001` (o la otra IP)
4. ¡LISTO! 🎉

---

## ✨ NUEVA FUNCIONALIDAD: IA de Comida

Cuando abras la app:

1. Ve a **"📊 Diario"** (segundo tab inferior)
2. Verás un botón **MORADO GIGANTE** con:
   ```
   📸 Analizar con IA
   NUEVO ✨
   ```
3. **Toca ese botón**
4. Permite acceso a la cámara
5. Toma foto de tu comida
6. ¡La IA detecta y calcula TODO automáticamente!

**Detecta:**
- Lomo Saltado → 350g, 630 kcal
- Arroz → 200g, 260 kcal
- etc.

---

## 🔥 SI NO FUNCIONA:

### ❌ "No se puede conectar"
- ✅ Verifica que los 2 servidores estén corriendo
- ✅ Confirma que estés en la **misma WiFi**
- ✅ Prueba la **otra IP** (192.168.125.1)
- ✅ Abre el firewall (comandos arriba)

### ❌ "La cámara no funciona"
- ✅ Permite permisos cuando Chrome lo pida
- ✅ Si falla, usa **"📁 Subir desde Galería"**

### ❌ Backend no conecta
- ✅ Asegúrate que ambos servidores tengan `--host 0.0.0.0`
- ✅ Verifica `.env` del frontend tenga: `VITE_API_URL=http://TU_IP:8000`

---

## 📦 Instalar como App (Opcional)

**En Android:**
1. Menú (⋮) → "Agregar a pantalla de inicio"

**En iOS:**
1. Compartir (□↑) → "Agregar a pantalla de inicio"

¡Tendrás un ícono como app nativa! 📱

---

## 🎯 CHECKLIST:

- [ ] Backend corriendo (puerto 8000)
- [ ] Frontend corriendo (puerto 3001)
- [ ] Firewall abierto para ambos puertos
- [ ] Celular en misma WiFi
- [ ] URL abierta en Chrome: `http://192.168.x.x:3001`
- [ ] ✨ Botón de IA visible en app

---

**¿Listo?** Abre http://192.168.56.1:3001 en tu celular y prueba el análisis con IA! 🚀
