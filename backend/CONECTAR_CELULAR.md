# Guía: Conectar Celular al API

## ✅ El API ya está listo para celular

### Paso 1: Encuentra tu IP

Ejecuta en PowerShell:
```powershell
ipconfig
```

Busca "IPv4 Address" bajo "WiFi" o "Ethernet":
```
Ejemplo: 192.168.1.15
```

### Paso 2: Abre el puerto en firewall

**Click derecho en PowerShell → "Ejecutar como administrador"**

```powershell
New-NetFirewallRule -DisplayName "Nutrition API" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### Paso 3: El servidor YA acepta conexiones externas ✅

El API ya usa `--host 0.0.0.0` que acepta de cualquier IP.

### Paso 4: Conecta desde tu celular

1. **Asegúrate que tu celular esté en la MISMA WiFi**
2. **Abre Chrome en el celular**
3. **Ve a:** `http://TU_IP:8000/docs`

Ejemplo:
```
http://192.168.1.15:8000/docs
```

### Paso 5: Prueba que funciona

Deberías ver la documentación de Swagger en tu celular.

---

## 🚀 Para PWA (instalar como app)

Cuando hagamos el frontend PWA:

1. Abres la app en Chrome (celular)
2. Chrome muestra: "Agregar a pantalla de inicio"
3. Click → ícono aparece junto a tus otras apps
4. Abres y funciona como app nativa

---

## ⚠️ Troubleshooting

### "No se puede conectar"

1. **Verifica firewall:**
   ```powershell
   Get-NetFirewallRule -DisplayName "Nutrition API"
   ```

2. **Verifica que el servidor esté corriendo:**
   Debe mostrar: `Uvicorn running on http://0.0.0.0:8000`

3. **Verifica que estén en la misma WiFi:**
   - PC y celular deben estar en la misma red

### "Connection refused"

- Asegúrate de usar la IP correcta
- Debe ser `192.168.x.x` no `127.0.0.1`

---

## 🌍 Para acceso desde internet (opcional)

### Opción A: ngrok (más fácil)
```powershell
ngrok http 8000
```

Te da URL pública tipo: `https://abc123.ngrok.io`

### Opción B: Deploy en la nube (producción)
- Railway.app (gratis)
- Render.com (gratis)
- DigitalOcean ($5/mes)

---

## ✅ Checklist

- [ ] Encontrar IP de tu PC
- [ ] Abrir puerto 8000 en firewall
- [ ] Verificar que servidor use `0.0.0.0`
- [ ] Conectar celular a misma WiFi
- [ ] Abrir `http://TU_IP:8000/docs` en Chrome del celular
- [ ] ¡Funciona! 🎉
