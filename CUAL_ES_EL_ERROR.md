# 🚨 DIAGNÓSTICO RÁPIDO

## 📋 LO QUE NECESITO SABER:

**En la terminal donde corre el backend**, después de subir la foto, ¿qué error aparece?

Debería verse algo como:

```
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "...", line X, in ...
    ...
SomeError: [MENSAJE DE ERROR AQUÍ]
```

**CÓPIAME ESE ERROR COMPLETO** y te digo exactamente cómo arreglarlo.

---

## 🔍 POSIBLES CAUSAS:

### 1. API Key de Gemini inválida o sin permisos
**Síntoma:** Error tipo `401 Unauthorized` o `API key not valid`

**Solución:** Verifica que la API key sea correcta en `.env`

### 2. Falta activar la API de Gemini en Google Cloud
**Síntoma:** Error `403 Forbidden` o `API not enabled`

**Solución:** Ve a https://aistudio.google.com/app/apikey y verifica que la key esté activa

### 3. Módulo no importado correctamente
**Síntoma:** `ModuleNotFoundError` o `ImportError`

**Solución:** Reinstalar dependencias o reiniciar backend

### 4. Archivo food_database.json mal formateado
**Síntoma:** `JSONDecodeError`

**Solución:** Regenerar el archivo

---

## 🔧 MIENTRAS TANTO, PRUEBA ESTO:

**Reinicia el backend limpiamente:**

```powershell
# Ctrl+C para matar el actual
cd C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend
$env:PYTHONPATH = "C:\Users\JONATAN\.gemini\antigravity\scratch\smart-nutrition-platform\backend"
uvicorn src.main:app --reload --host 0.0.0.0
```

Luego **prueba de nuevo** y **mira qué dice la terminal**.

---

**Dime el error exacto y lo resuelvo en 2 minutos** 🚀
