# =============================================================================
# docker-dev.ps1 — Script de gestão Docker para PowerShell (Windows)
# Uso: .\docker-dev.ps1 [comando]
# =============================================================================

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $ProjectRoot ".env"

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "🐳 $Text" -ForegroundColor Cyan
    Write-Host ("=" * 50) -ForegroundColor DarkGray
}

function Check-Docker {
    try {
        $null = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker não está em execução. Inicia o Docker Desktop." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Docker não encontrado. Instala o Docker Desktop." -ForegroundColor Red
        exit 1
    }
}

function Start-Infra {
    Write-Header "A iniciar MySQL + Redis (infra apenas)"
    Check-Docker
    docker compose -f "$ProjectRoot\docker-compose.yml" up database redis -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Infra a correr:" -ForegroundColor Green
        Write-Host "   MySQL  → localhost:3306" -ForegroundColor White
        Write-Host "   Redis  → localhost:6379" -ForegroundColor White
    }
}

function Start-All {
    Write-Header "A iniciar todos os serviços"
    Check-Docker
    docker compose -f "$ProjectRoot\docker-compose.yml" --profile app up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Todos os serviços a correr:" -ForegroundColor Green
        Write-Host "   Backend   → ${env:BACKEND_URL:-http://localhost:4000}" -ForegroundColor White
        Write-Host "   Frontend  → http://localhost:3000" -ForegroundColor White
        Write-Host "   MySQL     → localhost:3306" -ForegroundColor White
        Write-Host "   Redis     → localhost:6379" -ForegroundColor White
    }
}

function Stop-All {
    Write-Header "A parar todos os serviços"
    Check-Docker
    docker compose -f "$ProjectRoot\docker-compose.yml" down
    Write-Host "✅ Serviços parados." -ForegroundColor Green
}

function Show-Status {
    Write-Header "Estado dos serviços"
    Check-Docker
    docker compose -f "$ProjectRoot\docker-compose.yml" ps
}

function Show-Logs {
    param([string]$Service = "")
    Write-Header "Logs"
    Check-Docker
    if ($Service) {
        docker compose -f "$ProjectRoot\docker-compose.yml" logs -f $Service
    } else {
        docker compose -f "$ProjectRoot\docker-compose.yml" logs -f
    }
}

function Reset-DB {
    Write-Header "⚠️  A APAGAR e recriar a base de dados"
    $confirm = Read-Host "Tens a certeza? Isto apaga TODOS os dados. (s/N)"
    if ($confirm -ne "s") {
        Write-Host "Cancelado." -ForegroundColor Yellow
        return
    }
    Check-Docker
    docker compose -f "$ProjectRoot\docker-compose.yml" down -v
    docker compose -f "$ProjectRoot\docker-compose.yml" up database -d
    Write-Host "✅ Base de dados recriada." -ForegroundColor Green
}

function Open-MySQL {
    Write-Header "A abrir MySQL shell"
    Check-Docker
    $dbName = if (Test-Path $EnvFile) {
        (Get-Content $EnvFile | Where-Object { $_ -match "^DB_NAME=" }) -replace "^DB_NAME=", ""
    } else { "ecommerce" }
    docker compose -f "$ProjectRoot\docker-compose.yml" exec database mysql -u ecommerce_user -p $dbName
}

function Show-Help {
    Write-Host ""
    Write-Host "🐳 E-Commerce Docker Manager (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\docker-dev.ps1 <comando>" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
    Write-Host "  infra     - Inicia MySQL + Redis (para dev local sem Docker backend/frontend)"
    Write-Host "  up        - Inicia todos os serviços (MySQL, Redis, Backend, Frontend)"
    Write-Host "  down      - Para todos os serviços"
    Write-Host "  status    - Mostra o estado dos containers"
    Write-Host "  logs      - Mostra logs de todos os serviços"
    Write-Host "  logs <s>  - Mostra logs de um serviço específico (ex: logs backend)"
    Write-Host "  mysql     - Abre shell MySQL interactivo"
    Write-Host "  reset-db  - ⚠️  Apaga e recria a base de dados (perde dados!)"
    Write-Host "  help      - Mostra esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Green
    Write-Host "  .\docker-dev.ps1 infra       # Dev local: só DB + Redis"
    Write-Host "  .\docker-dev.ps1 up          # Tudo via Docker"
    Write-Host "  .\docker-dev.ps1 logs backend"
}

# Dispatcher
switch ($Command.ToLower()) {
    "infra"    { Start-Infra }
    "up"       { Start-All }
    "down"     { Stop-All }
    "status"   { Show-Status }
    "logs"     {
        $svc = if ($args.Count -gt 0) { $args[0] } else { "" }
        Show-Logs $svc
    }
    "mysql"    { Open-MySQL }
    "reset-db" { Reset-DB }
    default    { Show-Help }
}
