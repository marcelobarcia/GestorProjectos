// Dashboard Rendering functions
function renderDashboard(project) {
    const tasks = project.tasks.filter(t => t.type === 'task' && !t.isMilestone);
    const totalTasks = tasks.length;
    
    if (totalTasks === 0) {
        // Reset dashboard if no tasks
        document.getElementById('kpi-progress-text').textContent = '0%';
        document.getElementById('kpi-progress-circle').style.strokeDasharray = '0, 100';
        ['completed', 'overdue', 'inprogress', 'pending'].forEach(s => 
            document.getElementById(`kpi-tasks-${s}`).textContent = '0'
        );
        document.getElementById('kpi-duration').textContent = '0';
        document.getElementById('kpi-days-remaining').textContent = '0';
        document.getElementById('kpi-end-date').textContent = '-';
        document.getElementById('kpi-resource-workload').innerHTML = '';
        return;
    }

    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const overallProgress = Math.round(totalProgress / totalTasks);
    document.getElementById('kpi-progress-text').textContent = `${overallProgress}%`;
    document.getElementById('kpi-progress-circle').style.strokeDasharray = `${overallProgress}, 100`;

    const taskStates = tasks.reduce((acc, task) => {
        if (task.status === 'Completada') acc.completed++;
        else if (task.status === 'Atrasada') acc.overdue++;
        else if (task.status === 'En Progreso') acc.inprogress++;
        else acc.pending++;
        return acc;
    }, { completed: 0, overdue: 0, inprogress: 0, pending: 0 });

    document.getElementById('kpi-tasks-completed').textContent = taskStates.completed;
    document.getElementById('kpi-tasks-overdue').textContent = taskStates.overdue;
    document.getElementById('kpi-tasks-inprogress').textContent = taskStates.inprogress;
    document.getElementById('kpi-tasks-pending').textContent = taskStates.pending;

    // Calcular fechas del proyecto de forma segura
    const tasksWithValidDates = project.tasks.filter(t => 
        (t.start || t.startDate) && (t.end || t.endDate || t.duration)
    );
    
    if (tasksWithValidDates.length > 0) {
        const startDates = tasksWithValidDates.map(t => {
            const startStr = t.start || t.startDate;
            return startStr ? parseDate(startStr) : new Date();
        }).filter(date => !isNaN(date.getTime()));
        
        const endDates = tasksWithValidDates.map(t => {
            const endStr = t.end || t.endDate;
            if (endStr) {
                return parseDate(endStr);
            } else if (t.start || t.startDate) {
                // Calcular end date basado en start + duration
                const start = parseDate(t.start || t.startDate);
                const duration = parseInt(t.duration) || 1;
                const end = new Date(start);
                end.setDate(start.getDate() + duration - 1);
                return end;
            }
            return new Date();
        }).filter(date => !isNaN(date.getTime()));
        
        if (startDates.length > 0 && endDates.length > 0) {
            const projectStartDate = new Date(Math.min(...startDates));
            const projectEndDate = new Date(Math.max(...endDates));
            const duration = Math.ceil((projectEndDate - projectStartDate) / (1000 * 3600 * 24));
            const daysRemaining = Math.ceil((projectEndDate - new Date()) / (1000 * 3600 * 24));
            
            document.getElementById('kpi-duration').textContent = duration;
            document.getElementById('kpi-days-remaining').textContent = daysRemaining > 0 ? daysRemaining : 0;
            document.getElementById('kpi-end-date').textContent = projectEndDate.toLocaleDateString();
        } else {
            // No hay fechas válidas
            document.getElementById('kpi-duration').textContent = '0';
            document.getElementById('kpi-days-remaining').textContent = '0';
            document.getElementById('kpi-end-date').textContent = 'Sin definir';
        }
    } else {
        // No hay tareas con fechas válidas
        document.getElementById('kpi-duration').textContent = '0';
        document.getElementById('kpi-days-remaining').textContent = '0';
        document.getElementById('kpi-end-date').textContent = 'Sin definir';
    }

    const workload = project.resources.map(res => ({
        name: res.name,
        count: project.tasks.filter(t => t.resourceId === res.id).length
    }));
    
    const workloadContainer = document.getElementById('kpi-resource-workload');
    workloadContainer.innerHTML = '';
    workload.forEach(w => {
        workloadContainer.innerHTML += `<div class="flex justify-between items-center"><p>${w.name}</p><p class="font-bold">${w.count} tareas</p></div>`;
    });
}

// Exponer función globalmente
window.renderDashboard = renderDashboard;
