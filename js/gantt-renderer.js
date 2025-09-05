// Gantt Chart Rendering functions
function renderGantt(project) {
    renderTaskList(project);
    
    if (project.tasks.length === 0) {
        ganttTaskList.innerHTML = '<p class="p-4 text-slate-500">No hay tareas.</p>';
        ganttHeaderTimeline.innerHTML = '';
        ganttChartArea.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 italic">Añade tareas para ver el diagrama de Gantt</div>';
        renderGanttInfo(project); // Actualizar info panel incluso sin tareas
        return;
    }
    
    const projectStartDate = project.tasks.reduce((min, t) => (parseDate(t.start) < min ? parseDate(t.start) : min), parseDate(project.tasks[0].start));
    const projectEndDate = project.tasks.reduce((max, t) => (parseDate(t.end) > max ? parseDate(t.end) : max), parseDate(project.tasks[0].end));
    const { totalWidth, timelineStartDate, timelineEndDate } = renderTimeline(projectStartDate, projectEndDate, project);
    renderChart(timelineStartDate, timelineEndDate, totalWidth, project);
    renderGanttInfo(project); // Actualizar panel de información
}

function renderTaskList(project) {
    const rowHeight = 64;
    ganttTaskList.innerHTML = '';
    
    project.tasks.forEach(task => {
        const resource = project.resources.find(r => r.id === task.resourceId);
        const el = document.createElement('div');
        el.className = `p-3 flex items-center justify-between border-b border-slate-200 text-sm ${task.type === 'phase' ? 'font-bold bg-slate-50' : ''}`;
        el.style.height = `${rowHeight}px`;

        const statusColor = task.type === 'phase' ? STATUS_COLORS.Fase : STATUS_COLORS[task.status];
        const iconHtml = task.isMilestone
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`
            : `<span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${statusColor || '#64748b'}"></span>`;

        const subtext = task.isMilestone
            ? `<p class="text-xs text-slate-500 truncate pl-7">${formatDate(parseDate(task.start))}</p>`
            : `<p class="text-xs text-slate-500 truncate pl-7">${resource ? resource.name : (task.type === 'task' ? 'Sin asignar' : '')} ${task.type === 'task' ? `(${task.progress}%)` : ''}</p>`;

        el.innerHTML = `<div><div class="flex items-center gap-2">${iconHtml}<p class="truncate">${task.name}</p></div>${subtext}</div><div class="flex items-center gap-1"><button data-id="${task.id}" class="edit-btn text-slate-400 hover:text-blue-500 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button data-id="${task.id}" class="delete-btn text-slate-400 hover:text-red-500 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div>`;
        ganttTaskList.appendChild(el);
    });
}

// Función para actualizar el panel de información del Gantt
function renderGanttInfo(project) {
    const tasks = project.tasks.filter(t => t.type === 'task' && !t.isMilestone);
    const totalTasks = tasks.length;
    
    // Total de tareas
    const totalTasksElement = document.getElementById('gantt-info-total-tasks');
    if (totalTasksElement) totalTasksElement.textContent = totalTasks;
    
    // Progreso global
    const progressElement = document.getElementById('gantt-info-progress');
    if (progressElement) {
        const totalProgress = totalTasks > 0 ? 
            Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks) : 0;
        progressElement.textContent = `${totalProgress}%`;
    }
    
    // Días restantes
    const daysLeftElement = document.getElementById('gantt-info-days-left');
    if (daysLeftElement && project.tasks.length > 0) {
        const projectEndDate = new Date(Math.max(...project.tasks.map(t => parseDate(t.end))));
        const today = new Date();
        const daysLeft = Math.ceil((projectEndDate - today) / (1000 * 3600 * 24));
        daysLeftElement.textContent = daysLeft > 0 ? daysLeft : 0;
    } else if (daysLeftElement) {
        daysLeftElement.textContent = '0';
    }
    
    // Tareas en ruta crítica
    const criticalTasksElement = document.getElementById('gantt-info-critical-tasks');
    if (criticalTasksElement) {
        const criticalTasks = tasks.filter(t => t.isCritical).length;
        criticalTasksElement.textContent = criticalTasks;
    }
    
    // Recursos activos
    const activeResourcesElement = document.getElementById('gantt-info-active-resources');
    if (activeResourcesElement) {
        const activeResources = new Set(tasks.filter(t => t.resourceId).map(t => t.resourceId)).size;
        activeResourcesElement.textContent = activeResources;
    }
    
    // Fechas del proyecto
    const startDateElement = document.getElementById('gantt-info-start-date');
    const endDateElement = document.getElementById('gantt-info-end-date');
    const durationElement = document.getElementById('gantt-info-duration');
    
    if (project.tasks.length > 0) {
        const projectStartDate = new Date(Math.min(...project.tasks.map(t => parseDate(t.start))));
        const projectEndDate = new Date(Math.max(...project.tasks.map(t => parseDate(t.end))));
        const duration = Math.ceil((projectEndDate - projectStartDate) / (1000 * 3600 * 24)) + 1;
        
        if (startDateElement) startDateElement.textContent = `Inicio: ${projectStartDate.toLocaleDateString()}`;
        if (endDateElement) endDateElement.textContent = `Fin: ${projectEndDate.toLocaleDateString()}`;
        if (durationElement) durationElement.textContent = `Duración: ${duration} días`;
    } else {
        if (startDateElement) startDateElement.textContent = 'Inicio: -';
        if (endDateElement) endDateElement.textContent = 'Fin: -';
        if (durationElement) durationElement.textContent = 'Duración: 0 días';
    }
}
