// Date & Calculation Helper functions
const parseDate = (str) => new Date(str + 'T00:00:00Z');
const formatDate = (date) => date.toISOString().split('T')[0];

function isWorkingDay(date, project) {
    const day = date.getUTCDay();
    if (!project.workWeekends && (day === 6 || day === 0)) return false;
    if (project.holidays.some(h => h.date === formatDate(date))) return false;
    return true;
}

function getNextWorkingDay(dateStr, project) {
    let d = parseDate(dateStr);
    d.setUTCDate(d.getUTCDate() + 1);
    while (!isWorkingDay(d, project)) { 
        d.setUTCDate(d.getUTCDate() + 1); 
    }
    return d;
}

function getPreviousWorkingDay(date, project) {
    let d = new Date(date);
    d.setUTCDate(d.getUTCDate() - 1);
    while (!isWorkingDay(d, project)) { 
        d.setUTCDate(d.getUTCDate() - 1); 
    }
    return d;
}

function addBusinessDays(startDateStr, duration, project) {
    let currentDate = parseDate(startDateStr);
    while(!isWorkingDay(currentDate, project)){
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    let daysAdded = 1;
    while (daysAdded < duration) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        if (isWorkingDay(currentDate, project)) {
            daysAdded++;
        }
    }
    return currentDate;
}

function subtractBusinessDays(date, duration, project) {
    let currentDate = new Date(date);
    let daysSubtracted = 1;
    while(!isWorkingDay(currentDate, project)) {
        currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    }
    while (daysSubtracted < duration) {
        currentDate.setUTCDate(currentDate.getUTCDate() - 1);
        if (isWorkingDay(currentDate, project)) {
            daysSubtracted++;
        }
    }
    return currentDate;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Exponer funciones globalmente
window.parseDate = parseDate;
window.formatDate = formatDate;
window.isWorkingDay = isWorkingDay;
window.getNextWorkingDay = getNextWorkingDay;
window.getPreviousWorkingDay = getPreviousWorkingDay;
window.addBusinessDays = addBusinessDays;
window.subtractBusinessDays = subtractBusinessDays;
window.getWeekNumber = getWeekNumber;
