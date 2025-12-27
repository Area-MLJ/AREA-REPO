#!/bin/bash

###############################################################################
# Script de démarrage du frontend web AREA
# Démarre le frontend React/Vite
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

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé. Veuillez installer Node.js d'abord."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_warning "Node.js version 18+ recommandée (version actuelle: $(node -v))"
    fi
    
    log_success "Prérequis vérifiés"
}

# Installer les dépendances si nécessaire
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances..."
        npm install
        log_success "Dépendances installées"
    else
        log_info "Dépendances déjà installées"
    fi
}

# Vérifier que le backend est accessible
check_backend() {
    log_info "Vérification de la disponibilité du backend..."
    
    if curl -s http://localhost:8080/api/about.json > /dev/null 2>&1; then
        log_success "Backend détecté sur http://localhost:8080"
        return 0
    else
        log_warning "Le backend ne semble pas être démarré sur http://localhost:8080"
        log_info "Démarrez d'abord le backend avec: ./start_backend.sh"
        log_info "Démarrage du frontend quand même..."
        return 1
    fi
}

# Démarrer le serveur de développement
start_dev_server() {
    log_info "Démarrage du serveur de développement..."
    echo ""
    log_success "Frontend disponible sur: http://localhost:8081"
    log_info "Appuyez sur Ctrl+C pour arrêter le serveur"
    echo ""
    
    npm run dev
}

# Fonction principale
main() {
    PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
    cd "$PROJECT_ROOT/frontend/web"
    
    echo "==================================================================="
    echo "  AREA Frontend Web - Script de démarrage"
    echo "==================================================================="
    echo ""
    
    check_prerequisites
    install_dependencies
    check_backend
    start_dev_server
}

# Exécuter le script principal
main
