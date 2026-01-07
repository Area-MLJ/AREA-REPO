#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

case "${1:-}" in
  start)
    echo "🚀 Démarrage de tous les services..."
    echo ""
    "$SCRIPTS_DIR/manage-backend.sh" start
    sleep 3
    "$SCRIPTS_DIR/manage-web.sh" start
    echo ""
    log_success "Tous les services démarrés"
    echo ""
    log_info "Backend: http://localhost:8080"
    log_info "Frontend Web: http://localhost:8081"
    ;;
  
  stop)
    echo "🛑 Arrêt de tous les services..."
    echo ""
    "$SCRIPTS_DIR/manage-web.sh" stop
    "$SCRIPTS_DIR/manage-backend.sh" stop
    echo ""
    log_success "Tous les services arrêtés"
    ;;
  
  restart-backend)
    echo "🔄 Redémarrage du backend (sans interruption)..."
    echo ""
    "$SCRIPTS_DIR/manage-backend.sh" restart-api
    echo ""
    log_success "Backend redémarré"
    ;;
  
  restart)
    echo "🔄 Redémarrage de tous les services..."
    echo ""
    "$SCRIPTS_DIR/manage-backend.sh" restart
    "$SCRIPTS_DIR/manage-web.sh" restart
    echo ""
    log_success "Tous les services redémarrés"
    ;;
  
  status)
    echo "📊 État des services:"
    echo ""
    echo "=== Backend ==="
    "$SCRIPTS_DIR/manage-backend.sh" status
    echo ""
    echo "=== Frontend Web ==="
    "$SCRIPTS_DIR/manage-web.sh" status 2>/dev/null || echo "Non démarré"
    ;;
  
  health)
    echo "🏥 Vérification de la santé des services..."
    echo ""
    echo "=== Backend ==="
    "$SCRIPTS_DIR/manage-backend.sh" health || log_warning "Backend non accessible"
    echo ""
    echo "=== Frontend Web ==="
    if curl -s -f http://localhost:8081 > /dev/null 2>&1; then
        log_success "Frontend web accessible"
    else
        log_warning "Frontend web non accessible"
    fi
    ;;
  
  logs)
    echo "📋 Logs des services (Ctrl+C pour quitter)..."
    echo ""
    if [ -n "${2:-}" ]; then
        case "${2}" in
            backend|api|worker|scheduler|redis)
                "$SCRIPTS_DIR/manage-backend.sh" logs "${2}"
                ;;
            web)
                "$SCRIPTS_DIR/manage-web.sh" logs
                ;;
            *)
                log_error "Service inconnu: ${2}"
                log_info "Services disponibles: backend, api, worker, scheduler, redis, web"
                exit 1
                ;;
        esac
    else
        log_info "Utilisez: $0 logs {backend|web|api|worker|scheduler|redis}"
    fi
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|restart-backend|status|health|logs [service]}"
    echo ""
    echo "Commandes:"
    echo "  start           - Démarrer tous les services"
    echo "  stop            - Arrêter tous les services"
    echo "  restart         - Redémarrer tous les services"
    echo "  restart-backend - Redémarrer uniquement le backend (sans interruption)"
    echo "  status          - Afficher l'état de tous les services"
    echo "  health          - Vérifier la santé de tous les services"
    echo "  logs [service]  - Afficher les logs d'un service"
    echo ""
    echo "Services disponibles pour logs:"
    echo "  - backend, api, worker, scheduler, redis, web"
    exit 1
    ;;
esac

