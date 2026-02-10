# 📱 Cómo Abrir la App en tu Celular

## ✨ NUEVA FUNCIONALIDAD: Reconocimiento de Comida con IA 📸

Tu app ahora tiene **análisis de fotos con IA**! Podrás:
- 📷 Tomar foto de tu comida
- 🧠 IA detecta automáticamente los alimentos
- 🎯 Calcula calorías y macros al instante
- 💾 Guardar con un click

---

## Paso 1: Encuentra tu IP

Ejecuta en PowerShell:
```powershell
ipconfig | Select-String "IPv4"
```

Busca **"IPv4 Address"** (debería ser algo como `192.168.x.x`)

**Ejemplo de resultado:**
```
IPv4 Address. . . . . . . . . . . : 192.168.1.15
```

---

## Paso 2: Abre en tu Celular

### En Chrome/Safari de tu celular:

```
http://TU_IP:3001
```

**Ejemplo real:**
```
http://192.168.1.15:3001
```

⚠️ **IMPORTANTE:** 
- Reemplaza `TU_IP` con la IP que encontraste
- Tu celular DEBE estar en la **misma WiFi** que tu PC
- El puerto es **3001** (no 3000)

---

## Paso 3: Verifica que los Servidores Estén Corriendo

Debes tener **2 terminales abiertas**:

### Terminal 1 - Backend (Puerto 8000):
```powershell
cd backend
$env:PYTHONPATH = "C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend"
uvicorn src.main:app --reload --host 0.0.0.0
```

Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 - Frontend (Puerto 3001):
```powershell
cd frontend
npm run dev
```

Deberías ver:
```
➜  Local:   http://localhost:3001/
➜  Network: http://192.168.1.15:3001/
```

La segunda URL (Network) es la que usas en tu celular.

---

## Paso 4: Prueba la Nueva Funcionalidad de IA 🎉

Una vez que abras la app en tu celular:

1. **Completa el onboarding** si es tu primera vez
2. Ve a **"📊 Diario"** (segundo tab)
3. Toca el botón morado gigante **"📸 Analizar con IA"** (con badge "NUEVO ✨")
4. Permite el acceso a la cámara
5. **Toma una foto** de tu comida
6. ¡Espera 3-5 segundos mientras la IA analiza!
7. Verás los alimentos detectados con calorías y macros
8. Confirma y guarda

**Funcionalidades del análisis:**
- ✅ Detecta múltiples alimentos en una foto
- ✅ Estima porciones en gramos
- ✅ Reconoce comida peruana (lomo saltado, ceviche, etc.)
- ✅ Permite editar/eliminar alimentos incorrectos
- ✅ Calcula todo automáticamente

---

## Paso 5: Instalar como App (PWA) - Opcional

Para mejor experiencia (pantalla completa, ícono en home):

### En Android (Chrome):
1. Abre la app en Chrome
2. Toca el menú (⋮)
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
4. Confirma

### En iOS (Safari):
1. Abre la app en Safari
2. Toca el botón de compartir (□↑)
3. Scroll y selecciona **"Agregar a pantalla de inicio"**
4. Confirma

¡Ahora tendrás un ícono como una app nativa!

---

## 🔥 Si no funciona:

### Problema: "No se puede conectar" - Backend

**Abre el puerto 8000 en el firewall:**

```powershell
# Ejecuta PowerShell como Administrador
New-NetFirewallRule -DisplayName "FastAPI Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### Problema: "No se puede conectar" - Frontend

**Abre el puerto 3001 en el firewall:**

```powershell
# Ejecuta PowerShell como Administrador
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### Problema: "La cámara no funciona"

- **Asegúrate de usar HTTPS o localhost** (Chrome requiere esto)
- Si estás en HTTP + IP local, Chrome puede bloquear la cámara por seguridad
- Permite permisos de cámara cuando Chrome lo pida
- Si no funciona, usa el botón "📁 Subir desde Galería"

### Problema: "Timeout" o tarda mucho

- Verifica que ambos (PC y celular) estén en la **misma WiFi**
- Desactiva temporalmente el antivirus/firewall
- Reinicia el router si es necesario
- Confirma que ambos servidores (backend y frontend) estén corriendo

---

## 📊 Checklist Final

- [ ] Backend corriendo en `http://0.0.0.0:8000`
- [ ] Frontend corriendo con `--host` (muestra Network URL)
- [ ] Firewall abierto para puertos 8000 y 3001
- [ ] Celular en la misma WiFi que PC
- [ ] Navegador abierto en `http://TU_IP:3001`
- [ ] ✨ **Botón de IA visible** en la pantalla de Diario

---

## 🎯 Resumen Ultra Rápido

1. 🔍 `ipconfig | Select-String "IPv4"` → Encuentra tu IP
2. 🚀 Abre ambos servidores (backend:8000 + frontend:3001)
3. 📱 En celular: `http://TU_IP:3001`
4. 📸 Prueba la detección de comida con IA!
5. ⭐ Instala como PWA (opcional)

---

## 🆕 Características Implementadas

✅ Registro de comidas manual (90+ alimentos)
✅ Dashboard con progreso diario
✅ Historial con navegación de fechas
✅ Perfil con sincronización en la nube
✅ Autenticación híbrida (local + cloud)
✅ **📸 Reconocimiento de comida con IA (NUEVO!)**

---

**¿Algún problema?** 
- Revisa que las 2 terminales (backend + frontend) estén corriendo
- Verifica la IP con `ipconfig`
- Confirma que tu celular esté en la misma WiFi
- Asegúrate de abrir los puertos en el firewall

¡Disfruta tu app de nutrición con IA! 🎉
