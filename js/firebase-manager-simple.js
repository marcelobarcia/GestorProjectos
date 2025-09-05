// Firebase integration for Project Manager - Versión simplificada
class FirebaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.initPromise = this.waitForFirebase();
    }

    async waitForFirebase() {
        // Esperar a que Firebase esté disponible
        let attempts = 0;
        while (!window.firestoreDb && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 200));
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
                console.warn('⚠️ Trabajando offline - datos en localStorage');
                return false;
            }

            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectsRef = doc(this.db, 'gestorProyectos', 'allProjects');
            await setDoc(projectsRef, {
                projects: projects,
                lastUpdated: new Date().toISOString(),
                version: '1.0'
            });
            
            console.log('✅ Proyectos guardados en Firebase correctamente');
            return true;
        } catch (error) {
            console.warn('⚠️ Error con Firebase:', error.message, '- usando localStorage');
            return false;
        }
    }

    // Cargar proyectos desde Firebase
    async loadProjects() {
        try {
            const isReady = await this.ensureInitialized();
            if (!isReady) {
                return null;
            }

            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
            
            const projectsRef = doc(this.db, 'gestorProyectos', 'allProjects');
            const docSnap = await getDoc(projectsRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log('✅ Proyectos cargados desde Firebase');
                return data.projects || [];
            } else {
                console.log('ℹ️ No hay proyectos guardados en Firebase');
                return [];
            }
        } catch (error) {
            console.warn('⚠️ Error cargando desde Firebase:', error.message);
            return null;
        }
    }

    // Verificar estado de conexión
    async getConnectionStatus() {
        const isReady = await this.ensureInitialized();
        return {
            connected: isReady,
            message: isReady ? 'Conectado a Firebase' : 'Trabajando offline'
        };
    }
}

// Exportar para uso global
window.FirebaseManager = FirebaseManager;
