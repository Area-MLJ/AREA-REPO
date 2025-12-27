#!/bin/bash

###############################################################################
# Script de démarrage du backend AREA
# Démarre le backend Next.js avec Docker Compose
###############################################################################

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction d'aide
show_help() {
    echo "==================================================================="
    echo "  AREA Backend - Script de gestion"
    echo "==================================================================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help      Afficher cette aide"
    echo "  --logs          Afficher les logs du backend (suivi en temps réel)"
    echo "  --restart       Redémarrer le backend"
    echo "  --stop          Arrêter tous les conteneurs"
    echo ""
    echo "Sans option, le script démarre le backend."
    echo ""
    echo "Exemples:"
    echo "  $0              # Démarrer le backend"
    echo "  $0 --logs       # Voir les logs"
    echo "  $0 --restart    # Redémarrer"
    echo "  $0 --stop       # Arrêter"
    echo ""
    echo "==================================================================="
    exit 0
}

# Fonction pour afficher les logs
show_logs() {
    PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    cd "$PROJECT_ROOT/backend"
    
    if ! docker ps --format '{{.Names}}' | grep -q "^area-backend$"; then
        log_warning "Le backend n'est pas en cours d'exécution"
        log_info "Démarrez-le d'abord avec: $0"
        exit 1
    fi
    
    log_info "Affichage des logs du backend en temps réel (Ctrl+C pour quitter)..."
    echo ""
    log_info "Appuyez sur Ctrl+C pour arrêter le suivi des logs"
    echo ""
    
    docker-compose logs -f --tail=100 backend
}

# Fonction pour redémarrer
restart_backend() {
    PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    cd "$PROJECT_ROOT/backend"
    
    log_info "Redémarrage du backend..."
    docker-compose restart backend
    
    if [ $? -eq 0 ]; then
        log_success "Backend redémarré"
    else
        log_error "Erreur lors du redémarrage"
        exit 1
    fi
}

# Fonction pour arrêter
stop_backend() {
    PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    cd "$PROJECT_ROOT/backend"
    
    log_info "Arrêt des conteneurs..."
    docker-compose down
    
    if [ $? -eq 0 ]; then
        log_success "Conteneurs arrêtés"
    else
        log_error "Erreur lors de l'arrêt"
        exit 1
    fi
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez installer Docker d'abord."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Vérifier le fichier .env
check_env_file() {
    PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    cd "$PROJECT_ROOT"
    
    if [ ! -f .env ]; then
        log_error "Le fichier .env n'existe pas à la racine du projet."
        log_info "Veuillez créer un fichier .env avec vos configurations."
        exit 1
    fi
    
    log_success "Fichier .env trouvé"
    
    if ! grep -q "SUPABASE_URL" .env || ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
        log_error "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env"
        exit 1
    fi
    
    log_success "Configuration Supabase détectée"
}

# Nettoyer les conteneurs existants
cleanup_containers() {
    log_info "Nettoyage des conteneurs existants..."
    
    cd backend
    
    docker-compose down --remove-orphans 2>/dev/null || true
    
    if docker ps -a --format '{{.Names}}' | grep -q "^area-backend$"; then
        log_warning "Suppression forcée du conteneur area-backend..."
        docker rm -f area-backend 2>/dev/null || true
    fi
    
    log_success "Nettoyage terminé"
}

# Démarrer les services
start_services() {
    log_info "Démarrage du backend..."
    docker-compose up -d
    
    log_success "Backend démarré"
}


# Vérifier que le backend est accessible
check_backend_health() {
    log_info "Vérification de l'accessibilité du backend..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/api/about.json > /dev/null 2>&1; then
            log_success "Backend démarré avec succès"
            echo ""
            log_info "API disponible sur: http://localhost:8080"
            log_info "Documentation: http://localhost:8080/api/about.json"
            log_info "Logs: $0 --logs"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    log_warning "Le backend semble prendre plus de temps que prévu à démarrer"
    log_info "Vérifiez les logs avec: $0 --logs"
    return 1
}

# Fonction principale
main() {
    # Traiter les arguments
    case "${1:-}" in
        -h|--help)
            show_help
            ;;
        --logs)
            show_logs
            exit 0
            ;;
        --restart)
            restart_backend
            exit 0
            ;;
        --stop)
            stop_backend
            exit 0
            ;;
        "")
            # Pas d'argument, démarrer normalement
            ;;
        *)
            log_error "Option inconnue: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    # Démarrer le backend (comportement par défaut)
    echo "==================================================================="
    echo "  AREA Backend - Script de démarrage"
    echo "==================================================================="
    echo ""
    
    check_prerequisites
    check_env_file
    
    if ! grep -q "SUPABASE_URL" .env || ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
        log_error "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env"
        exit 1
    fi
    
    log_info "Démarrage du backend avec Supabase..."
    cleanup_containers
    start_services
    
    check_backend_health
    
    echo ""
    echo "==================================================================="
}

# Exécuter le script principal
main "$@"
