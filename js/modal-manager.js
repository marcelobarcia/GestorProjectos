// Sistema de Modales y Alertas Personalizadas
class ModalManager {
    constructor() {
        this.activeModals = [];
        this.createModalContainer();
        this.setupKeyboardListeners();
    }

    createModalContainer() {
        // Crear contenedor principal para modales
        const container = document.createElement('div');
        container.id = 'modal-container';
        container.className = 'fixed inset-0 z-[9999] pointer-events-none';
        document.body.appendChild(container);
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                const topModal = this.activeModals[this.activeModals.length - 1];
                if (topModal.options.dismissible !== false) {
                    this.closeModal(topModal.id);
                }
            }
        });
    }

    // Método principal para mostrar alertas
    showAlert(message, type = 'info', options = {}) {
        const config = {
            type,
            title: options.title || this.getDefaultTitle(type),
            message,
            buttons: options.buttons || this.getDefaultButtons(type),
            dismissible: options.dismissible !== false,
            icon: options.icon || this.getDefaultIcon(type),
            ...options
        };

        return this.createModal(config);
    }

    // Métodos específicos para diferentes tipos de alertas
    confirm(message, title = '¿Estás seguro?', options = {}) {
        return this.showAlert(message, 'confirm', {
            title,
            buttons: [
                { text: 'Cancelar', action: 'cancel', style: 'secondary' },
                { text: 'Confirmar', action: 'confirm', style: 'primary' }
            ],
            ...options
        });
    }

    success(message, title = 'Éxito', options = {}) {
        return this.showAlert(message, 'success', { title, ...options });
    }

    error(message, title = 'Error', options = {}) {
        return this.showAlert(message, 'error', { title, ...options });
    }

    warning(message, title = 'Advertencia', options = {}) {
        return this.showAlert(message, 'warning', { title, ...options });
    }

    info(message, title = 'Información', options = {}) {
        return this.showAlert(message, 'info', { title, ...options });
    }

    // Crear modal personalizado
    createModal(config) {
        const modalId = 'modal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        return new Promise((resolve) => {
            const modalHTML = this.generateModalHTML(modalId, config);
            
            // Agregar al contenedor
            const container = document.getElementById('modal-container');
            container.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById(modalId);
            const overlay = modal.querySelector('.modal-overlay');
            const content = modal.querySelector('.modal-content');
            
            // Agregar a la lista de modales activos
            this.activeModals.push({ id: modalId, options: config, resolve });
            
            // Configurar eventos
            this.setupModalEvents(modalId, config, resolve);
            
            // Animación de entrada
            requestAnimationFrame(() => {
                modal.classList.add('pointer-events-auto');
                overlay.classList.add('opacity-100');
                content.classList.add('opacity-100', 'scale-100');
                content.classList.remove('opacity-0', 'scale-95');
            });
        });
    }

    setupModalEvents(modalId, config, resolve) {
        const modal = document.getElementById(modalId);
        const overlay = modal.querySelector('.modal-overlay');
        
        // Click en overlay para cerrar (si es dismissible)
        if (config.dismissible) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(modalId, 'dismiss');
                    resolve('dismiss');
                }
            });
        }

        // Eventos de botones
        modal.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.closeModal(modalId, action);
                resolve(action);
            });
        });
    }

    closeModal(modalId, result = 'close') {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const overlay = modal.querySelector('.modal-overlay');
        const content = modal.querySelector('.modal-content');

        // Animación de salida
        overlay.classList.remove('opacity-100');
        content.classList.remove('opacity-100', 'scale-100');
        content.classList.add('opacity-0', 'scale-95');

        setTimeout(() => {
            modal.remove();
            // Remover de la lista de modales activos
            this.activeModals = this.activeModals.filter(m => m.id !== modalId);
        }, 150);

        return result;
    }

    generateModalHTML(modalId, config) {
        const iconHTML = this.getIconHTML(config.icon, config.type);
        const buttonsHTML = this.generateButtonsHTML(config.buttons);
        
        return `
            <div id="${modalId}" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-150 opacity-0"></div>
                
                <div class="modal-content relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all duration-150 opacity-0 scale-95">
                    <!-- Header con icono y título -->
                    <div class="flex items-center p-6 border-b border-gray-200">
                        <div class="flex-shrink-0">
                            ${iconHTML}
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-900">
                                ${config.title}
                            </h3>
                        </div>
                    </div>
                    
                    <!-- Contenido -->
                    <div class="p-6">
                        <p class="text-gray-700 leading-relaxed">
                            ${config.message}
                        </p>
                    </div>
                    
                    <!-- Botones -->
                    <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                        ${buttonsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    generateButtonsHTML(buttons) {
        return buttons.map(button => {
            const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';
            
            let styleClasses;
            switch (button.style) {
                case 'primary':
                    styleClasses = 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
                    break;
                case 'danger':
                    styleClasses = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
                    break;
                case 'success':
                    styleClasses = 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
                    break;
                case 'secondary':
                default:
                    styleClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500';
                    break;
            }
            
            return `<button type="button" data-action="${button.action}" class="${baseClasses} ${styleClasses}">
                ${button.text}
            </button>`;
        }).join('');
    }

    getIconHTML(icon, type) {
        if (icon === false) return '';
        
        const iconClass = 'w-10 h-10';
        let colorClass, svgContent;
        
        switch (type) {
            case 'success':
                colorClass = 'text-green-600';
                svgContent = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
                break;
            case 'error':
                colorClass = 'text-red-600';
                svgContent = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
                break;
            case 'warning':
                colorClass = 'text-yellow-600';
                svgContent = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>`;
                break;
            case 'confirm':
                colorClass = 'text-blue-600';
                svgContent = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
                break;
            case 'info':
            default:
                colorClass = 'text-blue-600';
                svgContent = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
                break;
        }
        
        return `
            <svg class="${iconClass} ${colorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${svgContent}
            </svg>
        `;
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información',
            confirm: '¿Estás seguro?'
        };
        return titles[type] || 'Aviso';
    }

    getDefaultIcon(type) {
        return true; // Por defecto mostrar icono
    }

    getDefaultButtons(type) {
        if (type === 'confirm') {
            return [
                { text: 'Cancelar', action: 'cancel', style: 'secondary' },
                { text: 'Confirmar', action: 'confirm', style: 'danger' }
            ];
        }
        
        return [
            { text: 'Aceptar', action: 'ok', style: 'primary' }
        ];
    }

    // Modal de entrada de texto
    prompt(message, defaultValue = '', title = 'Ingresa un valor', options = {}) {
        const modalId = 'modal-prompt-' + Date.now();
        
        return new Promise((resolve) => {
            const modalHTML = `
                <div id="${modalId}" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-150 opacity-0"></div>
                    
                    <div class="modal-content relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all duration-150 opacity-0 scale-95">
                        <div class="flex items-center p-6 border-b border-gray-200">
                            <div class="flex-shrink-0">
                                ${this.getIconHTML(true, 'info')}
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                            </div>
                        </div>
                        
                        <div class="p-6">
                            <p class="text-gray-700 mb-4">${message}</p>
                            <input type="text" id="prompt-input-${modalId}" value="${defaultValue}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="Ingresa tu respuesta...">
                        </div>
                        
                        <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <button type="button" data-action="cancel" class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500">
                                Cancelar
                            </button>
                            <button type="button" data-action="ok" class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const container = document.getElementById('modal-container');
            container.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById(modalId);
            const overlay = modal.querySelector('.modal-overlay');
            const content = modal.querySelector('.modal-content');
            const input = document.getElementById(`prompt-input-${modalId}`);
            
            // Agregar a la lista de modales activos
            this.activeModals.push({ id: modalId, options: { dismissible: true }, resolve });
            
            // Eventos
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(modalId);
                    resolve(null);
                }
            });
            
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => {
                this.closeModal(modalId);
                resolve(null);
            });
            
            modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
                this.closeModal(modalId);
                resolve(input.value);
            });
            
            // Enter para confirmar
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.closeModal(modalId);
                    resolve(input.value);
                }
            });
            
            // Animación de entrada
            requestAnimationFrame(() => {
                modal.classList.add('pointer-events-auto');
                overlay.classList.add('opacity-100');
                content.classList.add('opacity-100', 'scale-100');
                content.classList.remove('opacity-0', 'scale-95');
                input.focus();
                input.select();
            });
        });
    }

    // Cerrar todos los modales
    closeAllModals() {
        this.activeModals.forEach(modal => {
            this.closeModal(modal.id);
        });
    }

    // Modal de formulario personalizado
    showForm(config) {
        const modalId = 'modal-form-' + Date.now();
        
        return new Promise((resolve) => {
            const fieldsHTML = config.fields.map(field => {
                let inputHTML;
                
                switch (field.type) {
                    case 'text':
                    case 'email':
                    case 'password':
                        inputHTML = `<input type="${field.type}" id="${field.id}" value="${field.value || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
                        break;
                    case 'select':
                        const options = field.options.map(opt => 
                            `<option value="${opt.value}" ${opt.value === field.value ? 'selected' : ''}>${opt.label}</option>`
                        ).join('');
                        inputHTML = `<select id="${field.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                   ${options}
                                 </select>`;
                        break;
                    case 'textarea':
                        inputHTML = `<textarea id="${field.id}" rows="${field.rows || 3}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`;
                        break;
                    case 'checkbox':
                        inputHTML = `<div class="flex items-center">
                                   <input type="checkbox" id="${field.id}" ${field.value ? 'checked' : ''} 
                                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                   <label for="${field.id}" class="ml-2 text-sm text-gray-900">${field.label}</label>
                                 </div>`;
                        break;
                    default:
                        inputHTML = `<input type="text" id="${field.id}" value="${field.value || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">`;
                }
                
                return `
                    <div class="mb-4">
                        ${field.type !== 'checkbox' ? `<label for="${field.id}" class="block text-sm font-medium text-gray-700 mb-1">${field.label}</label>` : ''}
                        ${inputHTML}
                        ${field.description ? `<p class="mt-1 text-xs text-gray-500">${field.description}</p>` : ''}
                    </div>
                `;
            }).join('');
            
            const modalHTML = `
                <div id="${modalId}" class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-150 opacity-0"></div>
                    
                    <div class="modal-content relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto transform transition-all duration-150 opacity-0 scale-95 max-h-[90vh] overflow-y-auto">
                        <div class="flex items-center p-6 border-b border-gray-200">
                            <div class="flex-shrink-0">
                                ${this.getIconHTML(config.icon || true, 'info')}
                            </div>
                            <div class="ml-4">
                                <h3 class="text-lg font-semibold text-gray-900">${config.title}</h3>
                                ${config.description ? `<p class="text-sm text-gray-600 mt-1">${config.description}</p>` : ''}
                            </div>
                        </div>
                        
                        <form id="form-${modalId}" class="p-6">
                            ${fieldsHTML}
                        </form>
                        
                        <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <button type="button" data-action="cancel" class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500">
                                ${config.cancelText || 'Cancelar'}
                            </button>
                            <button type="button" data-action="submit" class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
                                ${config.submitText || 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const container = document.getElementById('modal-container');
            container.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById(modalId);
            const overlay = modal.querySelector('.modal-overlay');
            const content = modal.querySelector('.modal-content');
            const form = document.getElementById(`form-${modalId}`);
            
            this.activeModals.push({ id: modalId, options: { dismissible: true }, resolve });
            
            // Eventos
            const handleSubmit = () => {
                const formData = {};
                config.fields.forEach(field => {
                    const element = document.getElementById(field.id);
                    if (field.type === 'checkbox') {
                        formData[field.id] = element.checked;
                    } else {
                        formData[field.id] = element.value;
                    }
                });
                
                this.closeModal(modalId);
                resolve({ action: 'submit', data: formData });
            };
            
            const handleCancel = () => {
                this.closeModal(modalId);
                resolve({ action: 'cancel', data: null });
            };
            
            // Event listeners
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) handleCancel();
            });
            
            modal.querySelector('[data-action="cancel"]').addEventListener('click', handleCancel);
            modal.querySelector('[data-action="submit"]').addEventListener('click', handleSubmit);
            
            // Submit en form
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSubmit();
            });
            
            // Animación de entrada
            requestAnimationFrame(() => {
                modal.classList.add('pointer-events-auto');
                overlay.classList.add('opacity-100');
                content.classList.add('opacity-100', 'scale-100');
                content.classList.remove('opacity-0', 'scale-95');
                
                // Focus en el primer campo
                const firstInput = form.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            });
        });
    }
}

// Inicializar el gestor de modales
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
    
    // Sobrescribir funciones nativas para usar nuestros modales
    window.originalAlert = window.alert;
    window.originalConfirm = window.confirm;
    window.originalPrompt = window.prompt;
    
    window.alert = (message) => {
        return window.modalManager.info(message);
    };
    
    window.confirm = (message) => {
        return window.modalManager.confirm(message).then(result => result === 'confirm');
    };
    
    window.prompt = (message, defaultValue) => {
        return window.modalManager.prompt(message, defaultValue);
    };
});
