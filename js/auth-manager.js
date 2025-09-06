// Gestor de Autenticación
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    async initializeAuth() {
        // Esperar a que Firebase esté listo
        await this.waitForFirebase();
        
        // Configurar el listener de cambios de autenticación
        window.onAuthStateChanged(window.firebaseAuth, (user) => {
            this.currentUser = user;
            this.handleAuthStateChange(user);
        });

        this.setupEventListeners();
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.firebaseReady && window.firebaseAuth) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailLogin();
        });

        // Google login
        document.getElementById('google-login')?.addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        // Guest login
        document.getElementById('guest-login')?.addEventListener('click', () => {
            this.handleGuestLogin();
        });

        // Register link
        document.getElementById('register-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleLoginRegister();
        });

        // Forgot password
        document.getElementById('forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    async handleEmailLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isRegister = document.getElementById('login-form').dataset.mode === 'register';

        if (!email || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        this.setLoading(true);

        try {
            let userCredential;
            
            if (isRegister) {
                userCredential = await window.createUserWithEmailAndPassword(window.firebaseAuth, email, password);
                this.showSuccess('Cuenta creada exitosamente');
            } else {
                userCredential = await window.signInWithEmailAndPassword(window.firebaseAuth, email, password);
                this.showSuccess('Inicio de sesión exitoso');
            }

            console.log('Usuario autenticado:', userCredential.user);
            
        } catch (error) {
            console.error('Error en autenticación:', error);
            this.handleAuthError(error);
        } finally {
            this.setLoading(false);
        }
    }

    async handleGoogleLogin() {
        this.setLoading(true);
        
        try {
            const result = await window.signInWithPopup(window.firebaseAuth, window.googleProvider);
            const user = result.user;
            
            this.showSuccess(`Bienvenido, ${user.displayName || user.email}`);
            console.log('Usuario Google autenticado:', user);
            
        } catch (error) {
            console.error('Error en login con Google:', error);
            this.handleAuthError(error);
        } finally {
            this.setLoading(false);
        }
    }

    async handleGuestLogin() {
        this.setLoading(true);
        
        try {
            const result = await window.signInAnonymously(window.firebaseAuth);
            const user = result.user;
            
            this.showSuccess('Sesión de invitado iniciada');
            console.log('Usuario invitado autenticado:', user);
            
        } catch (error) {
            console.error('Error en login de invitado:', error);
            this.handleAuthError(error);
        } finally {
            this.setLoading(false);
        }
    }

    toggleLoginRegister() {
        const form = document.getElementById('login-form');
        const button = document.getElementById('login-button-text');
        const registerLink = document.getElementById('register-link');
        
        if (form.dataset.mode === 'register') {
            // Cambiar a modo login
            form.dataset.mode = 'login';
            button.textContent = 'Iniciar sesión';
            registerLink.textContent = 'Regístrate aquí';
            document.querySelector('h2').textContent = 'Gestor de Proyectos';
            document.querySelector('p').textContent = 'Inicia sesión para acceder a tus proyectos';
        } else {
            // Cambiar a modo registro
            form.dataset.mode = 'register';
            button.textContent = 'Crear cuenta';
            registerLink.textContent = 'Ya tengo cuenta';
            document.querySelector('h2').textContent = 'Crear cuenta';
            document.querySelector('p').textContent = 'Regístrate para empezar a gestionar tus proyectos';
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('👤 User authenticated:', user.email);
            
            // Usuario autenticado - mostrar app y luego inicializar
            this.showMainApp();
            
            // Guardar datos del usuario
            this.saveUserSession(user);
            
        } else {
            console.log('🚫 User not authenticated');
            // Usuario no autenticado - mostrar login
            this.showLoginScreen();
        }
    }

    clearPreviousUserData() {
        console.log('🧹 Clearing previous user data...');
        
        // Resetear event listeners flag
        if (typeof resetEventListeners === 'function') {
            resetEventListeners();
        }
        
        // Limpiar datos del usuario anterior
        if (typeof projects !== 'undefined') {
            console.log('📦 Clearing projects array, previous count:', projects.length);
            projects.length = 0; // Limpiar array de proyectos
        }
        if (typeof activeProjectId !== 'undefined') {
            console.log('🎯 Clearing active project ID, previous value:', activeProjectId);
            activeProjectId = null; // Resetear proyecto activo
        }
        
        // Limpiar almacenamiento local
        localStorage.removeItem('projects');
        localStorage.removeItem('activeProjectId');
        
        // Limpiar estado visual
        const projectNameInput = document.getElementById('project-name-input');
        if (projectNameInput) {
            projectNameInput.value = '';
        }
        
        console.log('✅ Previous user data cleared completely');
    }

    showMainApp() {
        console.log('🏠 Showing main app...');
        
        // Limpiar datos del usuario anterior
        this.clearPreviousUserData();
        
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Mostrar información del usuario en el header
        this.updateUserInfo();
        
        // Forzar reinicialización completa de la aplicación para el nuevo usuario
        setTimeout(async () => {
            console.log('⏰ Starting app initialization...');
            if (typeof initializeApp === 'function') {
                console.log('🚀 Calling initializeApp for authenticated user...');
                await initializeApp();
            } else {
                console.warn('⚠️ initializeApp function not found');
                // Fallback: buscar otras funciones de inicialización
                setTimeout(async () => {
                    if (typeof initializeApp === 'function') {
                        console.log('🔄 Fallback: Calling initializeApp...');
                        await initializeApp();
                    } else {
                        console.error('❌ initializeApp function still not found');
                    }
                }, 500);
            }
        }, 200); // Increased timeout to ensure DOM is ready
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    saveUserSession(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isAnonymous: user.isAnonymous,
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('userSession', JSON.stringify(userData));
        
        // Hacer disponible globalmente
        window.currentUser = user;
    }

    updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (!userInfo || !this.currentUser) return;
        
        const user = this.currentUser;
        
        // Mostrar información del usuario
        userInfo.classList.remove('hidden');
        userInfo.classList.add('flex');
        
        // Avatar
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.classList.remove('hidden');
        } else {
            // Avatar por defecto
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'Usuario')}&background=3b82f6&color=fff&size=32`;
            userAvatar.classList.remove('hidden');
        }
        
        // Nombre del usuario
        if (user.isAnonymous) {
            userName.textContent = 'Invitado';
        } else {
            userName.textContent = user.displayName || user.email || 'Usuario';
        }
    }

    async logout() {
        try {
            console.log('🚪 Starting logout process...');
            
            // Limpiar datos del usuario actual antes de cerrar sesión
            this.clearPreviousUserData();
            
            await window.signOut(window.firebaseAuth);
            localStorage.removeItem('userSession');
            window.currentUser = null;
            this.currentUser = null;
            
            console.log('✅ Logout completed successfully');
            this.showSuccess('Sesión cerrada correctamente');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            this.showError('Error al cerrar sesión');
        }
    }

    handleAuthError(error) {
        let message = 'Error de autenticación';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/email-already-in-use':
                message = 'El email ya está en uso';
                break;
            case 'auth/weak-password':
                message = 'La contraseña debe tener al menos 6 caracteres';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Ventana de autenticación cerrada';
                break;
            default:
                message = error.message || 'Error desconocido';
        }
        
        this.showError(message);
    }

    handleForgotPassword() {
        const email = document.getElementById('email').value;
        
        if (!email) {
            this.showError('Ingresa tu email para recuperar la contraseña');
            return;
        }
        
        // Aquí podrías implementar el reset de contraseña
        this.showInfo('Funcionalidad de recuperación de contraseña próximamente');
    }

    setLoading(loading) {
        const button = document.querySelector('#login-form button[type="submit"]');
        const buttonText = document.getElementById('login-button-text');
        const spinner = document.getElementById('login-spinner');
        
        if (loading) {
            button.disabled = true;
            buttonText.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }

    // Métodos de notificación
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full max-w-sm`;
        
        // Estilo según tipo
        if (type === 'success') {
            notification.classList.add('bg-green-600');
        } else if (type === 'error') {
            notification.classList.add('bg-red-600');
        } else {
            notification.classList.add('bg-blue-600');
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remover después de 4 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Método para obtener información del usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Método para verificar si el usuario está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
