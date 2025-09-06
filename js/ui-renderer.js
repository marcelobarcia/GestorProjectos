// UI Rendering functions
function renderProjectUI(project) {
    // Actualizar el nombre del proyecto en el header
    updateProjectHeader(project);
    
    // Siempre actualizar el dropdown de proyectos
    updateProjectDropdown();
}

// Función para actualizar solo el header del proyecto
function updateProjectHeader(project) {
    if (project) {
        // Verificar si el elemento existe antes de intentar actualizar
        const nameInput = document.getElementById('project-name-input');
        if (nameInput) {
            let displayName = project.name;
            
            // Agregar indicador si estamos viendo una línea base
            if (project.selectedBaselineId) {
                const selectedBaseline = project.baselines.find(b => b.id === project.selectedBaselineId);
                if (selectedBaseline) {
                    displayName += ` [📊 ${selectedBaseline.name}]`;
                }
            }
            
            nameInput.value = displayName;
            console.log('📝 Updated project header:', displayName);
        } else {
            console.warn('⚠️ project-name-input element not found');
        }
    }
}

// Nueva función para actualizar el dropdown de proyectos
function updateProjectDropdown() {
    const projectListElement = document.getElementById('project-list');
    const projectMenuElement = document.getElementById('project-menu');
    
    console.log('🔄 Updating project dropdown...', {
        projects: window.projects ? window.projects.length : 0,
        activeProjectId: window.activeProjectId,
        hasProjectListElement: !!projectListElement
    });
    
    if (!projectListElement) {
        console.warn('⚠️ project-list element not found');
        return;
    }
    
    projectListElement.innerHTML = '';
    
    if (!window.projects) {
        console.warn('⚠️ window.projects not available');
        return;
    }
    
    window.projects.forEach(p => {
        console.log('📝 Adding project to dropdown:', p.name, 'ID:', p.id);
        const item = document.createElement('a');
        item.href = '#';
        item.dataset.id = p.id;
        item.className = `block px-4 py-2 text-sm ${p.id === window.activeProjectId ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`;
        item.textContent = p.name;
        item.onclick = (e) => { 
            e.preventDefault(); 
            console.log('🔄 Switching to project:', p.name, 'ID:', p.id);
            window.activeProjectId = p.id; 
            
            if (projectMenuElement) {
                projectMenuElement.classList.add('hidden');
            }
            
            // Actualizar el header inmediatamente
            updateProjectHeader(p);
            
            // Re-renderizar toda la aplicación
            if (window.render) window.render(); 
        };
        projectListElement.appendChild(item);
    });
    
    console.log('✅ Project dropdown updated with', window.projects ? window.projects.length : 0, 'projects');
}

function renderControls(project) {
    const workWeekendsToggle = document.getElementById('work-weekends');
    const criticalPathToggle = document.getElementById('critical-path');
    
    if (workWeekendsToggle) workWeekendsToggle.checked = project.workWeekends;
    if (criticalPathToggle) criticalPathToggle.checked = project.showCriticalPath;
    
    document.querySelectorAll('#gantt-view-switcher .view-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`#gantt-view-switcher .view-btn[data-view="${project.currentGanttView}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

function renderBaselinesUI(project) {
    const baselineSelect = document.getElementById('baseline-select');
    const baselineListContainer = document.getElementById('baseline-list');
    
    if (!baselineSelect) {
        console.warn('⚠️ baseline-select element not found');
        return;
    }
    
    if (!baselineListContainer) {
        console.warn('⚠️ baseline-list element not found');
        return;
    }
    
    const currentVal = baselineSelect.value;
    baselineSelect.innerHTML = '<option value="">Estado Actual</option>';
    baselineListContainer.innerHTML = '';
    
    // Verificar que existe el array de baselines
    if (!project.baselines || !Array.isArray(project.baselines)) {
        console.warn('⚠️ project.baselines not available or not an array');
        return;
    }
    
    project.baselines.forEach(b => {
        baselineSelect.innerHTML += `<option value="${b.id}">${b.name} (${b.tasks ? b.tasks.length : 0} tareas)</option>`;
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center bg-slate-100 p-2 rounded text-sm';
        el.innerHTML = `
            <div>
                <p class="font-medium">${b.name}</p>
                <p class="text-xs text-slate-500">${b.tasks ? b.tasks.length : 0} tareas - ${new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <button data-id="${b.id}" class="delete-baseline-btn text-slate-400 hover:text-red-500 p-1 rounded-full" title="Eliminar línea base">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" stroke-width="2" d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6"/>
                </svg>
            </button>
        `;
        baselineListContainer.appendChild(el);
    });
    
    baselineSelect.value = project.selectedBaselineId || '';
    
    // Agregar indicador visual si hay una línea base seleccionada
    const selectedBaseline = project.selectedBaselineId ? project.baselines.find(b => b.id === project.selectedBaselineId) : null;
    if (selectedBaseline) {
        console.log('📊 Currently viewing baseline:', selectedBaseline.name);
    }
}

function renderResourceList(project) {
    const resourceListContainer = document.getElementById('resource-list');
    if (!resourceListContainer) {
        console.warn('⚠️ resource-list element not found');
        return;
    }
    
    resourceListContainer.innerHTML = '';
    
    // Verificar que existe el array de recursos
    if (!project.resources || !Array.isArray(project.resources)) {
        console.warn('⚠️ project.resources not available or not an array');
        return;
    }
    
    project.resources.forEach(resource => {
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center bg-slate-100 p-2 rounded text-sm';
        el.innerHTML = `<div><p class="font-medium">${resource.name}</p><p class="text-xs text-slate-500">${resource.role}</p></div><button data-id="${resource.id}" class="delete-resource-btn text-slate-400 hover:text-red-500 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6"/></svg></button>`;
        resourceListContainer.appendChild(el);
    });
}

function renderHolidayList(project) {
    const holidayListContainer = document.getElementById('holiday-list');
    if (!holidayListContainer) {
        console.warn('⚠️ holiday-list element not found');
        return;
    }
    
    holidayListContainer.innerHTML = '';
    
    // Verificar que existe el array de holidays
    if (!project.holidays || !Array.isArray(project.holidays)) {
        console.warn('⚠️ project.holidays not available or not an array');
        return;
    }
    
    project.holidays.forEach(h => {
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center bg-slate-100 p-2 rounded text-sm';
        el.innerHTML = `<div><p class="font-medium">${h.name}</p><p class="text-xs text-slate-500">${h.date}</p></div><button data-date="${h.date}" class="delete-holiday-btn text-slate-400 hover:text-red-500 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6"/></svg></button>`;
        holidayListContainer.appendChild(el);
    });
}

function populateResourceDropdowns(project) {
    const selects = [document.getElementById('task-resource'), document.getElementById('edit-task-resource')];
    selects.forEach(select => {
        if (!select) return;
        
        const currentVal = select.value;
        select.innerHTML = '<option value="">Sin asignar</option>';
        
        // Verificar que existe el array de recursos
        if (project.resources && Array.isArray(project.resources)) {
            project.resources.forEach(r => {
                select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
            });
        }
        
        select.value = currentVal;
    });
}

function populatePredecessorDropdown(select, project, currentTaskIdToExclude = null) {
    if (!select) return;
    
    const currentVal = select.value;
    select.innerHTML = '<option value="">Ninguna</option>';
    
    // Verificar que existe el array de tareas
    if (project.tasks && Array.isArray(project.tasks)) {
        project.tasks.filter(t => t.type === 'task' && t.id !== currentTaskIdToExclude).forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.name}</option>`;
        });
    }
    
    select.value = currentVal;
}

// Exponer funciones globalmente
window.renderProjectUI = renderProjectUI;
window.updateProjectHeader = updateProjectHeader;
window.updateProjectDropdown = updateProjectDropdown;
window.renderControls = renderControls;
window.renderBaselinesUI = renderBaselinesUI;
window.renderResourceList = renderResourceList;
window.renderHolidayList = renderHolidayList;
window.populateResourceDropdowns = populateResourceDropdowns;
window.populatePredecessorDropdown = populatePredecessorDropdown;
