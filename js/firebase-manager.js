// Firebase integration for Project Manager
class FirebaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.initPromise = this.waitForFirebase();
    }

    async waitForFirebase() {
        // Esperar a que Firebase esté disponible
        while (!window.firestoreDb) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.db = window.firestoreDb;
        this.isInitialized = true;
        console.log('Firebase initialized successfully');
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initPromise;
        }
    }

    // Obtener el ID del usuario actual
    getCurrentUserId() {
        if (window.currentUser) {
            return window.currentUser.uid;
        }
        return 'anonymous-' + (localStorage.getItem('anonymousId') || this.generateAnonymousId());
    }

    generateAnonymousId() {
        const id = 'anon-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('anonymousId', id);
        return id;
    }

    // Guardar todos los proyectos del usuario actual
    async saveProjects(projects) {
        try {
            await this.ensureInitialized();
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const userId = this.getCurrentUserId();
            const projectsRef = doc(this.db, 'userProjects', userId);
            await setDoc(projectsRef, {
                projects: projects,
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                userId: userId
            });
            
            console.log(`Projects saved to Firebase for user: ${userId}`);
            return true;
        } catch (error) {
            console.error('Error saving projects to Firebase:', error);
            return false;
        }
    }

    // Cargar todos los proyectos del usuario actual
    async loadProjects() {
        try {
            await this.ensureInitialized();
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const userId = this.getCurrentUserId();
            const projectsRef = doc(this.db, 'userProjects', userId);
            const docSnap = await getDoc(projectsRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log(`Projects loaded from Firebase for user: ${userId}`);
                return data.projects || [];
            } else {
                console.log(`No projects found in Firebase for user: ${userId}`);
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
