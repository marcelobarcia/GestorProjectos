// Gantt Chart functions
function renderChart(timelineStart, timelineEnd, totalWidth, project) {
    ganttChartArea.innerHTML = '';
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
    
    project.tasks.forEach((task, index) => {
        // Render baseline if exists
        if (activeBaseline) {
            const baselineTask = activeBaseline.tasks.find(bt => bt.id === task.id);
            if (baselineTask && !baselineTask.isMilestone && baselineTask.type !== 'phase') {
                const baselineOffsetDays = (parseDate(baselineTask.start) - timelineStart) / (1000 * 3600 * 24);
                const baselineDurationDays = (parseDate(baselineTask.end) - parseDate(baselineTask.start)) / (1000 * 3600 * 24) + 1;
                const baselineBar = document.createElement('div');
                baselineBar.className = 'absolute h-2 bg-slate-400 rounded-sm opacity-80';
                baselineBar.style.top = `${index * rowHeight + 44}px`;
                baselineBar.style.left = `${Math.max(0, baselineOffsetDays * scale)}px`;
                baselineBar.style.width = `${Math.max(2, baselineDurationDays * scale)}px`;
                baselineBar.title = `Línea Base: ${baselineTask.start} -> ${baselineTask.end}`;
                baselineWrapper.appendChild(baselineBar);
            }
        }

        const offsetDays = (parseDate(task.start) - timelineStart) / (1000 * 3600 * 24);
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
            const durationDays = (parseDate(task.end) - parseDate(task.start)) / (1000 * 3600 * 24) + 1;
            const bar = document.createElement('div');
            bar.dataset.taskId = task.id;
            bar.className = task.type === 'phase' ? 'gantt-phase-bar' : 'gantt-task-bar';
            
            const barLeft = Math.max(0, offsetDays * scale);
            const barWidth = Math.max(8, durationDays * scale); // Minimum width of 8px
            
            bar.style.left = `${barLeft}px`;
            bar.style.width = `${barWidth}px`;
            bar.style.top = task.type === 'phase' ? `${barTopPosition + 28}px` : `${barTopPosition + 12}px`;
            
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
    ganttChartArea.appendChild(chartWrapper);
}

function renderGanttConnections(chartWrapper, project) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'gantt-connections');
    svg.innerHTML = `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#64748b" /></marker></defs>`;
    
    project.tasks.forEach((task) => {
        if (task.predecessorId) {
            const predecessorBar = chartWrapper.querySelector(`[data-task-id="${task.predecessorId}"]`);
            const taskBar = chartWrapper.querySelector(`[data-task-id="${task.id}"]`);
            
            if (predecessorBar && taskBar) {
                let x1 = predecessorBar.offsetLeft;
                if (!project.tasks.find(t=>t.id === task.predecessorId).isMilestone) {
                    x1 += predecessorBar.offsetWidth
                } else {
                    x1 += predecessorBar.offsetWidth / 2;
                }

                const y1 = predecessorBar.offsetTop + predecessorBar.offsetHeight / 2;
                let x2 = taskBar.offsetLeft;
                if (project.tasks.find(t=>t.id === task.id).isMilestone) {
                    x2 += taskBar.offsetWidth/2 - 10;
                } else {
                    x2 -= 10;
                }
                const y2 = taskBar.offsetTop + taskBar.offsetHeight / 2;

                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', `M ${x1} ${y1} L ${x1 + 15} ${y1} L ${x1 + 15} ${y2} L ${x2} ${y2}`);
                path.setAttribute('stroke', '#64748b');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                path.setAttribute('marker-end', 'url(#arrowhead)');
                svg.appendChild(path);
            }
        }
    });
    chartWrapper.appendChild(svg);
}
