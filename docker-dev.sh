#!/usr/bin/env bash
# =============================================================================
# docker-dev.sh — Script de gestão Docker para WSL/Linux/macOS
# Uso: ./docker-dev.sh [comando]
# =============================================================================

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

header() { echo -e "\n${CYAN}🐳 $1${NC}\n$(printf '=%.0s' {1..50})"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error()   { echo -e "${RED}❌ $1${NC}"; exit 1; }

check_docker() {
    if ! docker info &>/dev/null; then
        error "Docker não está em execução. Inicia o Docker Desktop ou o serviço Docker."
    fi
}

cmd_infra() {
    header "A iniciar MySQL + Redis (infra apenas)"
    check_docker
    docker compose -f "$COMPOSE_FILE" up database redis -d
    success "Infra a correr:"
    echo "   MySQL  → localhost:3306"
    echo "   Redis  → localhost:6379"
}

cmd_up() {
    header "A iniciar todos os serviços"
    check_docker
    docker compose -f "$COMPOSE_FILE" --profile app up -d
    success "Todos os serviços a correr:"
    echo "   Backend   → ${VITE_API_URL:-http://localhost:4000}"
    echo "   Frontend  → http://localhost:3000"
    echo "   MySQL     → localhost:3306"
    echo "   Redis     → localhost:6379"
}

cmd_down() {
    header "A parar todos os serviços"
    check_docker
    docker compose -f "$COMPOSE_FILE" down
    success "Serviços parados."
}

cmd_status() {
    header "Estado dos serviços"
    check_docker
    docker compose -f "$COMPOSE_FILE" ps
}

cmd_logs() {
    header "Logs"
    check_docker
    if [ -n "${2:-}" ]; then
        docker compose -f "$COMPOSE_FILE" logs -f "$2"
    else
        docker compose -f "$COMPOSE_FILE" logs -f
    fi
}

cmd_mysql() {
    header "A abrir MySQL shell"
    check_docker
    DB_NAME=$(grep "^DB_NAME=" "$PROJECT_ROOT/backend/.env" 2>/dev/null | cut -d= -f2 || echo "ecommerce")
    docker compose -f "$COMPOSE_FILE" exec database mysql -u ecommerce_user -p "$DB_NAME"
}

cmd_reset_db() {
    header "⚠️  A APAGAR e recriar a base de dados"
    warning "Isto apaga TODOS os dados locais!"
    read -rp "Tens a certeza? (s/N): " confirm
    if [[ "$confirm" != "s" ]]; then
        echo "Cancelado."
        return
    fi
    check_docker
    docker compose -f "$COMPOSE_FILE" down -v
    docker compose -f "$COMPOSE_FILE" up database -d
    success "Base de dados recriada."
}

cmd_help() {
    echo -e "\n${CYAN}🐳 E-Commerce Docker Manager (WSL/Linux)${NC}\n"
    echo "Uso: ./docker-dev.sh <comando>"
    echo ""
    echo -e "${YELLOW}Comandos disponíveis:${NC}"
    echo "  infra      Inicia MySQL + Redis (para dev local)"
    echo "  up         Inicia todos os serviços"
    echo "  down       Para todos os serviços"
    echo "  status     Mostra o estado dos containers"
    echo "  logs       Mostra logs (todos ou de um serviço: logs backend)"
    echo "  mysql      Abre shell MySQL interactivo"
    echo "  reset-db   ⚠️  Apaga e recria a base de dados"
    echo "  help       Mostra esta ajuda"
    echo ""
    echo -e "${GREEN}Exemplos:${NC}"
    echo "  ./docker-dev.sh infra         # Dev local: só DB + Redis"
    echo "  ./docker-dev.sh up            # Tudo via Docker"
    echo "  ./docker-dev.sh logs backend  # Logs do backend"
}

COMMAND="${1:-help}"

case "$COMMAND" in
    infra)    cmd_infra ;;
    up)       cmd_up ;;
    down)     cmd_down ;;
    status)   cmd_status ;;
    logs)     cmd_logs "$@" ;;
    mysql)    cmd_mysql ;;
    reset-db) cmd_reset_db ;;
    help|*)   cmd_help ;;
esac
