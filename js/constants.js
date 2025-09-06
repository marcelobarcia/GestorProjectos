// Constantes
const STATUS_COLORS = { 
    'Pendiente': '#94a3b8', 
    'En Progreso': '#f59e0b', 
    'Completada': '#16a34a', 
    'Atrasada': '#dc2626', 
    'Fase': '#475569' 
};

const VIEW_CONFIGS = { 
    day: { unitWidth: 40 }, 
    week: { unitWidth: 70 }, 
    month: { unitWidth: 200 }, 
    year: { unitWidth: 350 } 
};

// Variables globales - exponer en window para acceso global
window.projects = [];
window.activeProjectId = null;
window.currentView = 'month'; // Vista actual del Gantt (day, week, month, year)

// También crear referencias locales para compatibilidad
let projects = window.projects;
let activeProjectId = window.activeProjectId;
let currentView = window.currentView;

// Exponer constantes globalmente
window.STATUS_COLORS = STATUS_COLORS;
window.VIEW_CONFIGS = VIEW_CONFIGS;
