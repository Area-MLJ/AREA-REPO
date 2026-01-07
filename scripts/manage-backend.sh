#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_PATH="$SCRIPT_DIR/$(basename "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.backend.yml"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Wrapper pour utiliser docker compose v2 si disponible, sinon docker-compose (v1)
run_compose() {
  if command -v docker compose >/dev/null 2>&1; then
    docker compose -f "$COMPOSE_FILE" "$@"
  else
    # Fallback v1 (peut avoir des bugs sur logs/events)
    docker-compose -f "$COMPOSE_FILE" "$@"
  fi
}

# Vérifier que le fichier compose existe
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Fichier docker-compose introuvable: $COMPOSE_FILE"
    exit 1
fi

# Vérifier que .env existe
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    log_error "Le fichier .env n'existe pas à la racine du projet."
    log_info "Veuillez créer un fichier .env avec vos configurations."
    exit 1
fi

case "${1:-}" in
  start)
    log_info "Démarrage du backend..."
    cd "$PROJECT_ROOT"
    run_compose up -d
    log_success "Backend démarré"
    log_info "Attente de la santé du backend..."
    sleep 5
    "$SCRIPT_PATH" health || log_warning "Le backend n'est pas encore prêt"
    ;;
  
  stop)
    log_info "Arrêt du backend..."
    cd "$PROJECT_ROOT"
    run_compose stop
    log_success "Backend arrêté"
    ;;
  
  restart)
    log_info "Redémarrage du backend (rolling restart)..."
    cd "$PROJECT_ROOT"
    # Rolling restart : redémarrer un service à la fois
    run_compose restart api
    sleep 5
    run_compose restart worker
    sleep 5
    run_compose restart scheduler
    log_success "Backend redémarré"
    ;;
  
  restart-api)
    log_info "Redémarrage de l'API uniquement (sans interruption)..."
    cd "$PROJECT_ROOT"
    run_compose restart api
    log_success "API redémarrée"
    log_info "Attente de la santé de l'API..."
    sleep 5
    "$SCRIPT_PATH" health || log_warning "L'API n'est pas encore prête"
    ;;
  
  update)
    log_info "Mise à jour du backend..."
    cd "$PROJECT_ROOT"
    run_compose pull 2>/dev/null || log_warning "Impossible de pull les images"
    run_compose up -d --build
    log_success "Backend mis à jour"
    ;;
  
  logs)
    cd "$PROJECT_ROOT"
    if [ -n "${2:-}" ]; then
        run_compose logs -f "${2}"
    else
        run_compose logs -f
    fi
    ;;
  
  status)
    cd "$PROJECT_ROOT"
    run_compose ps
    ;;
  
  health)
    log_info "Vérification de la santé du backend..."
    max_attempts=5
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f http://localhost:8080/api/health > /dev/null 2>&1; then
            log_success "Backend en bonne santé"
            # Afficher les détails du health check
            curl -s http://localhost:8080/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/api/health
            exit 0
        fi
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            sleep 2
        fi
    done
    
    log_error "Backend non accessible"
    exit 1
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|restart-api|update|logs [service]|status|health}"
    echo ""
    echo "Commandes:"
    echo "  start       - Démarrer tous les services backend"
    echo "  stop        - Arrêter tous les services backend"
    echo "  restart     - Redémarrer tous les services (rolling restart)"
    echo "  restart-api - Redémarrer uniquement l'API (sans interruption)"
    echo "  update      - Mettre à jour et reconstruire les services"
    echo "  logs [svc]  - Afficher les logs (optionnel: service spécifique)"
    echo "  status      - Afficher l'état des services"
    echo "  health      - Vérifier la santé du backend"
    exit 1
    ;;
esac

