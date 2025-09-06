// Main application functions
function render() {
    console.log('🎨 Rendering app...', {
        projects: projects.length,
        activeProjectId,
        currentView,
        isAuthenticated: authManager ? authManager.isAuthenticated() : false
    });
    
    const project = getActiveProject();
    
    console.log('📊 Render state:', { 
        project: project ? project.name : 'none',
        hasProject: !!project 
    });
    
    if (!project) {
        console.log('👋 No project - showing welcome/no project view');
        mainContent.classList.add('hidden');
        noProjectView.classList.remove('hidden');
        return;
    }
    
    console.log('✅ Has project - showing main content');
    mainContent.classList.remove('hidden');
    noProjectView.classList.add('hidden');
    
    calculateProjectSchedule(project);
    calculateCriticalPath(project);
    project.tasks.sort((a, b) => parseDate(a.start) - parseDate(b.start) || (a.isMilestone ? -1 : 1));
    
    renderProjectUI(project);
    renderControls(project);
    renderResourceList(project);
    populateResourceDropdowns(project);
    populatePredecessorDropdown(document.getElementById('task-predecessor'), project);
    renderHolidayList(project);
    renderBaselinesUI(project);
    renderGantt(project);
    renderDashboard(project);
    
    // Auto-save to Firebase when rendering (debounced)
    debounceAutoSave();
}

// Debounced auto-save function
let autoSaveTimeout;
function debounceAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        const project = getActiveProject();
        if (project) {
            await updateProject(project);
        }
    }, 2000); // Auto-save after 2 seconds of inactivity
}

// Application initialization
async function initializeApp() {
    console.log('🚀 Initializing app for user...');
    
    // Verificar que las variables globales estén en estado limpio
    console.log('📊 Initial state check:', {
        projectsCount: projects ? projects.length : 'undefined',
        activeProjectId: activeProjectId,
        isAuthenticated: authManager ? authManager.isAuthenticated() : false
    });
    
    // Asegurar que las variables estén inicializadas
    if (typeof projects === 'undefined') {
        window.projects = [];
    }
    if (typeof activeProjectId === 'undefined') {
        window.activeProjectId = null;
    }
    
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
        activeProjectId = projects[0].id;
        console.log('✅ Set active project:', activeProjectId);
    }
    
    console.log('🎯 Final state - Projects:', projects.length, 'Active:', activeProjectId);
    
    // Asegurar que los event listeners están configurados
    if (typeof setupEventListeners === 'function') {
        console.log('🔗 Setting up event listeners...');
        setupEventListeners();
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
            if (projects.length > 0) {
                await firebaseManager.createBackup();
                console.log('Auto-backup created');
            }
        }, 30 * 60 * 1000); // 30 minutos
        window.autoBackupConfigured = true;
    }
}

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
