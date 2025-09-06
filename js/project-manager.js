// Project Management functions
function getActiveProject() {
    if (!activeProjectId && projects.length > 0) {
        activeProjectId = projects[0].id;
    }
    return projects.find(p => p.id === activeProjectId);
}

async function createProject(name, isDefault = false) {
    const defaultResources = [
        { id: 1, name: 'Jefe de Proyecto', role: 'Management' },
        { id: 2, name: 'Analista', role: 'Análisis' },
        { id: 3, name: 'Diseñador', role: 'Diseño' },
        { id: 4, name: 'Desarrollador', role: 'Desarrollo' }
    ];

    const defaultTasks = isDefault ? [
        { id: 1, name: 'Fase 1: Planificación', start: '2025-09-01', duration: 10, resourceId: 1, type: 'phase', progress: 100, status: null, predecessorId: null, isMilestone: false },
        { id: 2, name: 'Definir Requisitos', start: '2025-09-02', duration: 4, resourceId: 2, type: 'task', progress: 100, status: 'Completada', predecessorId: null, isMilestone: false },
        { id: 3, name: 'Kick-off Meeting', start: '2025-09-01', duration: 1, resourceId: 1, type: 'task', progress: 100, status: 'Completada', predecessorId: null, isMilestone: true },
        { id: 4, name: 'Fase 2: Desarrollo', start: '2025-09-15', duration: 30, resourceId: 1, type: 'phase', progress: 0, status: null, predecessorId: null, isMilestone: false },
        { id: 5, name: 'Desarrollo Backend', start: '2025-09-08', duration: 15, resourceId: 4, type: 'task', progress: 25, status: 'Atrasada', predecessorId: 2, isMilestone: false },
        { id: 6, name: 'Desarrollo Frontend', start: '2025-09-22', duration: 20, resourceId: 4, type: 'task', progress: 0, status: 'Pendiente', predecessorId: 5, isMilestone: false },
        { id: 7, name: 'Entrega Final', start: '2025-10-24', duration: 1, resourceId: 1, type: 'task', progress: 0, status: 'Pendiente', predecessorId: 6, isMilestone: true },
    ] : [];

    const newProject = {
        id: Date.now(),
        name: name,
        tasks: defaultTasks,
        resources: defaultResources,
        holidays: [],
        baselines: [],
        workWeekends: false,
        showCriticalPath: false,
        selectedBaselineId: null,
        currentGanttView: 'day',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };

    projects.push(newProject);
    activeProjectId = newProject.id;
    
    // Guardar en Firebase
    await saveProjectsToFirebase();
    
    showNotification('Proyecto creado exitosamente', 'success');
}

async function deleteProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    
    // Eliminar de la lista local
    projects = projects.filter(p => p.id !== projectId);
    
    // Eliminar de Firebase
    await firebaseManager.deleteProject(projectId);
    await saveProjectsToFirebase();
    
    // Ajustar proyecto activo
    if (activeProjectId === projectId) {
        activeProjectId = projects.length > 0 ? projects[0].id : null;
    }
    
    showNotification(`Proyecto "${project.name}" eliminado`, 'info');
    return true;
}

async function updateProject(project) {
    project.lastModified = new Date().toISOString();
    
    // Actualizar en la lista local
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
        projects[index] = project;
    }
    
    // Guardar en Firebase
    await saveProjectsToFirebase();
    
    // Auto-backup cada 10 cambios (opcional)
    if (Math.random() < 0.1) { // 10% de probabilidad
        await firebaseManager.createBackup();
    }
}

async function saveProjectsToFirebase() {
    try {
        const success = await firebaseManager.saveProjects(projects);
        if (success) {
            updateConnectionStatus(true);
        } else {
            updateConnectionStatus(false, 'Error al guardar en Firebase');
        }
        return success;
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        updateConnectionStatus(false, error.message);
        return false;
    }
}

async function loadProjectsFromFirebase() {
    try {
        showNotification('Cargando proyectos desde Firebase...', 'info');
        const loadedProjects = await firebaseManager.loadProjects();
        
        if (loadedProjects && loadedProjects.length > 0) {
            console.log('📦 Loaded projects from Firebase:', loadedProjects.length);
            projects = loadedProjects;
            if (!activeProjectId && projects.length > 0) {
                activeProjectId = projects[0].id;
            }
            updateConnectionStatus(true);
            showNotification('Proyectos cargados desde Firebase', 'success');
            return true;
        } else {
            // Si no hay proyectos en Firebase para este usuario, crear proyecto demo
            console.log('🆕 No projects in Firebase for this user, creating demo project');
            projects = []; // Limpiar proyectos existentes
            activeProjectId = null;
            
            // Crear proyecto demo automáticamente para usuarios nuevos
            const demoProject = await createProject('Proyecto Demo', true);
            
            updateConnectionStatus(true);
            showNotification('Proyecto demo creado para nuevo usuario', 'success');
            return true;
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        updateConnectionStatus(false, error.message);
        showNotification('Error al cargar desde Firebase. Usando datos locales.', 'warning');
        return false;
    }
}

function updateConnectionStatus(connected, errorMessage = '') {
    const statusIndicator = document.getElementById('firebase-status');
    if (statusIndicator) {
        if (connected) {
            statusIndicator.className = 'w-3 h-3 bg-green-500 rounded-full';
            statusIndicator.title = 'Conectado a Firebase';
        } else {
            statusIndicator.className = 'w-3 h-3 bg-red-500 rounded-full';
            statusIndicator.title = `Error: ${errorMessage}`;
        }
    }
}

function showNotification(message, type = 'info') {
    // Usar el modal manager si está disponible para notificaciones críticas
    if (window.modalManager && (type === 'error' || type === 'warning')) {
        switch(type) {
            case 'error':
                return window.modalManager.error(message);
            case 'warning':
                return window.modalManager.warning(message);
        }
    }
    
    // Para info y success, usar el sistema de toast actual (más discreto)
    const notification = document.createElement('div');
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type];
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Animar salida y eliminar
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
