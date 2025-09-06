// Main application functions
function render() {
    console.log('🎨 Rendering app...', {
        projects: window.projects ? window.projects.length : 0,
        activeProjectId: window.activeProjectId,
        currentView: window.currentView,
        isAuthenticated: window.authManager ? window.authManager.isAuthenticated() : false
    });
    
    const project = window.getActiveProject ? window.getActiveProject() : null;
    
    console.log('📊 Render state:', { 
        project: project ? project.name : 'none',
        hasProject: !!project 
    });
    
    if (!project) {
        console.log('👋 No project - showing welcome/no project view');
        const mainContent = document.getElementById('main-content');
        const noProjectView = document.getElementById('no-project-view');
        if (mainContent) mainContent.classList.add('hidden');
        if (noProjectView) noProjectView.classList.remove('hidden');
        return;
    }
    
    console.log('✅ Has project - showing main content');
    const mainContent = document.getElementById('main-content');
    const noProjectView = document.getElementById('no-project-view');
    if (mainContent) mainContent.classList.remove('hidden');
    if (noProjectView) noProjectView.classList.add('hidden');
    
    // Usar funciones globales con verificación
    if (window.calculateProjectSchedule) window.calculateProjectSchedule(project);
    if (window.calculateCriticalPath) window.calculateCriticalPath(project);
    
    project.tasks.sort((a, b) => {
        const dateA = window.parseDate ? window.parseDate(a.start) : new Date(a.start);
        const dateB = window.parseDate ? window.parseDate(b.start) : new Date(b.start);
        return dateA - dateB || (a.isMilestone ? -1 : 1);
    });
    
    // Renderizar componentes usando funciones globales
    if (window.renderProjectUI) window.renderProjectUI(project);
    if (window.renderControls) window.renderControls(project);
    if (window.renderResourceList) window.renderResourceList(project);
    if (window.populateResourceDropdowns) window.populateResourceDropdowns(project);
    
    const predecessorSelect = document.getElementById('task-predecessor');
    if (predecessorSelect && window.populatePredecessorDropdown) {
        window.populatePredecessorDropdown(predecessorSelect, project);
    }
    
    if (window.renderHolidayList) window.renderHolidayList(project);
    if (window.renderBaselinesUI) window.renderBaselinesUI(project);
    if (window.renderGantt) window.renderGantt(project);
    if (window.renderDashboard) window.renderDashboard(project);
    
    // Auto-save to Firebase when rendering (debounced)
    debounceAutoSave();
}

// Exponer función globalmente  
window.render = render;

// Debounced auto-save function
let autoSaveTimeout;
function debounceAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        const project = window.getActiveProject ? window.getActiveProject() : null;
        if (project && window.updateProject) {
            await window.updateProject(project);
        }
    }, 2000); // Auto-save after 2 seconds of inactivity
}

// Application initialization
async function initializeApp() {
    console.log('🚀 Initializing app for user...');
    
    // Verificar que las variables globales estén en estado limpio
    console.log('📊 Initial state check:', {
        projectsCount: window.projects ? window.projects.length : 'undefined',
        activeProjectId: window.activeProjectId,
        isAuthenticated: window.authManager ? window.authManager.isAuthenticated() : false
    });
    
    // Asegurar que las variables estén inicializadas
    if (!window.projects) {
        window.projects = [];
    }
    if (!window.activeProjectId) {
        window.activeProjectId = null;
    }
    
    // Crear referencias locales
    const projects = window.projects;
    let activeProjectId = window.activeProjectId;
    
    // Agregar indicador de estado de Firebase
    addFirebaseStatusIndicator();
    
    // Intentar cargar proyectos desde Firebase
    console.log('🔄 Loading projects from Firebase...');
    const loadedFromFirebase = await loadProjectsFromFirebase();
    
    console.log('📦 Projects after loading from Firebase:', projects.length);
    console.log('🔥 Loaded from Firebase:', loadedFromFirebase);
    
    // Si no se cargaron proyectos desde Firebase, crear proyecto demo
    if (!loadedFromFirebase && projects.length === 0) {
        console.log('🆕 Creating demo project for new user...');
        await createProject('Proyecto Demo', true);
        console.log('✅ Demo project created, total projects:', projects.length);
    }
    
    // Asegurar que hay un proyecto activo
    if (!activeProjectId && projects.length > 0) {
        window.activeProjectId = projects[0].id;
        activeProjectId = window.activeProjectId;
        console.log('✅ Set active project:', activeProjectId);
    }
    
    console.log('🎯 Final state - Projects:', projects.length, 'Active:', activeProjectId);
    
    // Asegurar que los event listeners están configurados
    if (typeof window.setupEventListeners === 'function') {
        console.log('🔗 Setting up event listeners...');
        window.setupEventListeners();
    } else {
        console.warn('⚠️ setupEventListeners function not found');
    }
    
    // Renderizar la interfaz
    console.log('🎨 About to render interface...');
    render();
    
    console.log('✅ App initialization completed');
    
    // Auto-backup cada 30 minutos (solo configurar una vez)
    if (!window.autoBackupConfigured) {
        setInterval(async () => {
            if (window.projects.length > 0) {
                await window.firebaseManager.createBackup();
                console.log('Auto-backup created');
            }
        }, 30 * 60 * 1000); // 30 minutos
        window.autoBackupConfigured = true;
    }
}

// Exponer función globalmente
window.initializeApp = initializeApp;

function addFirebaseStatusIndicator() {
    const header = document.querySelector('header .flex');
    if (header && !document.getElementById('firebase-status')) {
        const statusContainer = document.createElement('div');
        statusContainer.className = 'flex items-center gap-2 text-sm text-slate-600';
        statusContainer.innerHTML = `
            <span>Firebase:</span>
            <div id="firebase-status" class="w-3 h-3 bg-gray-400 rounded-full" title="Conectando..."></div>
        `;
        
        // Simplemente agregar al final del header
        header.appendChild(statusContainer);
    }
}

// Manejar errores de conexión
window.addEventListener('online', () => {
    showNotification('Conexión a internet restaurada', 'success');
    loadProjectsFromFirebase();
});

window.addEventListener('offline', () => {
    showNotification('Sin conexión a internet. Los datos se guardarán localmente.', 'warning');
});

// Initialize when DOM is ready - solo si no hay sistema de autenticación
// Si hay auth-manager, este se encargará de llamar initializeApp
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar automáticamente si no hay auth-manager
    if (!window.authManager) {
        setTimeout(() => {
            if (!window.authManager) {
                initializeApp();
            }
        }, 1000);
    }
});
