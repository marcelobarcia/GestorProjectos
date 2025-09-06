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

// Variables globales
let projects = [];
let activeProjectId = null;
let currentView = 'month'; // Vista actual del Gantt (day, week, month, year)
