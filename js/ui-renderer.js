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
            nameInput.value = project.name;
            console.log('📝 Updated project header:', project.name);
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
        projects: projects.length,
        activeProjectId,
        hasProjectListElement: !!projectListElement
    });
    
    if (!projectListElement) {
        console.warn('⚠️ project-list element not found');
        return;
    }
    
    projectListElement.innerHTML = '';
    projects.forEach(p => {
        console.log('📝 Adding project to dropdown:', p.name, 'ID:', p.id);
        const item = document.createElement('a');
        item.href = '#';
        item.dataset.id = p.id;
        item.className = `block px-4 py-2 text-sm ${p.id === activeProjectId ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`;
        item.textContent = p.name;
        item.onclick = (e) => { 
            e.preventDefault(); 
            console.log('🔄 Switching to project:', p.name, 'ID:', p.id);
            activeProjectId = p.id; 
            
            if (projectMenuElement) {
                projectMenuElement.classList.add('hidden');
            }
            
            // Actualizar el header inmediatamente
            updateProjectHeader(p);
            
            // Re-renderizar toda la aplicación
            render(); 
        };
        projectListElement.appendChild(item);
    });
    
    console.log('✅ Project dropdown updated with', projects.length, 'projects');
}

function renderControls(project) {
    workWeekendsToggle.checked = project.workWeekends;
    criticalPathToggle.checked = project.showCriticalPath;
    document.querySelectorAll('#gantt-view-switcher .view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#gantt-view-switcher .view-btn[data-view="${project.currentGanttView}"]`).classList.add('active');
}

function renderBaselinesUI(project) {
    const currentVal = baselineSelect.value;
    baselineSelect.innerHTML = '<option value="">Ninguna</option>';
    baselineListContainer.innerHTML = '';
    
    project.baselines.forEach(b => {
        baselineSelect.innerHTML += `<option value="${b.id}">${b.name}</option>`;
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center bg-slate-100 p-2 rounded text-sm';
        el.innerHTML = `<p class="font-medium">${b.name}</p><button data-id="${b.id}" class="delete-baseline-btn text-slate-400 hover:text-red-500 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6"/></svg></button>`;
        baselineListContainer.appendChild(el);
    });
    baselineSelect.value = project.selectedBaselineId || '';
}

function renderResourceList(project) {
    resourceListContainer.innerHTML = '';
    project.resources.forEach(resource => {
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center bg-slate-100 p-2 rounded text-sm';
        el.innerHTML = `<div><p class="font-medium">${resource.name}</p><p class="text-xs text-slate-500">${resource.role}</p></div><button data-id="${resource.id}" class="delete-resource-btn text-slate-400 hover:text-red-500 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6m4-6v6"/></svg></button>`;
        resourceListContainer.appendChild(el);
    });
}

function renderHolidayList(project) {
    holidayListContainer.innerHTML = '';
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
        const currentVal = select.value;
        select.innerHTML = '<option value="">Sin asignar</option>';
        project.resources.forEach(r => {
            select.innerHTML += `<option value="${r.id}">${r.name}</option>`;
        });
        select.value = currentVal;
    });
}

function populatePredecessorDropdown(select, project, currentTaskIdToExclude = null) {
    const currentVal = select.value;
    select.innerHTML = '<option value="">Ninguna</option>';
    project.tasks.filter(t => t.type === 'task' && t.id !== currentTaskIdToExclude).forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.name}</option>`;
    });
    select.value = currentVal;
}
