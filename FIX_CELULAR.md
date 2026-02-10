# 🔧 FIX RÁPIDO: App No Abre en Celular

## ❌ PROBLEMAS DETECTADOS:

1. **Frontend .env tiene `localhost`** ❌
   - El celular NO puede conectarse a `localhost`
   - Necesita la IP real de tu PC

2. **Servidores posiblemente NO escuchan en todas las interfaces** ❌
   - Necesitan `--host 0.0.0.0`

---

## ✅ SOLUCIÓN PASO A PASO:

### PASO 1: Encuentra tu IP WiFi Real

```powershell
ipconfig | Select-String "IPv4"
```

**Busca la IP que empiece con `192.168.x.x`** (NO uses 192.168.56.x ni 192.168.125.x, esas son virtuales)

**Ejemplo de IP correcta:**
```
192.168.1.15  ← Esta es tu IP WiFi real
```

---

### PASO 2: Actualiza el archivo `.env` del frontend

**Ubicación:** `frontend\.env`

**Cambia de:**
```
VITE_API_URL=http://localhost:8000
```

**A (usando TU IP real):**
```
VITE_API_URL=http://192.168.1.15:8000
```

⚠️ **REEMPLAZA `192.168.1.15` con TU IP WiFi real!**

---

### PASO 3: REINICIA el Frontend

**MATA** el proceso actual de `npm run dev` (Ctrl+C)

Luego ejecuta:
```powershell
cd frontend
npm run dev
```

Deberías ver algo como:
```
➜  Local:   http://localhost:3001/
➜  Network: http://192.168.1.15:3001/  ← Usa esta en tu celular
```

---

### PASO 4: Verifica el Backend

El backend ya debería estar corriendo con `--host 0.0.0.0`

Si no está corriendo, ejecuta:
```powershell
cd backend
$env:PYTHONPATH = "C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend"
uvicorn src.main:app --reload --host 0.0.0.0
```

---

### PASO 5: Abre el Firewall (PowerShell como Administrador)

```powershell
New-NetFirewallRule -DisplayName "Nutricion Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Nutricion Frontend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

### PASO 6: En tu Celular

1. **Conéctate a la MISMA WiFi** que tu PC
2. Abre **Chrome**
3. Escribe la **Network URL** que apareció en el frontend:
   ```
   http://192.168.1.15:3001
   ```
   (Reemplaza con TU IP)

---

## 🎯 CHECKLIST FINAL:

- [ ] IP WiFi real encontrada (192.168.x.x)
- [ ] `.env` actualizado con IP real (NO localhost)
- [ ] Frontend reiniciado (`npm run dev`)
- [ ] Backend corriendo con `--host 0.0.0.0`
- [ ] Firewall abierto (comandos ejecutados)
- [ ] Celular en MISMA WiFi
- [ ] URL abierta en celular: `http://TU_IP:3001`

---

## 🆘 SI SIGUE SIN FUNCIONAR:

### Encuentra tu IP WiFi correcta:

```powershell
ipconfig
```

Busca la sección **"Adaptador de LAN inalámbrica Wi-Fi"** o **"Wireless LAN adapter Wi-Fi"**

Dentro de esa sección, busca:
```
Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.15
```

**ESA es tu IP correcta!** ✅

---

## ⚠️ IPs a EVITAR:

- ❌ `192.168.56.x` (VirtualBox)
- ❌ `192.168.125.x` (VMware)
- ❌ `127.0.0.1` (localhost)
- ✅ `192.168.1.x` o `192.168.0.x` o `10.0.0.x` (WiFi real)

---

**¿Listo?** Sigue los 6 pasos y prueba de nuevo! 🚀
