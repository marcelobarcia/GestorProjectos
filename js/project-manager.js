// Project Management functions
function getActiveProject() {
    if (!window.activeProjectId && window.projects && window.projects.length > 0) {
        window.activeProjectId = window.projects[0].id;
    }
    return window.projects ? window.projects.find(p => p.id === window.activeProjectId) : null;
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

    window.projects.push(newProject);
    window.activeProjectId = newProject.id;
    
    console.log('✅ Project created:', newProject.name, 'ID:', newProject.id);
    console.log('🎯 Active project set to:', window.activeProjectId);
    
    // Guardar en Firebase
    await saveProjectsToFirebase();
    
    // Re-renderizar para actualizar la UI
    if (typeof window.render === 'function') {
        console.log('🔄 Calling render() after project creation');
        window.render();
    } else {
        console.warn('⚠️ render function not available');
    }
    
    showNotification('Proyecto creado exitosamente', 'success');
    
    return newProject;
}

async function deleteProject(projectId) {
    const project = window.projects.find(p => p.id === projectId);
    if (!project) return false;
    
    // Eliminar de la lista local
    window.projects = window.projects.filter(p => p.id !== projectId);
    
    // Eliminar de Firebase
    await window.firebaseManager.deleteProject(projectId);
    await saveProjectsToFirebase();
    
    // Ajustar proyecto activo
    if (window.activeProjectId === projectId) {
        window.activeProjectId = window.projects.length > 0 ? window.projects[0].id : null;
    }
    
    // Re-renderizar para actualizar la UI
    if (typeof render === 'function') {
        render();
    }
    
    showNotification(`Proyecto "${project.name}" eliminado`, 'info');
    return true;
}

async function updateProject(project) {
    project.lastModified = new Date().toISOString();
    
    // Actualizar en la lista local
    const index = window.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
        window.projects[index] = project;
    }
    
    // Guardar en Firebase
    await saveProjectsToFirebase();
    
    // Auto-backup cada 10 cambios (opcional)
    if (Math.random() < 0.1) { // 10% de probabilidad
        await window.firebaseManager.createBackup();
    }
}

async function saveProjectsToFirebase() {
    try {
        const success = await window.firebaseManager.saveProjects(window.projects);
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
        const loadedProjects = await window.firebaseManager.loadProjects();
        
        if (loadedProjects && loadedProjects.length > 0) {
            console.log('📦 Loaded projects from Firebase:', loadedProjects.length);
            window.projects = loadedProjects;
            if (!window.activeProjectId && window.projects.length > 0) {
                window.activeProjectId = window.projects[0].id;
            }
            updateConnectionStatus(true);
            showNotification('Proyectos cargados desde Firebase', 'success');
            return true;
        } else {
            // Si no hay proyectos en Firebase para este usuario, limpiar estado
            console.log('📝 No projects in Firebase for this user');
            window.projects = []; // Limpiar proyectos existentes
            window.activeProjectId = null;
            
            updateConnectionStatus(true);
            // NO crear proyecto demo aquí - dejar que initializeApp() lo haga
            return false;
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

// Exponer funciones globalmente
window.getActiveProject = getActiveProject;
window.createProject = createProject;
window.deleteProject = deleteProject;
window.updateProject = updateProject;
window.saveProjectsToFirebase = saveProjectsToFirebase;
window.loadProjectsFromFirebase = loadProjectsFromFirebase;
window.updateConnectionStatus = updateConnectionStatus;
window.showNotification = showNotification;
