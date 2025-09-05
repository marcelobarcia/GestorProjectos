// Event Listeners
function setupEventListeners() {
    // Project menu handling
    projectMenuBtn.addEventListener('click', () => projectMenu.classList.toggle('hidden'));
    document.addEventListener('click', (e) => { 
        if (!projectMenuBtn.contains(e.target) && !projectMenu.contains(e.target)) { 
            projectMenu.classList.add('hidden'); 
        } 
    });
    
    // Project management
    const handleNewProject = async () => {
        const name = prompt('Nombre del nuevo proyecto:', 'Nuevo Proyecto');
        if (name) { 
            await createProject(name); 
            render(); 
        }
        projectMenu.classList.add('hidden');
    };
    newProjectBtn.addEventListener('click', handleNewProject);
    createFirstProjectBtn.addEventListener('click', handleNewProject);
    
    deleteProjectBtn.addEventListener('click', async () => {
        const project = getActiveProject();
        if (project && confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
            await deleteProject(project.id);
            render();
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
    saveBaselineBtn.addEventListener('click', () => {
        const project = getActiveProject(); 
        if(!project) return;
        const name = prompt("Nombre para la nueva Línea Base:", `Línea Base - ${new Date().toLocaleDateString()}`);
        if (name) {
            project.baselines.push({ 
                id: Date.now(), 
                name: name, 
                tasks: JSON.parse(JSON.stringify(project.tasks)) 
            });
            render();
        }
    });

    baselineSelect.addEventListener('change', (e) => {
        const project = getActiveProject(); 
        if(project) { 
            project.selectedBaselineId = e.target.value ? parseInt(e.target.value) : null; 
            render(); 
        }
    });

    baselineListContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-baseline-btn');
        const project = getActiveProject();
        if (btn && project) {
            project.baselines = project.baselines.filter(b => b.id !== parseInt(btn.dataset.id));
            if (project.selectedBaselineId === parseInt(btn.dataset.id)) {
                project.selectedBaselineId = null;
            }
            render();
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
    ganttTaskList.addEventListener('click', (e) => {
        const project = getActiveProject();
        if(!project) return;
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        if(editBtn) {
            openEditModal(parseInt(editBtn.dataset.id));
        }
        if(deleteBtn) {
            if(confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
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
}
