// Project Schedule Calculation functions
function calculateProjectSchedule(project) {
    const taskMap = new Map(project.tasks.map(t => [t.id, t]));
    let changed = true;
    let iterations = 0;
    
    while(changed && iterations < project.tasks.length * project.tasks.length) {
        changed = false;
        project.tasks.forEach(task => {
            if (task.isMilestone) task.duration = 1;
            
            let newStartDate = task.start;
            if(task.predecessorId && taskMap.has(task.predecessorId)){
                const predecessor = taskMap.get(task.predecessorId);
                if(predecessor.end) {
                    const potentialStartDate = formatDate(getNextWorkingDay(predecessor.end, project));
                    if (parseDate(potentialStartDate) > parseDate(newStartDate)) {
                        newStartDate = potentialStartDate;
                    }
                }
            }
            
            const newEndDate = formatDate(addBusinessDays(newStartDate, task.duration, project));
            if(newStartDate !== task.start || newEndDate !== task.end) {
                task.start = newStartDate;
                task.end = newEndDate;
                changed = true;
            }
        });
        iterations++;
    }
}

function calculateCriticalPath(project) {
    if (project.tasks.length === 0) return;
    
    const taskMap = new Map();
    project.tasks.forEach(t => {
        t.isCritical = false;
        t.successors = [];
        taskMap.set(t.id, t);
    });

    project.tasks.forEach(t => {
        if (t.predecessorId && taskMap.has(t.predecessorId)) {
            taskMap.get(t.predecessorId).successors.push(t);
        }
    });

    project.tasks.forEach(t => {
        t.es = parseDate(t.start);
        t.ef = parseDate(t.end);
    });

    const projectEndDate = project.tasks.reduce((max, t) => (t.ef > max ? t.ef : max), new Date(0));
    const reversedTasks = [...project.tasks].sort((a, b) => b.ef.getTime() - a.ef.getTime());

    reversedTasks.forEach(task => {
        if (task.successors.length === 0) {
            task.lf = new Date(projectEndDate);
        } else {
            const minLsOfSuccessors = new Date(Math.min(...task.successors.map(s => s.ls.getTime())));
            task.lf = getPreviousWorkingDay(minLsOfSuccessors, project);
        }
        task.ls = subtractBusinessDays(task.lf, task.duration, project);
    });

    project.tasks.forEach(task => {
        const slack = (task.ls.getTime() - task.es.getTime()) / (1000 * 3600 * 24);
        if (slack <= 0.1 && task.type === 'task') {
            task.isCritical = true;
        }
    });
}

// Exponer funciones globalmente
window.calculateProjectSchedule = calculateProjectSchedule;
window.calculateCriticalPath = calculateCriticalPath;
