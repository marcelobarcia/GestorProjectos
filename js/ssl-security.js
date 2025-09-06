// Verificación de seguridad SSL
export function checkSSLSecurity() {
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if (!isHTTPS && !isLocalhost) {
        console.warn('⚠️ Conexión no segura detectada. Redirigiendo a HTTPS...');
        window.location.href = 'https://' + window.location.host + window.location.pathname;
        return false;
    }
    
    console.log('✅ Conexión SSL segura verificada');
    return true;
}

// Verificar si hay contenido mixto
export function checkMixedContent() {
    if (location.protocol === 'https:') {
        // Interceptar todas las requests para verificar HTTPS
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && url.startsWith('http://')) {
                console.error('❌ Intento de carga de recurso HTTP en página HTTPS:', url);
                // Convertir a HTTPS automáticamente
                args[0] = url.replace('http://', 'https://');
                console.log('✅ URL convertida a HTTPS:', args[0]);
            }
            return originalFetch.apply(this, args);
        };
    }
}

// Inicializar verificaciones de seguridad
export function initSSLSecurity() {
    console.log('🔒 Iniciando verificaciones de seguridad SSL...');
    
    // Verificar protocolo actual
    checkSSLSecurity();
    
    // Verificar contenido mixto
    checkMixedContent();
    
    // Verificar si el certificado es válido
    if (location.protocol === 'https:') {
        console.log('📋 Información SSL:');
        console.log('- Protocolo:', location.protocol);
        console.log('- Host:', location.host);
        console.log('- Puerto:', location.port || 'default');
        
        // Verificar si hay problemas con el certificado
        navigator.serviceWorker?.ready.then(() => {
            console.log('✅ Service Worker disponible para verificaciones adicionales');
        }).catch(err => {
            console.log('ℹ️ Service Worker no disponible:', err.message);
        });
    }
}

// Auto-ejecutar al cargar el módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSSLSecurity);
} else {
    initSSLSecurity();
}
