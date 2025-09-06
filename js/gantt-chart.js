// Gantt Chart functions
function renderChart(timelineStart, timelineEnd, totalWidth, project) {
    const chartArea = window.ganttChartArea;
    if (!chartArea) {
        console.error('❌ Gantt chart area not found');
        return;
    }
    
    chartArea.innerHTML = '';
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'relative w-full h-full';
    const rowHeight = 64; // Height for each task row
    const totalRows = project.tasks.length;
    const minHeight = Math.max(400, totalRows * rowHeight);
    
    chartWrapper.style.height = `${minHeight}px`;
    chartWrapper.style.width = `${totalWidth}px`;
    chartWrapper.style.minWidth = '100%';
    
    const totalTimelineDays = (timelineEnd - timelineStart) / (1000 * 3600 * 24);
    const scale = totalWidth / totalTimelineDays;

    // Baseline wrapper
    const baselineWrapper = document.createElement('div');
    baselineWrapper.className = 'absolute top-0 left-0 w-full h-full z-0';
    chartWrapper.appendChild(baselineWrapper);

    const activeBaseline = project.selectedBaselineId ? project.baselines.find(b => b.id === project.selectedBaselineId) : null;
    console.log('📊 Active baseline for rendering:', activeBaseline ? activeBaseline.name : 'None');
    
    project.tasks.forEach((task, index) => {
        // Render baseline if exists
        if (activeBaseline) {
            const baselineTask = activeBaseline.tasks.find(bt => bt.id === task.id);
            if (baselineTask && !baselineTask.isMilestone && baselineTask.type !== 'phase') {
                const baselineOffsetDays = (window.parseDate(baselineTask.start) - timelineStart) / (1000 * 3600 * 24);
                const baselineDurationDays = (window.parseDate(baselineTask.end) - window.parseDate(baselineTask.start)) / (1000 * 3600 * 24) + 1;
                const baselineBar = document.createElement('div');
                baselineBar.className = 'absolute h-2 bg-slate-400 rounded-sm opacity-80';
                baselineBar.style.top = `${index * rowHeight + 44}px`;
                baselineBar.style.left = `${Math.max(0, baselineOffsetDays * scale)}px`;
                baselineBar.style.width = `${Math.max(2, baselineDurationDays * scale)}px`;
                baselineBar.title = `Línea Base: ${baselineTask.start} -> ${baselineTask.end}`;
                baselineWrapper.appendChild(baselineBar);
            }
        }

        const offsetDays = (window.parseDate(task.start) - timelineStart) / (1000 * 3600 * 24);
        const barTopPosition = index * rowHeight;
        
        if (task.isMilestone) {
            // Render milestone as diamond/star
            const milestoneContainer = document.createElement('div');
            milestoneContainer.dataset.taskId = task.id;
            milestoneContainer.className = 'absolute cursor-pointer';
            milestoneContainer.style.left = `${Math.max(0, offsetDays * scale - 12)}px`;
            milestoneContainer.style.top = `${barTopPosition + 16}px`;
            milestoneContainer.style.width = `24px`;
            milestoneContainer.style.height = `32px`;
            milestoneContainer.style.zIndex = '10';
            milestoneContainer.innerHTML = `
                <div class="flex justify-center items-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-yellow-500 drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            `;
            milestoneContainer.title = `${task.name}\n(Hito: ${task.start})`;
            chartWrapper.appendChild(milestoneContainer);
        } else {
            // Render regular task bar
            const durationDays = (window.parseDate(task.end) - window.parseDate(task.start)) / (1000 * 3600 * 24) + 1;
            const bar = document.createElement('div');
            bar.dataset.taskId = task.id;
            bar.className = task.type === 'phase' ? 'gantt-phase-bar' : 'gantt-task-bar';
            
            const barLeft = Math.max(0, offsetDays * scale);
            const barWidth = Math.max(8, durationDays * scale); // Minimum width of 8px
            
            bar.style.left = `${barLeft}px`;
            bar.style.width = `${barWidth}px`;
            bar.style.top = task.type === 'phase' ? `${barTopPosition + 28}px` : `${barTopPosition + 12}px`;
            
            // Solo hacer arrastrables las tareas normales (no fases ni hitos)
            if (task.type === 'task') {
                // Hacer arrastrable
                bar.draggable = true;
                bar.style.cursor = 'grab';
                bar.setAttribute('data-draggable', 'true');
                
                console.log('Configurando drag para:', task.name, 'ID:', task.id); // Debug
                
                // Eventos de drag and drop
                bar.addEventListener('dragstart', (e) => {
                    console.log('🎯 Drag START:', task.name, task.id);
                    e.stopPropagation();
                    bar.style.cursor = 'grabbing';
                    bar.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.setData('application/json', JSON.stringify({
                        taskId: task.id,
                        taskName: task.name
                    }));
                    e.dataTransfer.effectAllowed = 'move';
                    
                    // Crear indicador de drop zone
                    createDropZoneIndicator(chartWrapper);
                });
                
                bar.addEventListener('dragend', (e) => {
                    console.log('🏁 Drag END:', task.name);
                    bar.style.cursor = 'grab';
                    bar.classList.remove('dragging');
                    bar.style.transform = '';
                    
                    // Remover indicador de drop zone
                    removeDropZoneIndicator(chartWrapper);
                });
                
                bar.addEventListener('drag', (e) => {
                    // Efecto visual durante el arrastre
                    if (e.clientX > 0 && e.clientY > 0) {
                        updateDropZoneIndicator(chartWrapper, e, timelineStart, scale);
                    }
                });
            } else {
                // Para fases y hitos, cursor normal
                bar.style.cursor = 'default';
                bar.setAttribute('data-draggable', 'false');
            }
            
            if (task.type === 'task') {
                bar.style.backgroundColor = STATUS_COLORS[task.status] || '#64748b';
                bar.innerHTML = `
                    <div class="gantt-task-progress" style="width: ${task.progress}%"></div>
                    <span class="truncate text-white text-xs font-medium">${task.name}</span>
                `;
            } else {
                bar.style.backgroundColor = STATUS_COLORS.Fase;
            }
            
            if (project.showCriticalPath && task.isCritical) {
                bar.classList.add('ring-2', 'ring-offset-1', 'ring-red-500');
            }
            
            bar.title = `${task.name}\n${task.start} - ${task.end}\n${task.type === 'task' ? `Progreso: ${task.progress}%` : 'Fase'}`;
            chartWrapper.appendChild(bar);
        }
    });

    // Render connections between tasks
    renderGanttConnections(chartWrapper, project);
    
    // Configurar drag and drop en el área del gráfico
    setupGanttDragAndDrop(chartWrapper, project, timelineStart, totalWidth, scale);
    
    chartArea.appendChild(chartWrapper);
}

function renderGanttConnections(chartWrapper, project) {
    // Remover SVG existente si lo hay
    const existingSvg = chartWrapper.querySelector('#gantt-connections');
    if (existingSvg) {
        existingSvg.remove();
    }
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'gantt-connections');
    svg.setAttribute('class', 'absolute inset-0 pointer-events-none');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '15';
    svg.style.overflow = 'visible';
    
    // Definir marcadores para las flechas
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead-normal" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <polygon points="0 0, 8 3, 0 6" fill="#3b82f6"/>
            </marker>
            <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444"/>
            </marker>
        </defs>
    `;
    
    // Usar setTimeout para asegurar que las barras estén renderizadas
    setTimeout(() => {
        project.tasks.forEach((task) => {
            if (task.predecessorId) {
                const predecessor = project.tasks.find(t => t.id === task.predecessorId);
                const predecessorBar = chartWrapper.querySelector(`[data-task-id="${task.predecessorId}"]`);
                const taskBar = chartWrapper.querySelector(`[data-task-id="${task.id}"]`);
                
                if (predecessorBar && taskBar && predecessor) {
                    // Calcular puntos de conexión relativos al chartWrapper
                    let x1, y1, x2, y2;
                    
                    // Punto de salida del predecesor
                    if (predecessor.isMilestone) {
                        x1 = predecessorBar.offsetLeft + (predecessorBar.offsetWidth / 2);
                        y1 = predecessorBar.offsetTop + (predecessorBar.offsetHeight / 2);
                    } else {
                        x1 = predecessorBar.offsetLeft + predecessorBar.offsetWidth;
                        y1 = predecessorBar.offsetTop + (predecessorBar.offsetHeight / 2);
                    }
                    
                    // Punto de entrada de la tarea actual
                    if (task.isMilestone) {
                        x2 = taskBar.offsetLeft + (taskBar.offsetWidth / 2) - 8;
                        y2 = taskBar.offsetTop + (taskBar.offsetHeight / 2);
                    } else {
                        x2 = taskBar.offsetLeft - 8;
                        y2 = taskBar.offsetTop + (taskBar.offsetHeight / 2);
                    }

                    // Determinar si es conexión crítica
                    const isCritical = task.isCritical && predecessor.isCritical;
                    const strokeColor = isCritical ? '#ef4444' : '#3b82f6';
                    const strokeWidth = isCritical ? '3' : '2';
                    const markerEnd = isCritical ? 'url(#arrowhead-critical)' : 'url(#arrowhead-normal)';

                    // Crear línea de conexión tipo escalón
                    const path = document.createElementNS(svgNS, 'path');
                    
                    if (Math.abs(y2 - y1) < 5 && x2 > x1) {
                        // Línea horizontal directa
                        path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
                    } else {
                        // Línea en escalón
                        const midX = x1 + Math.max(15, (x2 - x1) * 0.6);
                        path.setAttribute('d', `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`);
                    }
                    
                    path.setAttribute('stroke', strokeColor);
                    path.setAttribute('stroke-width', strokeWidth);
                    path.setAttribute('fill', 'none');
                    path.setAttribute('marker-end', markerEnd);
                    path.setAttribute('opacity', '0.9');
                    
                    // Tooltip informativo
                    const connectionTitle = `${predecessor.name} → ${task.name}${isCritical ? ' (Ruta Crítica)' : ''}`;
                    path.setAttribute('title', connectionTitle);
                    
                    svg.appendChild(path);
                }
            }
        });
    }, 50); // Pequeño delay para asegurar renderizado
    
    chartWrapper.appendChild(svg);
}

// Configurar drag and drop para el gráfico de Gantt
function setupGanttDragAndDrop(chartWrapper, project, timelineStart, totalWidth, scale) {
    console.log('🔧 Configurando drag and drop en chartWrapper');
    
    chartWrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // Mostrar indicador visual
        chartWrapper.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    });
    
    chartWrapper.addEventListener('dragleave', (e) => {
        // Solo remover si realmente sale del área
        if (!chartWrapper.contains(e.relatedTarget)) {
            chartWrapper.style.backgroundColor = '';
        }
    });

    chartWrapper.addEventListener('drop', (e) => {
        console.log('💧 DROP EVENT detectado');
        e.preventDefault();
        e.stopPropagation();
        
        // Remover indicador visual
        chartWrapper.style.backgroundColor = '';
        
        const taskId = e.dataTransfer.getData('text/plain');
        console.log('📦 Task ID del drop:', taskId);
        
        const task = project.tasks.find(t => t.id === taskId);
        
        if (!task) {
            console.warn('❌ Tarea no encontrada:', taskId);
            return;
        }
        
        if (task.type === 'phase') {
            showNotification('No se pueden mover las fases', 'warning');
            return;
        }
        
        console.log('✅ Procesando drop de:', task.name);
        
        // Calcular nueva fecha basada en la posición del drop
        const rect = chartWrapper.getBoundingClientRect();
        const dropX = e.clientX - rect.left + chartWrapper.scrollLeft;
        
        console.log('📍 Posición drop:', dropX, 'Escala:', scale);
        
        // Snap to day boundaries para mayor precisión
        const daysDiff = Math.round(dropX / scale);
        const newStartDate = new Date(timelineStart);
        newStartDate.setDate(newStartDate.getDate() + daysDiff);
        
        // Validar que la nueva fecha no sea anterior a las dependencias
        if (task.predecessorId) {
            const predecessor = project.tasks.find(t => t.id === task.predecessorId);
            if (predecessor) {
                const predecessorEndDate = window.parseDate(predecessor.end);
                if (newStartDate < predecessorEndDate) {
                    newStartDate.setTime(predecessorEndDate.getTime());
                    newStartDate.setDate(newStartDate.getDate() + 1);
                    showNotification('Fecha ajustada por dependencias', 'info');
                }
            }
        }
        
        // Calcular nueva fecha de fin manteniendo la duración
        const currentDuration = (window.parseDate(task.end) - window.parseDate(task.start)) / (1000 * 3600 * 24);
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + currentDuration);
        
        // Formatear fechas
        const newStart = window.formatDateForInput(newStartDate);
        const newEnd = window.formatDateForInput(newEndDate);
        
        console.log('📅 Nueva fecha:', newStart, 'a', newEnd);
        
        // Verificar si realmente cambió
        if (task.start === newStart) {
            showNotification('La tarea ya está en esa posición', 'info');
            return;
        }
        
        // Actualizar la tarea
        const oldStart = task.start;
        task.start = newStart;
        task.end = newEnd;
        
        // Mostrar notificación con más información
        const daysMoved = Math.round((window.parseDate(newStart) - window.parseDate(oldStart)) / (1000 * 3600 * 24));
        const direction = daysMoved > 0 ? 'adelantada' : 'retrasada';
        showNotification(`"${task.name}" ${direction} ${Math.abs(daysMoved)} día(s)`, 'success');
        
        // Recalcular dependencias y renderizar
        calculateProjectSchedule(project);
        renderGantt(project);
        
        // Guardar cambios
        updateProject(project);
        
        console.log('🎉 Drop completado exitosamente');
    });
}

// Función auxiliar para formatear fecha
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Funciones para el indicador de drop zone
function createDropZoneIndicator(chartWrapper) {
    const indicator = document.createElement('div');
    indicator.id = 'gantt-drop-indicator';
    indicator.className = 'gantt-drop-zone';
    indicator.style.position = 'absolute';
    indicator.style.height = '40px';
    indicator.style.width = '4px';
    indicator.style.zIndex = '100';
    chartWrapper.appendChild(indicator);
}

function updateDropZoneIndicator(chartWrapper, dragEvent, timelineStart, scale) {
    const indicator = chartWrapper.querySelector('#gantt-drop-indicator');
    if (!indicator) return;
    
    const rect = chartWrapper.getBoundingClientRect();
    const dropX = dragEvent.clientX - rect.left + chartWrapper.scrollLeft;
    
    // Snap to day boundaries
    const dayPosition = Math.round(dropX / scale) * scale;
    
    indicator.style.left = `${dayPosition}px`;
    indicator.style.top = '0px';
    indicator.classList.add('active');
    
    // Mostrar fecha en tooltip
    const daysDiff = Math.round(dayPosition / scale);
    const targetDate = new Date(timelineStart);
    targetDate.setDate(targetDate.getDate() + daysDiff);
    indicator.title = `Mover a: ${window.formatDateForInput(targetDate)}`;
}

function removeDropZoneIndicator(chartWrapper) {
    const indicator = chartWrapper.querySelector('#gantt-drop-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Exponer funciones globalmente
window.renderChart = renderChart;
window.createDropZoneIndicator = createDropZoneIndicator;
window.removeDropZoneIndicator = removeDropZoneIndicator;
window.formatDateForInput = formatDateForInput;
