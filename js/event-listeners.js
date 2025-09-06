// Event Listeners
let eventListenersSetup = false; // Flag para evitar duplicación
let handleNewProject; // Función global para poder removerla

function resetEventListeners() {
    console.log('🔄 Resetting event listeners flag...');
    eventListenersSetup = false;
}

function setupEventListeners() {
    if (eventListenersSetup) {
        console.log('📌 Event listeners already setup, skipping...');
        return;
    }
    
    console.log('🔗 Setting up event listeners...');

    // Nuevo proyecto - con prevención de duplicación
    handleNewProject = async (e) => {
        e.preventDefault();
        console.log('🆕 Creating new project...');
        
        const name = await window.modalManager.prompt('Nombre del nuevo proyecto:', '', 'Crear Proyecto');
        
        if (name && name.trim()) {
            await window.createProject(name.trim());
            if (window.updateProjectDropdown) window.updateProjectDropdown();
        }
    };

    if (window.newProjectBtn) {
        // Remover listener anterior si existe
        window.newProjectBtn.removeEventListener('click', handleNewProject);
        // Agregar nuevo listener
        window.newProjectBtn.addEventListener('click', handleNewProject);
    }

    // Settings toggles
    if (window.workWeekendsToggle) {
        window.workWeekendsToggle.addEventListener('change', (e) => {
            const project = window.getActiveProject ? window.getActiveProject() : null; 
            if(project) { 
                project.workWeekends = e.target.checked; 
                if (window.render) window.render(); 
            }
        });
    }

    if (window.criticalPathToggle) {
        window.criticalPathToggle.addEventListener('change', (e) => {
            const project = window.getActiveProject ? window.getActiveProject() : null; 
            if(project) { 
                project.showCriticalPath = e.target.checked; 
                if (window.render) window.render(); 
            }
        });
    }

    // Baseline management
    if (window.saveBaselineBtn) {
        window.saveBaselineBtn.addEventListener('click', async () => {
            const project = window.getActiveProject ? window.getActiveProject() : null; 
            if(!project) return;
            
            const name = await window.modalManager.prompt(
                "Nombre para la nueva Línea Base:", 
                `Línea Base - ${new Date().toLocaleDateString()}`,
                'Crear Línea Base'
            );
            
            if(!name || !name.trim()) return;
            
            const newBaseline = { 
                id: Date.now(), 
                name: name, 
                tasks: JSON.parse(JSON.stringify(project.tasks)),
                createdAt: new Date().toISOString()
            };
            
            project.baselines.push(newBaseline);
            
            if (project.baselines.length === 1 && !project.currentStateTasks) {
                project.currentStateTasks = JSON.parse(JSON.stringify(project.tasks));
                console.log('📋 Saved current state as backup');
            }
            
            window.showNotification(`Línea base "${name}" creada exitosamente`, 'success');
            if (window.render) window.render();
        });
    }

    // Baseline selection change
    if (window.baselineSelect) {
        window.baselineSelect.addEventListener('change', (e) => {
            const project = window.getActiveProject ? window.getActiveProject() : null;
            if (project) {
                project.selectedBaselineId = e.target.value ? parseInt(e.target.value) : null;
                console.log('📊 Selected baseline changed to:', project.selectedBaselineId);
                
                // Actualizar el proyecto y guardar
                if (window.updateProject) {
                    window.updateProject(project);
                }
                
                // Re-renderizar completamente para actualizar el gráfico
                if (window.render) {
                    console.log('🔄 Re-rendering Gantt chart with new baseline...');
                    window.render();
                }
            }
        });
    }

    // Baseline deletion
    if (window.baselineListContainer) {
        window.baselineListContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-baseline-btn');
            const project = window.getActiveProject ? window.getActiveProject() : null;
            if (btn && project) {
                const baselineId = parseInt(btn.dataset.id);
                const baseline = project.baselines.find(b => b.id === baselineId);
                
                if (baseline && window.modalManager) {
                    window.modalManager.confirm(
                        `¿Eliminar la línea base "${baseline.name}"?`,
                        'Esta acción no se puede deshacer.',
                        'Eliminar'
                    ).then(confirmed => {
                        if (confirmed) {
                            project.baselines = project.baselines.filter(b => b.id !== baselineId);
                            if (project.selectedBaselineId === baselineId) {
                                project.selectedBaselineId = null;
                            }
                            
                            if (window.updateProject) {
                                window.updateProject(project);
                            }
                            
                            if (window.render) window.render();
                            window.showNotification('Línea base eliminada', 'info');
                        }
                    });
                }
            }
        });
    }

    // Resource management
    if (window.addResourceForm) {
        window.addResourceForm.addEventListener('submit', e => {
            e.preventDefault();
            const project = window.getActiveProject ? window.getActiveProject() : null;
            if(!project) return;
            
            project.resources.push({
                id: Date.now(),
                name: document.getElementById('resource-name').value,
                role: document.getElementById('resource-role').value
            });
            
            window.addResourceForm.reset();
            if (window.render) window.render();
        });
    }

    // Task form
    if (window.taskForm) {
        window.taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const project = window.getActiveProject ? window.getActiveProject() : null;
            if (!project) return;

            const task = {
                id: Date.now(),
                name: document.getElementById('task-name').value,
                start: document.getElementById('task-start').value,
                duration: parseInt(document.getElementById('task-duration').value),
                type: document.getElementById('task-type').value,
                status: 'Pendiente',
                progress: 0,
                resourceId: parseInt(document.getElementById('task-resource').value) || null,
                predecessorId: parseInt(document.getElementById('task-predecessor').value) || null,
                isMilestone: document.getElementById('task-type').value === 'milestone'
            };

            task.end = window.addBusinessDays ? window.addBusinessDays(task.start, task.duration, project) : task.start;
            project.tasks.push(task);
            
            window.taskForm.reset();
            if (window.render) window.render();
        });
    }

    // View switchers
    if (window.mainViewSwitcher) {
        window.mainViewSwitcher.addEventListener('click', e => {
            const btn = e.target.closest('.main-view-btn');
            if(btn) {
                document.querySelectorAll('.main-view-btn').forEach(b => {
                    b.classList.remove('bg-blue-600', 'text-white');
                    b.classList.add('bg-white', 'text-blue-600');
                });
                btn.classList.remove('bg-white', 'text-blue-600');
                btn.classList.add('bg-blue-600', 'text-white');
                
                if (window.ganttView) window.ganttView.classList.add('hidden');
                if (window.dashboardView) window.dashboardView.classList.add('hidden');
                if (window.calendarView) window.calendarView.classList.add('hidden');
                
                const targetView = document.getElementById(`${btn.dataset.view}-view`);
                if (targetView) targetView.classList.remove('hidden');
            }
        });
    }
    
    eventListenersSetup = true;
    console.log('✅ Event listeners setup completed');
}

// Exponer funciones globalmente
window.setupEventListeners = setupEventListeners;
window.resetEventListeners = resetEventListeners;
