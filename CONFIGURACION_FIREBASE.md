# 🔧 Configuración Firebase - GestorProyectos

## ⚠️ Datos que necesitas completar

En tu `index.html`, línea 17-24, necesitas reemplazar estos valores:

### 1. **API Key** 
Reemplaza `API_KEY_AQUI` con tu clave API real de Firebase

### 2. **App ID**
Reemplaza `APP_ID_AQUI` con tu App ID real de Firebase

## 📍 Cómo obtener estos datos:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **gestorproyectos-f8642**
3. Haz clic en el ícono de engranaje ⚙️ > "Configuración del proyecto"
4. Scroll hacia abajo hasta "Tus apps"
5. Si no tienes una app web, haz clic en "Agregar app" > ícono web `</>`
6. Registra tu app con el nombre "GestorProyectos"
7. Copia la configuración que aparece

## 🔑 Configuración completa que deberías ver:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...", // Tu clave API real
  authDomain: "gestorproyectos-f8642.firebaseapp.com", // ✅ Ya configurado
  projectId: "gestorproyectos-f8642", // ✅ Ya configurado  
  storageBucket: "gestorproyectos-f8642.appspot.com", // ✅ Ya configurado
  messagingSenderId: "530228161352", // ✅ Ya configurado
  appId: "1:530228161352:web:..." // Tu App ID real
};
```

## 🛡️ Configurar reglas de Firestore

En Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Para desarrollo - CAMBIAR en producción
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## ✅ Una vez configurado:

1. ✅ Tu proyecto se conectará automáticamente a Firebase
2. ✅ Los datos se guardarán en la nube
3. ✅ Tendrás backup automático cada 30 minutos
4. ✅ Verás el indicador de conexión en verde 🟢

## 🚀 Estado actual:

- ✅ Estructura del proyecto: **COMPLETADA**
- ✅ Módulos JavaScript: **IMPLEMENTADOS**  
- ✅ Integración Firebase: **IMPLEMENTADA**
- ⏳ Configuración API Keys: **PENDIENTE** (solo 2 valores)

¡Estás a 2 pasos de tener tu gestor de proyectos funcionando completamente en la nube! 🎉
