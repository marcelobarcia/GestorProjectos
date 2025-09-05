# Configuración de Firebase para el Gestor de Proyectos

## 📋 Pasos para configurar Firebase

### 1. **Obtener la configuración de Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Configuración del proyecto" (ícono de engranaje)
4. En la sección "Tus apps", busca la configuración web
5. Copia los valores de configuración

### 2. **Actualizar la configuración en index.html**

Busca esta sección en `index.html` y reemplaza con tus datos:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id-aqui"
};
```

### 3. **Configurar las reglas de Firestore**

En Firebase Console > Firestore Database > Reglas, usa estas reglas para desarrollo:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas de desarrollo - CAMBIAR EN PRODUCCIÓN
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. **Para producción, usa reglas más seguras:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Proyectos principales
    match /gestorProyectos/{document} {
      allow read, write: if true; // Aquí podrías agregar autenticación
    }
    
    // Proyectos individuales
    match /proyectos/{projectId} {
      allow read, write: if true; // Aquí podrías agregar autenticación
    }
    
    // Backups
    match /backups/{backupId} {
      allow read, write: if true; // Solo lectura para usuarios normales
    }
  }
}
```

## 🔧 Estructura de datos en Firestore

El sistema guardará los datos en estas colecciones:

### Collection: `gestorProyectos`
- **Document ID**: `allProjects`
- **Campos**:
  - `projects`: Array con todos los proyectos
  - `lastUpdated`: Timestamp de última actualización
  - `version`: Versión del formato de datos

### Collection: `proyectos`
- **Document ID**: `{projectId}` (ID único del proyecto)
- **Campos**: Todos los datos del proyecto individual

### Collection: `backups`
- **Document ID**: `{timestamp}` (fecha/hora del backup)
- **Campos**:
  - `projects`: Snapshot de todos los proyectos
  - `timestamp`: Momento del backup
  - `type`: Tipo de backup (auto-backup, manual)

## 🚀 Características implementadas

- ✅ **Auto-guardado**: Guarda automáticamente después de cambios
- ✅ **Sincronización**: Carga datos al iniciar la aplicación
- ✅ **Backup automático**: Crea backups cada 30 minutos
- ✅ **Estado de conexión**: Indicador visual del estado de Firebase
- ✅ **Notificaciones**: Retroalimentación visual de las operaciones
- ✅ **Manejo de errores**: Funciona offline si es necesario
- ✅ **Debounced saves**: Optimiza las escrituras a Firebase

## 🔔 Notificaciones

El sistema mostrará notificaciones para:
- ✅ Proyectos guardados exitosamente
- ❌ Errores de conexión
- ℹ️ Cargas desde Firebase
- ⚠️ Funcionamiento offline

## 📱 Uso

Una vez configurado:

1. **Al cargar la página**: Se conecta automáticamente y carga tus proyectos
2. **Al crear/editar**: Se guarda automáticamente en Firebase
3. **Estado visual**: El indicador muestra si está conectado (🟢) o desconectado (🔴)
4. **Backup**: Crea backups automáticos cada 30 minutos

¡Tu gestor de proyectos ahora está respaldado en la nube! 🎉
