# 🚨 FIX URGENTE: Errores de PowerShell

## ❌ PROBLEMAS DETECTADOS:

1. **Directorio incorrecto** - Estás en `system32` en vez del proyecto
2. **PowerShell bloqueando npm** - Política de ejecución restrictiva

---

## ✅ SOLUCIÓN EN 3 PASOS:

### PASO 1: Arregla la Política de Ejecución

**EN POWERSHELL (cualquier directorio), ejecuta:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Cuando pregunte, escribe `S` (Sí) y presiona Enter.

---

### PASO 2: Navega al Proyecto CORRECTO

```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\frontend
```

---

### PASO 3: Ejecuta el Frontend

```powershell
npm run dev
```

Deberías ver:
```
➜  Local:   http://localhost:3001/
➜  Network: http://192.168.18.6:3001/  ← USA ESTA EN TU CELULAR
```

---

## 🎯 COPIAR Y PEGAR (TODO DE UNA VEZ):

**Abre PowerShell NUEVA y ejecuta TODO esto:**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\frontend
npm run dev
```

---

## 🔥 BACKEND TAMBIÉN (EN OTRA TERMINAL):

**Abre OTRA PowerShell y ejecuta:**

```powershell
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend
$env:PYTHONPATH = "C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend"
uvicorn src.main:app --reload --host 0.0.0.0
```

---

## 📱 LUEGO EN TU CELULAR:

Una vez que AMBOS servidores estén corriendo:

1. **Abre Chrome** en tu celular
2. Escribe exactamente: `http://192.168.18.6:3001`
3. ¡Listo! 🎉

---

## ⚠️ RECORDATORIO:

- ✅ `.env` ya está actualizado con tu IP (192.168.18.6)
- ✅ Necesitas DOS terminales abiertas (backend + frontend)
- ✅ Tu celular debe estar en la MISMA WiFi

---

**¿Listo?** Copia y pega los comandos de arriba 🚀
