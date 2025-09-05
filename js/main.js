// Main application functions
function render() {
    const project = getActiveProject();
    
    if (!project) {
        mainContent.classList.add('hidden');
        noProjectView.classList.remove('hidden');
        return;
    }
    
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
    // Agregar indicador de estado de Firebase
    addFirebaseStatusIndicator();
    
    // Intentar cargar proyectos desde Firebase
    const loadedFromFirebase = await loadProjectsFromFirebase();
    
    // Si no se cargaron proyectos desde Firebase, crear proyecto demo
    if (!loadedFromFirebase && projects.length === 0) {
        await createProject('Proyecto Demo', true);
    }
    
    // Asegurar que hay un proyecto activo
    if (!activeProjectId && projects.length > 0) {
        activeProjectId = projects[0].id;
    }
    
    setupEventListeners();
    render();
    
    // Auto-backup cada 30 minutos
    setInterval(async () => {
        if (projects.length > 0) {
            await firebaseManager.createBackup();
            console.log('Auto-backup created');
        }
    }, 30 * 60 * 1000); // 30 minutos
}

function addFirebaseStatusIndicator() {
    const header = document.querySelector('header .flex');
    if (header) {
        const statusContainer = document.createElement('div');
        statusContainer.className = 'flex items-center gap-2 text-sm text-slate-600';
        statusContainer.innerHTML = `
            <span>Firebase:</span>
            <div id="firebase-status" class="w-3 h-3 bg-gray-400 rounded-full" title="Conectando..."></div>
        `;
        
        // Insertar antes del botón de eliminar proyecto
        const deleteBtn = document.getElementById('delete-project-btn');
        if (deleteBtn) {
            header.insertBefore(statusContainer, deleteBtn);
        }
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
