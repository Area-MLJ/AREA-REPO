#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.web.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Wrapper docker compose v2 / docker-compose v1
run_compose() {
  if command -v docker compose >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" "$@"
  else
    docker-compose -f "$COMPOSE_FILE" "$@"
  fi
}

# Vérifier que le fichier compose existe
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Fichier docker-compose introuvable: $COMPOSE_FILE"
    exit 1
fi

case "${1:-}" in
  start)
    log_info "Démarrage du frontend web..."
    cd "$PROJECT_ROOT"
    run_compose up -d
    log_success "Frontend web démarré sur http://localhost:8081"
    ;;
  
  stop)
    log_info "Arrêt du frontend web..."
    cd "$PROJECT_ROOT"
    run_compose stop
    log_success "Frontend web arrêté"
    ;;
  
  restart)
    log_info "Redémarrage du frontend web..."
    cd "$PROJECT_ROOT"
    run_compose restart
    log_success "Frontend web redémarré"
    ;;
  
  update)
    log_info "Mise à jour du frontend web..."
    cd "$PROJECT_ROOT"
    run_compose pull 2>/dev/null || log_warning "Impossible de pull les images"
    run_compose up -d --build
    log_success "Frontend web mis à jour"
    ;;
  
  dev)
    log_info "Démarrage en mode développement..."
    cd "$PROJECT_ROOT/frontend/web"
    
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances..."
        npm install
    fi
    
    log_success "Frontend web en mode dev sur http://localhost:8081"
    log_info "Appuyez sur Ctrl+C pour arrêter"
    echo ""
    npm run dev
    ;;
  
  logs)
    cd "$PROJECT_ROOT"
    run_compose logs -f
    ;;
  
  status)
    cd "$PROJECT_ROOT"
    run_compose ps
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|update|dev|logs|status}"
    echo ""
    echo "Commandes:"
    echo "  start    - Démarrer le frontend web avec Docker"
    echo "  stop     - Arrêter le frontend web"
    echo "  restart  - Redémarrer le frontend web"
    echo "  update   - Mettre à jour et reconstruire le frontend web"
    echo "  dev      - Démarrer en mode développement (sans Docker)"
    echo "  logs     - Afficher les logs"
    echo "  status   - Afficher l'état du service"
    exit 1
    ;;
esac

