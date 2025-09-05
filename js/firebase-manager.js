// Firebase integration for Project Manager
class FirebaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.initPromise = this.waitForFirebase();
    }

    async waitForFirebase() {
        // Esperar a que Firebase esté disponible
        let attempts = 0;
        while (!window.firestoreDb && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.firestoreDb) {
            this.db = window.firestoreDb;
            this.isInitialized = true;
            console.log('✅ Firebase conectado exitosamente');
        } else {
            console.warn('⚠️ Firebase no disponible, trabajando en modo offline');
            this.isInitialized = false;
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initPromise;
        }
        return this.isInitialized;
    }

    // Guardar todos los proyectos
    async saveProjects(projects) {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                console.warn('⚠️ Firebase no disponible, datos guardados localmente');
                return false;
            }

            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectsRef = doc(this.db, 'gestorProyectos', 'allProjects');
            await setDoc(projectsRef, {
                projects: projects,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            });
            
            console.log('✅ Proyectos guardados en Firebase');
            return true;
        } catch (error) {
            console.warn('⚠️ Error guardando en Firebase:', error.message);
            return false;
        }
    }
    }

    // Cargar todos los proyectos
    async loadProjects() {
        try {
            await this.ensureInitialized();
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectsRef = doc(this.db, 'gestorProyectos', 'allProjects');
            const docSnap = await getDoc(projectsRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('Projects loaded from Firebase successfully');
                return data.projects || [];
            } else {
                console.log('No projects found in Firebase');
                return [];
            }
        } catch (error) {
            console.error('Error loading projects from Firebase:', error);
            return [];
        }
    }

    // Guardar un proyecto específico
    async saveProject(project) {
        try {
            await this.ensureInitialized();
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectRef = doc(this.db, 'proyectos', project.id.toString());
            await setDoc(projectRef, {
                ...project,
                lastUpdated: new Date().toISOString()
            });
            
            console.log(`Project ${project.name} saved to Firebase successfully`);
            return true;
        } catch (error) {
            console.error('Error saving project to Firebase:', error);
            return false;
        }
    }

    // Cargar un proyecto específico
    async loadProject(projectId) {
        try {
            await this.ensureInitialized();
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectRef = doc(this.db, 'proyectos', projectId.toString());
            const docSnap = await getDoc(projectRef);
            
            if (docSnap.exists()) {
                console.log(`Project ${projectId} loaded from Firebase successfully`);
                return docSnap.data();
            } else {
                console.log(`Project ${projectId} not found in Firebase`);
                return null;
            }
        } catch (error) {
            console.error('Error loading project from Firebase:', error);
            return null;
        }
    }

    // Eliminar un proyecto
    async deleteProject(projectId) {
        try {
            await this.ensureInitialized();
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectRef = doc(this.db, 'proyectos', projectId.toString());
            await deleteDoc(projectRef);
            
            console.log(`Project ${projectId} deleted from Firebase successfully`);
            return true;
        } catch (error) {
            console.error('Error deleting project from Firebase:', error);
            return false;
        }
    }

    // Crear backup automático
    async createBackup() {
        try {
            await this.ensureInitialized();
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const backupRef = doc(this.db, 'backups', new Date().toISOString());
            await setDoc(backupRef, {
                projects: projects,
                timestamp: new Date().toISOString(),
                type: 'auto-backup'
            });
            
            console.log('Backup created successfully');
            return true;
        } catch (error) {
            console.error('Error creating backup:', error);
            return false;
        }
    }

    // Mostrar estado de conexión
    async getConnectionStatus() {
        try {
            await this.ensureInitialized();
            return {
                connected: true,
                database: 'Firestore',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Instancia global del manager de Firebase
const firebaseManager = new FirebaseManager();
