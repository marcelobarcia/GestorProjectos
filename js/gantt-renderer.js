// Gantt Chart Rendering functions
function renderGantt(project) {
    renderTaskList(project);
    
    if (project.tasks.length === 0) {
        if (window.ganttTaskList) window.ganttTaskList.innerHTML = '<p class="p-4 text-slate-500">No hay tareas.</p>';
        if (window.ganttHeaderTimeline) window.ganttHeaderTimeline.innerHTML = '';
        if (window.ganttChartArea) window.ganttChartArea.innerHTML = '<div class="flex items-center justify-center h-full text-slate-400 italic">Añade tareas para ver el diagrama de Gantt</div>';
        renderGanttInfo(project); // Actualizar info panel incluso sin tareas
        return;
    }
    
    const projectStartDate = project.tasks.reduce((min, t) => (window.parseDate(t.start) < min ? window.parseDate(t.start) : min), window.parseDate(project.tasks[0].start));
    const projectEndDate = project.tasks.reduce((max, t) => (window.parseDate(t.end) > max ? window.parseDate(t.end) : max), window.parseDate(project.tasks[0].end));
    const { totalWidth, timelineStartDate, timelineEndDate } = window.renderTimeline ? window.renderTimeline(projectStartDate, projectEndDate, project) : { totalWidth: 0, timelineStartDate: projectStartDate, timelineEndDate: projectEndDate };
    if (window.renderChart) window.renderChart(timelineStartDate, timelineEndDate, totalWidth, project);
    renderGanttInfo(project); // Actualizar panel de información
}

function renderTaskList(project) {
    const rowHeight = 64;
    const ganttTaskList = window.ganttTaskList;
    if (!ganttTaskList) return;
    
    ganttTaskList.innerHTML = '';
    
    project.tasks.forEach(task => {
        const resource = project.resources.find(r => r.id === task.resourceId);
        const el = document.createElement('div');
        el.className = `flex items-center border-b border-slate-200 text-sm ${task.type === 'phase' ? 'font-bold bg-slate-50' : ''}`;
        el.style.height = `${rowHeight}px`;

        const statusColor = task.type === 'phase' ? (window.STATUS_COLORS ? window.STATUS_COLORS.Fase : '#475569') : (window.STATUS_COLORS ? window.STATUS_COLORS[task.status] : '#64748b');
        const iconHtml = task.isMilestone
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`
            : `<span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${statusColor || '#64748b'}"></span>`;

        // Calcular duración en días
        const startDate = window.parseDate ? window.parseDate(task.start) : new Date(task.start);
        const endDate = window.parseDate ? window.parseDate(task.end) : new Date(task.end);
        const duration = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1;

        el.innerHTML = `
            <div class="p-3 grid grid-cols-6 gap-2 w-full">
                <!-- Columna 1: Nombre de tarea (2 columnas) -->
                <div class="col-span-2">
                    <div class="flex items-center gap-2">
                        ${iconHtml}
                        <div class="flex-grow min-w-0">
                            <p class="truncate font-medium">${task.name}</p>
                            <p class="text-xs text-slate-500 truncate">
                                ${task.type === 'task' ? `${task.progress}%` : task.type === 'phase' ? 'Fase' : ''}
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- Columna 2: Fecha de Inicio -->
                <div class="text-center flex flex-col justify-center">
                    <span class="text-xs font-medium">${window.formatDate ? window.formatDate(startDate) : startDate}</span>
                </div>
                
                <!-- Columna 3: Fecha de Fin -->
                <div class="text-center flex flex-col justify-center">
                    <span class="text-xs font-medium">${window.formatDate ? window.formatDate(endDate) : endDate}</span>
                </div>
                
                <!-- Columna 4: Duración -->
                <div class="text-center flex flex-col justify-center">
                    <span class="text-xs font-medium">${duration} día${duration !== 1 ? 's' : ''}</span>
                </div>
                
                <!-- Columna 5: Asignado -->
                <div class="text-center flex flex-col justify-center">
                    <span class="text-xs font-medium">${resource ? resource.name : (task.type === 'task' ? 'Sin asignar' : '-')}</span>
                    <div class="flex items-center justify-center gap-1 mt-1">
                        <button data-id="${task.id}" class="edit-btn text-slate-400 hover:text-blue-500 p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button data-id="${task.id}" class="delete-btn text-slate-400 hover:text-red-500 p-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        if (ganttTaskList) ganttTaskList.appendChild(el);
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
        const activeResources = project.resources.filter(r => 
            project.tasks.some(t => t.resourceId === r.id && t.type === 'task')
        ).length;
        activeResourcesElement.textContent = activeResources;
    }
    
    // Fechas del proyecto
    if (project.tasks.length > 0) {
        // Filtrar tareas que tengan fechas válidas
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
                const startDate = new Date(Math.min(...startDates));
                const endDate = new Date(Math.max(...endDates));
                const duration = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1;
                
                const startDateElement = document.getElementById('gantt-info-start-date');
                const endDateElement = document.getElementById('gantt-info-end-date');
                const durationElement = document.getElementById('gantt-info-duration');
                
                if (startDateElement) startDateElement.textContent = `Inicio: ${window.formatDate ? window.formatDate(startDate) : startDate}`;
                if (endDateElement) endDateElement.textContent = `Fin: ${window.formatDate ? window.formatDate(endDate) : endDate}`;
                if (durationElement) durationElement.textContent = `Duración: ${duration} días`;
            }
        }
    }
}

// Exponer funciones globalmente
window.renderGantt = renderGantt;
window.renderTaskList = renderTaskList;
window.renderGanttInfo = renderGanttInfo;
