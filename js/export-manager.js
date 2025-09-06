// Gestor de Exportaciones
class ExportManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('export-excel-btn')?.addEventListener('click', () => this.exportToExcel());
        document.getElementById('export-pdf-btn')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('export-gantt-pdf-btn')?.addEventListener('click', () => this.exportGanttToPDF());
    }

    // Obtener datos actuales del proyecto
    getCurrentProjectData() {
        const projectName = document.getElementById('project-name-input')?.value || 'Mi Proyecto';
        
        // Intentar obtener el proyecto activo con múltiples métodos
        let activeProject = null;
        
        // Método 1: Usar la función getActiveProject() si está disponible
        if (typeof getActiveProject === 'function') {
            activeProject = getActiveProject();
        }
        
        // Método 2: Usar variables globales como fallback
        if (!activeProject && typeof projects !== 'undefined' && typeof activeProjectId !== 'undefined') {
            activeProject = projects.find(p => p.id === activeProjectId);
        }
        
        // Método 3: Tomar el primer proyecto disponible
        if (!activeProject && typeof projects !== 'undefined' && projects.length > 0) {
            activeProject = projects[0];
        }
        
        const tasks = activeProject?.tasks || [];
        const resources = activeProject?.resources || [];
        
        // Debug: mostrar información del proyecto activo
        console.log('Método de exportación - Proyecto activo:', activeProject);
        console.log('Tareas encontradas:', tasks);
        console.log('Recursos encontrados:', resources);
        
        return {
            projectName,
            tasks,
            resources,
            exportDate: new Date().toLocaleDateString('es-ES')
        };
    }

    // Preparar datos para exportación
    prepareTaskDataForExport() {
        const { tasks, resources } = this.getCurrentProjectData();
        
        if (!tasks || tasks.length === 0) {
            console.warn('No hay tareas para exportar');
            return [];
        }
        
        return tasks.map(task => {
            const resource = resources.find(r => r.id === task.resourceId);
            
            // Manejar diferentes formatos de fecha
            let startDate, endDate;
            
            if (task.startDate) {
                startDate = new Date(task.startDate);
            } else if (task.start) {
                startDate = new Date(task.start);
            } else {
                startDate = new Date();
            }
            
            if (task.endDate) {
                endDate = new Date(task.endDate);
            } else if (task.end) {
                endDate = new Date(task.end);
            } else {
                // Calcular fecha de fin basada en duración
                endDate = new Date(startDate);
                const duration = task.duration || 1;
                endDate.setDate(startDate.getDate() + duration - 1);
            }
            
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            return {
                'Nombre': task.name || 'Sin nombre',
                'Tipo': task.type === 'task' ? 'Actividad' : task.type === 'phase' ? 'Fase' : 'Elemento',
                'Fecha Inicio': startDate.toLocaleDateString('es-ES'),
                'Fecha Fin': endDate.toLocaleDateString('es-ES'),
                'Duración (días)': duration,
                'Progreso (%)': task.progress || 0,
                'Estado': task.status || 'Pendiente',
                'Recurso Asignado': resource?.name || 'Sin asignar',
                'Es Hito': (task.milestone || task.isMilestone) ? 'Sí' : 'No',
                'Predecesora': task.predecessorId ? tasks.find(t => t.id === task.predecessorId)?.name || '' : ''
            };
        });
    }

    // Exportar a Excel
    async exportToExcel() {
        try {
            const { projectName, resources, exportDate } = this.getCurrentProjectData();
            const taskData = this.prepareTaskDataForExport();

            console.log('Datos del proyecto para exportar:', {
                projectName,
                resources: resources.length,
                tasks: taskData.length,
                taskData: taskData
            });

            if (taskData.length === 0) {
                this.showErrorMessage('No hay tareas para exportar');
                return;
            }

            // Crear workbook
            const wb = XLSX.utils.book_new();

            // Hoja de tareas
            const wsData = [
                [`Proyecto: ${projectName}`],
                [`Fecha de Exportación: ${exportDate}`],
                [], // Fila vacía
                ['LISTADO DE TAREAS Y ACTIVIDADES'],
                [] // Fila vacía
            ];

            // Agregar headers
            if (taskData.length > 0) {
                wsData.push(Object.keys(taskData[0]));
                
                // Agregar datos de tareas
                taskData.forEach(task => {
                    wsData.push(Object.values(task));
                });
            }

            // Agregar información de recursos
            wsData.push([], ['RECURSOS DEL PROYECTO'], []);
            if (resources.length > 0) {
                wsData.push(['Nombre', 'Rol']);
                resources.forEach(resource => {
                    wsData.push([resource.name, resource.role || 'Sin especificar']);
                });
            }

            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Ajustar ancho de columnas
            const colWidths = [
                { wch: 25 }, // Nombre
                { wch: 12 }, // Tipo
                { wch: 12 }, // Fecha Inicio
                { wch: 12 }, // Fecha Fin
                { wch: 15 }, // Duración
                { wch: 12 }, // Progreso
                { wch: 12 }, // Estado
                { wch: 20 }, // Recurso
                { wch: 10 }, // Es Hito
                { wch: 20 }  // Predecesora
            ];
            ws['!cols'] = colWidths;

            // Agregar hoja al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

            // Descargar archivo
            const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Cronograma.xlsx`;
            XLSX.writeFile(wb, fileName);

            this.showSuccessMessage('Excel exportado correctamente');

        } catch (error) {
            console.error('Error exportando a Excel:', error);
            this.showErrorMessage('Error al exportar a Excel');
        }
    }

    // Exportar a PDF
    async exportToPDF() {
        try {
            const { projectName, exportDate } = this.getCurrentProjectData();
            const taskData = this.prepareTaskDataForExport();

            console.log('Datos para PDF:', {
                projectName,
                tasks: taskData.length,
                taskData: taskData
            });

            if (taskData.length === 0) {
                this.showErrorMessage('No hay tareas para exportar');
                return;
            }

            // Crear nuevo documento PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');

            // Configuración de fuente
            doc.setFont('helvetica');
            
            // Título
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text(`Cronograma del Proyecto: ${projectName}`, 20, 20);
            
            // Fecha
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Fecha de exportación: ${exportDate}`, 20, 30);

            // Línea separadora
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 200, 200);
            doc.line(20, 35, 277, 35);

            // Tabla de tareas
            let yPosition = 45;
            
            if (taskData.length > 0) {
                // Headers de la tabla
                doc.setFontSize(8);
                doc.setTextColor(40, 40, 40);
                doc.setFont('helvetica', 'bold');
                
                const headers = ['Nombre', 'Tipo', 'Inicio', 'Fin', 'Duración', 'Progreso', 'Estado', 'Recurso'];
                const colWidths = [45, 20, 20, 20, 20, 18, 20, 30];
                let xPosition = 20;

                // Dibujar headers
                headers.forEach((header, index) => {
                    doc.rect(xPosition, yPosition - 5, colWidths[index], 8, 'F');
                    doc.setFillColor(240, 240, 240);
                    doc.text(header, xPosition + 2, yPosition);
                    xPosition += colWidths[index];
                });

                yPosition += 8;
                doc.setFont('helvetica', 'normal');

                // Dibujar filas de datos
                taskData.forEach((task, index) => {
                    if (yPosition > 180) { // Nueva página si es necesario
                        doc.addPage();
                        yPosition = 20;
                    }

                    xPosition = 20;
                    const rowData = [
                        task['Nombre'].substring(0, 30),
                        task['Tipo'],
                        task['Fecha Inicio'],
                        task['Fecha Fin'],
                        `${task['Duración (días)']}d`,
                        `${task['Progreso (%)']}%`,
                        task['Estado'],
                        task['Recurso Asignado'].substring(0, 20)
                    ];

                    // Alternar color de fila
                    if (index % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(20, yPosition - 5, 213, 6, 'F');
                    }

                    rowData.forEach((data, colIndex) => {
                        doc.text(String(data), xPosition + 2, yPosition);
                        xPosition += colWidths[colIndex];
                    });

                    yPosition += 6;
                });

                // Resumen del proyecto
                yPosition += 10;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.text('Resumen del Proyecto:', 20, yPosition);
                
                yPosition += 8;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                
                const totalTasks = taskData.length;
                const completedTasks = taskData.filter(t => t['Progreso (%)'] === 100).length;
                const avgProgress = totalTasks > 0 ? Math.round(taskData.reduce((sum, t) => sum + t['Progreso (%)'], 0) / totalTasks) : 0;

                doc.text(`• Total de tareas: ${totalTasks}`, 25, yPosition);
                yPosition += 5;
                doc.text(`• Tareas completadas: ${completedTasks}`, 25, yPosition);
                yPosition += 5;
                doc.text(`• Progreso promedio: ${avgProgress}%`, 25, yPosition);
            }

            // Pie de página
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Página ${i} de ${pageCount}`, 250, 200);
            }

            // Descargar PDF
            const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Cronograma.pdf`;
            doc.save(fileName);

            this.showSuccessMessage('PDF generado correctamente');

        } catch (error) {
            console.error('Error exportando a PDF:', error);
            this.showErrorMessage('Error al generar PDF');
        }
    }

    // Capturar el Gantt visual como imagen y agregarlo al PDF
    async exportGanttToPDF() {
        try {
            const { projectName, exportDate } = this.getCurrentProjectData();
            
            // Capturar el área del Gantt
            const ganttContainer = document.getElementById('gantt-container');
            if (!ganttContainer) {
                throw new Error('No se encontró el contenedor del Gantt');
            }

            // Crear canvas del Gantt
            const canvas = await html2canvas(ganttContainer, {
                scale: 1,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff'
            });

            // Crear PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape', 'mm', 'a4');

            // Título
            doc.setFontSize(16);
            doc.text(`Diagrama de Gantt - ${projectName}`, 20, 20);
            doc.setFontSize(10);
            doc.text(`Exportado el: ${exportDate}`, 20, 30);

            // Calcular dimensiones para ajustar la imagen
            const imgWidth = 257; // Ancho máximo en mm para A4 landscape
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Agregar imagen del Gantt
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 20, 40, imgWidth, Math.min(imgHeight, 150));

            // Descargar
            const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_Gantt.pdf`;
            doc.save(fileName);

            this.showSuccessMessage('Gantt exportado como PDF');

        } catch (error) {
            console.error('Error exportando Gantt:', error);
            this.showErrorMessage('Error al exportar Gantt');
        }
    }

    // Mensajes de feedback
    showSuccessMessage(message) {
        // Crear toast de éxito
        this.showToast(message, 'success');
    }

    showErrorMessage(message) {
        // Crear toast de error
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
        
        // Estilo según tipo
        if (type === 'success') {
            toast.classList.add('bg-green-600');
        } else if (type === 'error') {
            toast.classList.add('bg-red-600');
        } else {
            toast.classList.add('bg-blue-600');
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.exportManager = new ExportManager();
});
