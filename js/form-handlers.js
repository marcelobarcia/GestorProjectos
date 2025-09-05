// Form and Modal handling functions
function openEditModal(taskId) {
    const project = getActiveProject();
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const form = editTaskForm;
    form.querySelector('#edit-task-id').value = task.id;
    form.querySelector('#edit-task-type').value = task.type;
    form.querySelector('#edit-task-name').value = task.name;
    form.querySelector('#edit-task-milestone').checked = task.isMilestone;
    form.querySelector('#edit-task-start').value = task.start;
    form.querySelector('#edit-task-duration').value = task.duration;
    
    populatePredecessorDropdown(form.querySelector('#edit-task-predecessor'), project, task.id);
    form.querySelector('#edit-task-predecessor').value = task.predecessorId || '';
    form.querySelector('#edit-task-resource').value = task.resourceId || '';
    form.querySelector('#edit-task-status').value = task.status || 'Pendiente';
    form.querySelector('#edit-task-progress').value = task.progress || 0;
    form.querySelector('#edit-progress-value').textContent = task.progress || 0;

    updateEndDate(form.querySelector('#edit-task-start'), form.querySelector('#edit-task-duration'), form.querySelector('#edit-task-end'));
    toggleTaskFields(form, task.type === 'task');
    handleMilestoneToggle(form.querySelector('#edit-task-milestone'), form);

    editModal.classList.remove('hidden');
}

function handleMilestoneToggle(checkbox, form) {
    const durationInput = form.querySelector('input[type="number"][id*="duration"]');
    const progressContainer = form.querySelector('[id*="progress-container"]');
    const statusContainer = form.querySelector('[id*="status-container"]');
    const resourceContainer = form.querySelector('[id*="resource-container"]');

    if (checkbox.checked) {
        durationInput.value = 1;
        durationInput.disabled = true;
        if(progressContainer) progressContainer.style.display = 'none';
        if(statusContainer) statusContainer.style.display = 'none';
        if(resourceContainer) resourceContainer.style.display = 'none';
    } else {
        durationInput.disabled = false;
        if(progressContainer) progressContainer.style.display = 'block';
        if(statusContainer) statusContainer.style.display = 'block';
        if(resourceContainer) resourceContainer.style.display = 'block';
    }
}

function toggleTaskFields(form, isTask) {
    form.querySelector('[id*="status-container"]').style.display = isTask ? 'block' : 'none';
    form.querySelector('[id*="progress-container"]').style.display = isTask ? 'block' : 'none';
    form.querySelector('[id*="milestone-container"]').style.display = isTask ? 'block' : 'none';
    form.querySelector('[id*="predecessor-container"]').style.display = isTask ? 'block' : 'none';
}

function updateEndDate(startInput, durationInput, endInput) {
    const project = getActiveProject();
    if(!project || !startInput.value || !durationInput.value) return;
    const startDate = startInput.value;
    const duration = parseInt(durationInput.value);
    const endDate = addBusinessDays(startDate, duration, project);
    endInput.value = formatDate(endDate);
}

function setupFormListeners(form) {
    const startInput = form.querySelector('input[id*="start"]');
    const durationInput = form.querySelector('input[id*="duration"]');
    const endInput = form.querySelector('input[id*="end"]');
    const progressInput = form.querySelector('input[type="range"]');
    const progressValue = form.querySelector('span[id*="progress-value"]');
    const statusInput = form.querySelector('select[id*="status"]');
    
    startInput.onchange = () => updateEndDate(startInput, durationInput, endInput);
    durationInput.onchange = () => updateEndDate(startInput, durationInput, endInput);
    progressInput.oninput = () => {
        progressValue.textContent = progressInput.value;
        if(progressInput.value == 100) statusInput.value = 'Completada';
        else if (progressInput.value > 0) statusInput.value = 'En Progreso';
        else statusInput.value = 'Pendiente';
    };
    statusInput.onchange = () => {
        if(statusInput.value === 'Completada') {
            progressInput.value = 100;
        } else if (statusInput.value === 'Pendiente') {
            progressInput.value = 0;
        }
        progressValue.textContent = progressInput.value;
    };
}
