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

    const projectStartDate = new Date(Math.min(...project.tasks.map(t => parseDate(t.start))));
    const projectEndDate = new Date(Math.max(...project.tasks.map(t => parseDate(t.end))));
    const duration = Math.ceil((projectEndDate - projectStartDate) / (1000 * 3600 * 24));
    const daysRemaining = Math.ceil((projectEndDate - new Date()) / (1000 * 3600 * 24));
    
    document.getElementById('kpi-duration').textContent = duration;
    document.getElementById('kpi-days-remaining').textContent = daysRemaining > 0 ? daysRemaining : 0;
    document.getElementById('kpi-end-date').textContent = projectEndDate.toLocaleDateString();

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
