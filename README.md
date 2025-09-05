# Gestor de Proyectos - Carta Gantt

Un gestor de proyectos completo con diagramas de Gantt, desarrollado con HTML, CSS (Tailwind) y JavaScript vanilla.

## 📁 Estructura del Proyecto

```
GestorProjectos/
├── index.html          # Archivo principal HTML
├── css/
│   └── styles.css      # Estilos personalizados CSS
├── js/
│   ├── constants.js           # Constantes y variables globales
│   ├── dom-selectors.js       # Selectores DOM
│   ├── project-manager.js     # Gestión de proyectos
│   ├── date-utils.js          # Utilidades de fechas
│   ├── schedule-calculator.js # Cálculos de programación
│   ├── ui-renderer.js         # Renderizado de interfaz
│   ├── gantt-renderer.js      # Renderizado del Gantt
│   ├── gantt-timeline.js      # Timeline del Gantt
│   ├── gantt-chart.js         # Gráfico del Gantt
│   ├── dashboard-renderer.js  # Renderizado del dashboard
│   ├── form-handlers.js       # Manejo de formularios
│   ├── event-listeners.js     # Event listeners
│   └── main.js               # Función principal
└── README.md           # Documentación
```

## 🏗️ Arquitectura del Código

### Módulos Principales

1. **constants.js** - Define constantes como colores de estado y configuraciones de vista
2. **dom-selectors.js** - Centraliza todos los selectores DOM
3. **project-manager.js** - Maneja la creación y gestión de proyectos
4. **date-utils.js** - Funciones para manejo de fechas y días laborables
5. **schedule-calculator.js** - Cálculos de programación y ruta crítica
6. **ui-renderer.js** - Renderizado de componentes de interfaz
7. **gantt-renderer.js** - Renderizado específico del diagrama de Gantt
8. **gantt-timeline.js** - Gestión del timeline del Gantt
9. **gantt-chart.js** - Gráfico y conexiones del Gantt
10. **dashboard-renderer.js** - Renderizado del dashboard de KPIs
11. **form-handlers.js** - Manejo de formularios y modales
12. **event-listeners.js** - Configuración de event listeners
13. **main.js** - Inicialización y función principal de renderizado

### Características Principales

- ✅ **Gestión de Proyectos Múltiples**
- ✅ **Diagrama de Gantt Interactivo**
- ✅ **Dashboard con KPIs**
- ✅ **Gestión de Recursos**
- ✅ **Líneas Base (Baselines)**
- ✅ **Ruta Crítica**
- ✅ **Gestión de Feriados**
- ✅ **Diferentes Vistas de Tiempo** (Día, Semana, Mes, Año)
- ✅ **Dependencias entre Tareas**
- ✅ **Hitos del Proyecto**
- ✅ **Cálculo Automático de Fechas**

## 🚀 Instalación y Uso

1. **Clonar o descargar** el repositorio
2. **Abrir** `index.html` en un navegador web moderno
3. **Crear** tu primer proyecto o usar el proyecto demo incluido

No requiere instalación de dependencias adicionales ni servidor web.

## 🎨 Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **Tailwind CSS** - Framework de CSS
- **JavaScript Vanilla** - Lógica de aplicación
- **SVG** - Gráficos vectoriales para conexiones

## 📈 Beneficios de la Refactorización

### Antes (archivo único)
- ❌ Código monolítico difícil de mantener
- ❌ Funciones mezcladas sin separación de responsabilidades
- ❌ Difícil de debuggear y extender
- ❌ Todo el código en un solo archivo de >2000 líneas

### Después (modular)
- ✅ **Separación de responsabilidades** clara
- ✅ **Mantenibilidad** mejorada
- ✅ **Reutilización** de código
- ✅ **Debugging** más fácil
- ✅ **Escalabilidad** para nuevas características
- ✅ **Legibilidad** del código mejorada
- ✅ **Trabajo en equipo** facilitado

## 🔧 Extensibilidad

La nueva estructura modular permite fácilmente:

- Agregar nuevos tipos de vistas
- Implementar nuevas funcionalidades de cálculo
- Extender el sistema de renderizado
- Añadir nuevos tipos de tareas
- Integrar con APIs externas
- Implementar persistencia de datos

## 📝 Próximas Mejoras Sugeridas

1. **Persistencia**: Agregar localStorage o integración con backend
2. **Exportación**: PDF, Excel, CSV del proyecto
3. **Plantillas**: Plantillas predefinidas de proyectos
4. **Colaboración**: Múltiples usuarios trabajando en el mismo proyecto
5. **Notificaciones**: Alertas de fechas límite
6. **Integración**: APIs de calendarios (Google Calendar, Outlook)

## 🤝 Contribución

La estructura modular facilita las contribuciones:

1. Identifica el módulo relevante para tu cambio
2. Modifica solo los archivos necesarios
3. Mantén la separación de responsabilidades
4. Documenta nuevas funciones

---

*Desarrollado con ❤️ para mejorar la gestión de proyectos*
