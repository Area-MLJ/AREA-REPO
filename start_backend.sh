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
    echo "  --dev           Démarrer en mode développement local (sans Docker)"
    echo ""
    echo "Sans option, le script démarre le backend avec Docker Compose."
    echo ""
    echo "Exemples:"
    echo "  $0              # Démarrer le backend avec Docker"
    echo "  $0 --dev        # Démarrer en mode dev local"
    echo "  $0 --logs       # Voir les logs"
    echo "  $0 --restart    # Redémarrer"
    echo "  $0 --stop       # Arrêter"
    echo ""
    echo "==================================================================="
    exit 0
}

# Fonction pour afficher les logs
show_logs() {
    if [ -z "$PROJECT_ROOT" ]; then
        export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    fi
    
    cd "$PROJECT_ROOT/backend/deploy/docker"
    
    # Vérifier si le service api est en cours d'exécution
    if ! docker-compose ps api 2>/dev/null | grep -q "Up"; then
        log_warning "Le backend n'est pas en cours d'exécution"
        log_info "Démarrez-le d'abord avec: $0"
        exit 1
    fi
    
    log_info "Affichage des logs du backend en temps réel (Ctrl+C pour quitter)..."
    echo ""
    log_info "Appuyez sur Ctrl+C pour arrêter le suivi des logs"
    echo ""
    
    docker-compose logs -f --tail=100 api
}

# Fonction pour redémarrer
restart_backend() {
    if [ -z "$PROJECT_ROOT" ]; then
        export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    fi
    
    cd "$PROJECT_ROOT/backend/deploy/docker"
    
    log_info "Redémarrage du backend..."
    docker-compose restart api
    
    if [ $? -eq 0 ]; then
        log_success "Backend redémarré"
    else
        log_error "Erreur lors du redémarrage"
        exit 1
    fi
}

# Fonction pour arrêter
stop_backend() {
    if [ -z "$PROJECT_ROOT" ]; then
        export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    fi
    
    cd "$PROJECT_ROOT/backend/deploy/docker"
    
    log_info "Arrêt des conteneurs backend..."
    docker-compose down
    
    if [ $? -eq 0 ]; then
        log_success "Conteneurs arrêtés"
    else
        log_error "Erreur lors de l'arrêt"
        exit 1
    fi
}

# Fonction pour démarrer en mode dev
start_dev() {
    if [ -z "$PROJECT_ROOT" ]; then
        export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    fi
    
    cd "$PROJECT_ROOT/backend"
    
    if [ ! -f .env ]; then
        log_error "Le fichier .env n'existe pas dans backend/"
        log_info "Veuillez créer un fichier backend/.env avec vos configurations."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez installer Node.js 20+ d'abord."
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances..."
        npm install
    fi
    
    log_info "Démarrage du backend en mode développement..."
    log_info "API sera disponible sur: http://localhost:8080"
    log_info "Appuyez sur Ctrl+C pour arrêter"
    echo ""
    
    npm run dev
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
    if [ -z "$PROJECT_ROOT" ]; then
        export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    fi
    
    # Vérifier .env à la racine (pour Docker Compose)
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_error "Le fichier .env n'existe pas à la racine du projet."
        log_info "Veuillez créer un fichier .env avec vos configurations."
        exit 1
    fi
    
    log_success "Fichier .env trouvé"
    
    if ! grep -q "SUPABASE_URL" "$PROJECT_ROOT/.env" || ! grep -q "SUPABASE_SERVICE_ROLE_KEY" "$PROJECT_ROOT/.env"; then
        log_error "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env"
        exit 1
    fi
    
    log_success "Configuration Supabase détectée"
}

# Nettoyer les conteneurs existants
cleanup_containers() {
    if [ -z "$PROJECT_ROOT" ]; then
        log_error "PROJECT_ROOT n'est pas défini"
        exit 1
    fi
    
    local DOCKER_DIR="$PROJECT_ROOT/backend/deploy/docker"
    
    if [ ! -d "$DOCKER_DIR" ]; then
        log_error "Répertoire Docker introuvable: $DOCKER_DIR"
        exit 1
    fi
    
    cd "$DOCKER_DIR"
    
    log_info "Nettoyage des conteneurs existants..."
    
    docker-compose down --remove-orphans 2>/dev/null || true
    
    log_success "Nettoyage terminé"
}

# Démarrer les services
start_services() {
    if [ -z "$PROJECT_ROOT" ]; then
        log_error "PROJECT_ROOT n'est pas défini"
        exit 1
    fi
    
    local DOCKER_DIR="$PROJECT_ROOT/backend/deploy/docker"
    
    if [ ! -d "$DOCKER_DIR" ]; then
        log_error "Répertoire Docker introuvable: $DOCKER_DIR"
        exit 1
    fi
    
    cd "$DOCKER_DIR"
    
    # Copier le .env de la racine vers ce répertoire pour Docker Compose
    if [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" .env
    fi
    
    log_info "Démarrage du backend avec Docker Compose..."
    docker-compose up -d api redis
    
    log_success "Backend démarré"
}


# Vérifier que le backend est accessible
check_backend_health() {
    log_info "Vérification de l'accessibilité du backend..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/about.json > /dev/null 2>&1; then
            log_success "Backend démarré avec succès"
            echo ""
            log_info "API disponible sur: http://localhost:8080"
            log_info "Documentation: http://localhost:8080/about.json"
            log_info "Health check: http://localhost:8080/api/health"
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
        --dev)
            start_dev
            exit 0
            ;;
        "")
            # Pas d'argument, démarrer normalement avec Docker
            ;;
        *)
            log_error "Option inconnue: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    # Démarrer le backend avec Docker (comportement par défaut)
    echo "==================================================================="
    echo "  AREA Backend - Script de démarrage"
    echo "==================================================================="
    echo ""
    
    # Définir PROJECT_ROOT une seule fois au début
    export PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    
    check_prerequisites
    check_env_file
    
    log_info "Démarrage du backend avec Docker Compose..."
    cleanup_containers
    start_services
    
    check_backend_health
    
    echo ""
    echo "==================================================================="
}

# Exécuter le script principal
main "$@"
