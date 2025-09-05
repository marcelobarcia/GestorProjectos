FROM nginx:alpine

# Instalar certificados y herramientas necesarias
RUN apk add --no-cache ca-certificates curl

# Crear directorio de trabajo
WORKDIR /usr/share/nginx/html

# Copiar todos los archivos de la aplicación
COPY . .

# Crear configuración nginx optimizada
RUN cat > /etc/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain application/javascript text/css application/json;

    server {
        listen 80;
        listen [::]:80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Configuración para Firebase
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
        
        # Manejar preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain charset=UTF-8';
            add_header Content-Length 0;
            return 204;
        }

        # Ruta principal (SPA)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Logs de acceso y errores
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
    }
}
EOF

# Verificar configuración nginx
RUN nginx -t

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
