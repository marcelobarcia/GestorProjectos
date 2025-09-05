// Gantt Timeline and Chart functions
function renderTimeline(startDate, endDate, project) {
    ganttHeaderTimeline.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'relative flex h-full';
    let totalWidth = 0;
    let timelineStartDate = new Date(startDate),
        timelineEndDate = new Date(endDate);
    timelineStartDate.setUTCDate(timelineStartDate.getUTCDate() - 3); // Add padding
    timelineEndDate.setUTCDate(timelineEndDate.getUTCDate() + 3); // Add padding

    let currentDate = new Date(timelineStartDate);
    const unitWidth = VIEW_CONFIGS[project.currentGanttView].unitWidth;
    const topRow = document.createElement('div');
    topRow.className = 'absolute top-0 h-1/2 w-full flex';
    const bottomRow = document.createElement('div');
    bottomRow.className = 'absolute bottom-0 h-1/2 w-full flex border-t border-slate-200';
    let topLabelCache = {};

    while (currentDate <= timelineEndDate) {
        let topLabelText = '',
            bottomLabelText = '',
            incrementDays = 1;
        switch (project.currentGanttView) {
            case 'day':
                topLabelText = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                bottomLabelText = currentDate.getUTCDate();
                break;
            case 'week':
                topLabelText = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
                bottomLabelText = `S${getWeekNumber(currentDate)}`;
                incrementDays = 7;
                break;
            case 'month':
                topLabelText = currentDate.getUTCFullYear().toString();
                bottomLabelText = currentDate.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' });
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
                incrementDays = 0;
                break;
            case 'year':
                topLabelText = '';
                bottomLabelText = currentDate.getUTCFullYear().toString();
                currentDate.setUTCFullYear(currentDate.getUTCFullYear() + 1);
                incrementDays = 0;
                break;
        }
        
        if (topLabelText) {
            if (!topLabelCache[topLabelText]) topLabelCache[topLabelText] = 0;
            topLabelCache[topLabelText] += unitWidth;
        }
        
        const col = document.createElement('div');
        col.className = 'flex-shrink-0 text-center border-r border-slate-200 text-xs flex items-center justify-center';
        col.style.width = `${unitWidth}px`;
        col.textContent = bottomLabelText;
        if (project.currentGanttView === 'day' && !isWorkingDay(currentDate, project)) col.classList.add('day-column-non-working');
        bottomRow.appendChild(col);
        totalWidth += unitWidth;
        if (incrementDays > 0) currentDate.setUTCDate(currentDate.getUTCDate() + incrementDays);
    }
    
    Object.keys(topLabelCache).forEach(key => {
        const label = document.createElement('div');
        label.className = 'h-full flex-shrink-0 text-center font-semibold text-slate-600 flex items-center justify-center border-r border-slate-200';
        label.style.width = `${topLabelCache[key]}px`;
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        topRow.appendChild(label);
    });
    
    wrapper.style.width = `${totalWidth}px`;
    wrapper.appendChild(topRow);
    wrapper.appendChild(bottomRow);
    ganttHeaderTimeline.appendChild(wrapper);
    
    // Update the chart area background to match timeline
    if (ganttChartArea) {
        ganttChartArea.style.backgroundSize = `${unitWidth}px 64px`;
    }
    
    return { totalWidth, timelineStartDate, timelineEndDate };
}
