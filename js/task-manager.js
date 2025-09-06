// Task Management functions
function addTask(project, taskData) {
    if (!project || !taskData) return null;
    
    const newTask = {
        id: Date.now(),
        name: taskData.name || 'Nueva Tarea',
        start: taskData.start || window.formatDateForInput(new Date()),
        duration: parseInt(taskData.duration) || 1,
        resourceId: parseInt(taskData.resourceId) || null,
        type: taskData.type || 'task',
        progress: parseInt(taskData.progress) || 0,
        status: taskData.status || 'Pendiente',
        predecessorId: parseInt(taskData.predecessorId) || null,
        isMilestone: taskData.isMilestone || false
    };
    
    // Calcular fecha de fin
    if (window.calculateEndDate) {
        newTask.end = window.calculateEndDate(newTask.start, newTask.duration);
    }
    
    project.tasks.push(newTask);
    
    // Actualizar proyecto
    if (window.updateProject) {
        window.updateProject(project);
    }
    
    console.log('✅ Task added:', newTask.name);
    return newTask;
}

function updateTask(project, taskId, updates) {
    if (!project || !taskId) return false;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    
    const task = project.tasks[taskIndex];
    
    // Aplicar actualizaciones
    Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
            task[key] = updates[key];
        }
    });
    
    // Recalcular fecha de fin si se cambió el inicio o duración
    if (updates.start || updates.duration) {
        if (window.calculateEndDate) {
            task.end = window.calculateEndDate(task.start, task.duration);
        }
    }
    
    project.tasks[taskIndex] = task;
    
    // Actualizar proyecto
    if (window.updateProject) {
        window.updateProject(project);
    }
    
    console.log('✅ Task updated:', task.name);
    return true;
}

function deleteTask(project, taskId) {
    if (!project || !taskId) return false;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;
    
    const task = project.tasks[taskIndex];
    project.tasks.splice(taskIndex, 1);
    
    // Actualizar proyecto
    if (window.updateProject) {
        window.updateProject(project);
    }
    
    console.log('✅ Task deleted:', task.name);
    return true;
}

function getTaskById(project, taskId) {
    if (!project || !taskId) return null;
    return project.tasks.find(t => t.id === taskId) || null;
}

function moveTask(project, taskId, newStartDate) {
    if (!project || !taskId || !newStartDate) return false;
    
    const task = getTaskById(project, taskId);
    if (!task) return false;
    
    const oldStart = task.start;
    task.start = newStartDate;
    
    // Recalcular fecha de fin
    if (window.calculateEndDate) {
        task.end = window.calculateEndDate(task.start, task.duration);
    }
    
    // Actualizar proyecto
    if (window.updateProject) {
        window.updateProject(project);
    }
    
    console.log(`✅ Task moved: ${task.name} from ${oldStart} to ${newStartDate}`);
    return true;
}

// Exponer funciones globalmente
window.addTask = addTask;
window.updateTask = updateTask;
window.deleteTask = deleteTask;
window.getTaskById = getTaskById;
window.moveTask = moveTask;
