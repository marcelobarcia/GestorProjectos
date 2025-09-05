# Script de despliegue para Gestor de Proyectos
param(
    [string]$Action = "deploy"
)

Write-Host "🚀 Gestor de Proyectos - Firebase + Docker" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

switch ($Action.ToLower()) {
    "deploy" {
        Write-Host "📦 Iniciando despliegue..." -ForegroundColor Yellow
        
        # Verificar Docker
        try {
            docker --version | Out-Null
            Write-Host "✅ Docker detectado" -ForegroundColor Green
        } catch {
            Write-Host "❌ Docker no encontrado. Instala Docker Desktop primero." -ForegroundColor Red
            exit 1
        }

        # Detener contenedores existentes
        Write-Host "🛑 Deteniendo contenedores existentes..." -ForegroundColor Yellow
        docker-compose down 2>$null

        # Construir imagen
        Write-Host "🔨 Construyendo imagen..." -ForegroundColor Cyan
        docker-compose build --no-cache

        if ($LASTEXITCODE -eq 0) {
            # Iniciar servicios
            Write-Host "🎬 Iniciando servicios..." -ForegroundColor Green
            docker-compose up -d

            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ ¡Despliegue exitoso!" -ForegroundColor Green
                Write-Host "🌐 Aplicación disponible en: http://localhost:3000" -ForegroundColor Cyan
                Write-Host "🔧 Firebase configurado con tu proyecto gestorproyectos-f8642" -ForegroundColor Blue
                Write-Host ""
                Write-Host "📊 Estado de contenedores:" -ForegroundColor Magenta
                docker-compose ps
            } else {
                Write-Host "❌ Error iniciando servicios" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Error construyendo imagen" -ForegroundColor Red
        }
    }
    
    "logs" {
        Write-Host "📝 Mostrando logs..." -ForegroundColor Yellow
        docker-compose logs -f
    }
    
    "stop" {
        Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    }
    
    "restart" {
        Write-Host "🔄 Reiniciando servicios..." -ForegroundColor Yellow
        docker-compose restart
        Write-Host "✅ Servicios reiniciados" -ForegroundColor Green
    }
    
    "status" {
        Write-Host "📊 Estado de servicios:" -ForegroundColor Blue
        docker-compose ps
    }
    
    default {
        Write-Host "Uso: .\deploy.ps1 [deploy|logs|stop|restart|status]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Comandos disponibles:" -ForegroundColor Cyan
        Write-Host "  deploy  - Construir y desplegar la aplicación" -ForegroundColor White
        Write-Host "  logs    - Ver logs en tiempo real" -ForegroundColor White
        Write-Host "  stop    - Detener todos los servicios" -ForegroundColor White
        Write-Host "  restart - Reiniciar servicios" -ForegroundColor White
        Write-Host "  status  - Ver estado de contenedores" -ForegroundColor White
    }
}
