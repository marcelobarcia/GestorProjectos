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
    
    // Remover listeners previos si existen
    if (handleNewProject && newProjectBtn) {
        newProjectBtn.removeEventListener('click', handleNewProject);
    }
    if (handleNewProject && createFirstProjectBtn) {
        createFirstProjectBtn.removeEventListener('click', handleNewProject);
    }
    
    // Project menu handling
    projectMenuBtn.addEventListener('click', () => projectMenu.classList.toggle('hidden'));
    document.addEventListener('click', (e) => { 
        if (!projectMenuBtn.contains(e.target) && !projectMenu.contains(e.target)) { 
            projectMenu.classList.add('hidden'); 
        } 
    });
    
    // Project management
    handleNewProject = async () => {
        console.log('🆕 Creating new project...');
        const name = await window.modalManager.prompt('Nombre del nuevo proyecto:', 'Nuevo Proyecto', 'Crear Nuevo Proyecto');
        if (name) { 
            console.log('📝 Project name entered:', name);
            await createProject(name); 
            // render() ya se llama desde createProject()
        }
        projectMenu.classList.add('hidden');
    };
    
    // Agregar listeners de forma segura
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', handleNewProject);
    }
    if (createFirstProjectBtn) {
        createFirstProjectBtn.addEventListener('click', handleNewProject);
    }
    
    deleteProjectBtn.addEventListener('click', async () => {
        const project = getActiveProject();
        if (project) {
            const confirmed = await window.modalManager.confirm(
                `¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`,
                'Eliminar Proyecto'
            );
            if (confirmed === 'confirm') {
                await deleteProject(project.id);
                render();
            }
        }
    });
    
    projectNameInput.addEventListener('change', async (e) => {
        const project = getActiveProject();
        if (project) { 
            project.name = e.target.value; 
            await updateProject(project);
            renderProjectUI(project); 
        }
    });

    // Settings toggles
    workWeekendsToggle.addEventListener('change', (e) => {
        const project = getActiveProject(); 
        if(project) { 
            project.workWeekends = e.target.checked; 
            render(); 
        }
    });

    criticalPathToggle.addEventListener('change', (e) => {
        const project = getActiveProject(); 
        if(project) { 
            project.showCriticalPath = e.target.checked; 
            render(); 
        }
    });

    // Baseline management
    saveBaselineBtn.addEventListener('click', async () => {
        const project = getActiveProject(); 
        if(!project) return;
        
        const name = await window.modalManager.prompt(
            "Nombre para la nueva Línea Base:", 
            `Línea Base - ${new Date().toLocaleDateString()}`,
            'Crear Línea Base'
        );
        
        if (name) {
            console.log('💾 Creating new baseline:', name);
            console.log('Tasks to save:', project.tasks.length);
            
            // Crear la nueva línea base con las tareas actuales
            const newBaseline = { 
                id: Date.now(), 
                name: name, 
                tasks: JSON.parse(JSON.stringify(project.tasks)),
                createdAt: new Date().toISOString()
            };
            
            project.baselines.push(newBaseline);
            
            // Si es la primera línea base y no hay estado actual guardado, guardarlo
            if (project.baselines.length === 1 && !project.currentStateTasks) {
                project.currentStateTasks = JSON.parse(JSON.stringify(project.tasks));
                console.log('📋 Saved current state as backup');
            }
            
            showNotification(`Línea base "${name}" creada exitosamente`, 'success');
            render();
        }
    });

    baselineSelect.addEventListener('change', (e) => {
        const project = getActiveProject(); 
        if(project) { 
            const selectedBaselineId = e.target.value ? parseInt(e.target.value) : null;
            
            if (selectedBaselineId) {
                // Restaurar tareas de la línea base seleccionada
                const selectedBaseline = project.baselines.find(b => b.id === selectedBaselineId);
                if (selectedBaseline) {
                    console.log('📦 Restoring tasks from baseline:', selectedBaseline.name);
                    console.log('Previous tasks count:', project.tasks.length);
                    
                    // Guardar las tareas actuales como una línea base temporal si no hay ninguna seleccionada
                    if (!project.selectedBaselineId) {
                        console.log('💾 Saving current state as temporary baseline');
                        project.currentStateTasks = JSON.parse(JSON.stringify(project.tasks));
                    }
                    
                    // Restaurar las tareas de la línea base
                    project.tasks = JSON.parse(JSON.stringify(selectedBaseline.tasks));
                    project.selectedBaselineId = selectedBaselineId;
                    
                    console.log('New tasks count:', project.tasks.length);
                    showNotification(`Línea base "${selectedBaseline.name}" restaurada (${selectedBaseline.tasks.length} tareas)`, 'success');
                }
            } else {
                // Restaurar al estado actual si existe
                if (project.currentStateTasks) {
                    console.log('🔄 Restoring to current state');
                    project.tasks = JSON.parse(JSON.stringify(project.currentStateTasks));
                    delete project.currentStateTasks;
                    showNotification('Restaurado al estado actual', 'info');
                }
                project.selectedBaselineId = null;
            }
            
            render(); 
        }
    });

    baselineListContainer.addEventListener('click', async (e) => {
        const btn = e.target.closest('.delete-baseline-btn');
        const project = getActiveProject();
        if (btn && project) {
            const baselineId = parseInt(btn.dataset.id);
            const baseline = project.baselines.find(b => b.id === baselineId);
            
            if (baseline) {
                const confirmed = await window.modalManager.confirm(
                    `¿Estás seguro de que quieres eliminar la línea base "${baseline.name}"?`,
                    'Eliminar Línea Base'
                );
                
                if (confirmed === 'confirm') {
                    console.log('🗑️ Deleting baseline:', baseline.name);
                    
                    // Si estamos viendo la línea base que se va a eliminar, restaurar al estado actual
                    if (project.selectedBaselineId === baselineId) {
                        if (project.currentStateTasks) {
                            project.tasks = JSON.parse(JSON.stringify(project.currentStateTasks));
                            showNotification('Restaurado al estado actual', 'info');
                        }
                        project.selectedBaselineId = null;
                    }
                    
                    // Eliminar la línea base
                    project.baselines = project.baselines.filter(b => b.id !== baselineId);
                    
                    showNotification(`Línea base "${baseline.name}" eliminada`, 'info');
                    render();
                }
            }
        }
    });

    // Resource management
    addResourceForm.addEventListener('submit', e => {
        e.preventDefault();
        const project = getActiveProject();
        if(!project) return;
        project.resources.push({
            id: Date.now(),
            name: document.getElementById('resource-name').value,
            role: document.getElementById('resource-role').value
        });
        addResourceForm.reset();
        render();
    });

    resourceListContainer.addEventListener('click', e => {
        const btn = e.target.closest('.delete-resource-btn');
        const project = getActiveProject();
        if(btn && project) {
            project.resources = project.resources.filter(r => r.id !== parseInt(btn.dataset.id));
            render();
        }
    });

    // Holiday management
    addHolidayForm.addEventListener('submit', e => {
        e.preventDefault();
        const project = getActiveProject();
        if(!project) return;
        project.holidays.push({
            date: document.getElementById('holiday-date').value,
            name: document.getElementById('holiday-name').value
        });
        addHolidayForm.reset();
        render();
    });

    holidayListContainer.addEventListener('click', e => {
        const btn = e.target.closest('.delete-holiday-btn');
        const project = getActiveProject();
        if(btn && project) {
            project.holidays = project.holidays.filter(h => h.date !== btn.dataset.date);
            render();
        }
    });
    
    // Form setup
    setupFormListeners(taskForm);
    setupFormListeners(editTaskForm);

    // Task form submission
    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const project = getActiveProject();
        if(!project) return;
        const type = document.getElementById('task-type').value;
        const isMilestone = type === 'task' ? document.getElementById('task-milestone').checked : false;
        project.tasks.push({
            id: Date.now(),
            name: document.getElementById('task-name').value,
            resourceId: isMilestone ? null : (parseInt(document.getElementById('task-resource').value) || null),
            predecessorId: isMilestone ? null : (type === 'task' ? (parseInt(document.getElementById('task-predecessor').value) || null) : null),
            start: document.getElementById('task-start').value,
            duration: parseInt(document.getElementById('task-duration').value),
            end: document.getElementById('task-end').value,
            type: type,
            status: isMilestone ? 'Completada' : (type === 'task' ? document.getElementById('task-status').value : null),
            progress: isMilestone ? 100 : (type === 'task' ? parseInt(document.getElementById('task-progress').value) : 100),
            isMilestone: isMilestone,
        });
        taskForm.reset();
        render();
    });

    // Edit task form submission
    editTaskForm.addEventListener('submit', e => {
        e.preventDefault();
        const project = getActiveProject();
        if(!project) return;
        const id = parseInt(document.getElementById('edit-task-id').value);
        const taskIndex = project.tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) return;
        
        const type = document.getElementById('edit-task-type').value;
        const isMilestone = type === 'task' ? document.getElementById('edit-task-milestone').checked : false;

        project.tasks[taskIndex] = {
            ...project.tasks[taskIndex],
            name: document.getElementById('edit-task-name').value,
            resourceId: isMilestone ? null : (parseInt(document.getElementById('edit-task-resource').value) || null),
            predecessorId: isMilestone ? null : (type === 'task' ? (parseInt(document.getElementById('edit-task-predecessor').value) || null) : null),
            start: document.getElementById('edit-task-start').value,
            duration: parseInt(document.getElementById('edit-task-duration').value),
            end: document.getElementById('edit-task-end').value,
            type: type,
            status: isMilestone ? 'Completada' : (type === 'task' ? document.getElementById('edit-task-status').value : null),
            progress: isMilestone ? 100 : (type === 'task' ? parseInt(document.getElementById('edit-task-progress').value) : 100),
            isMilestone: isMilestone,
        };
        editModal.classList.add('hidden');
        render();
    });

    // Task list interactions
    ganttTaskList.addEventListener('click', async (e) => {
        const project = getActiveProject();
        if(!project) return;
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        if(editBtn) {
            openEditModal(parseInt(editBtn.dataset.id));
        }
        if(deleteBtn) {
            const confirmed = await window.modalManager.confirm(
                '¿Estás seguro de que quieres eliminar esta tarea?',
                'Eliminar Tarea'
            );
            if(confirmed === 'confirm') {
                project.tasks = project.tasks.filter(t => t.id !== parseInt(deleteBtn.dataset.id));
                render();
            }
        }
    });
    
    cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));

    // View switchers
    ganttViewSwitcher.addEventListener('click', e => {
        const btn = e.target.closest('.view-btn');
        const project = getActiveProject();
        if(btn && project) {
            project.currentGanttView = btn.dataset.view;
            render();
        }
    });

    mainViewSwitcher.addEventListener('click', e => {
        const btn = e.target.closest('.main-view-btn');
        if(btn) {
            document.querySelectorAll('.main-view-btn').forEach(b => {
                b.classList.remove('border-blue-600', 'text-blue-600');
                b.classList.add('border-transparent', 'text-slate-500');
            });
            btn.classList.add('border-blue-600', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-slate-500');

            ganttView.classList.add('hidden');
            dashboardView.classList.add('hidden');
            calendarView.classList.add('hidden');
            document.getElementById(`${btn.dataset.view}-view`).classList.remove('hidden');
        }
    });
    
    eventListenersSetup = true;
    console.log('✅ Event listeners setup completed');
}

// Exponer funciones globalmente
window.setupEventListeners = setupEventListeners;
window.resetEventListeners = resetEventListeners;
