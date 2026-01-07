#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/frontend/mobile"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Vérifier que Flutter est installé
check_flutter() {
    # Ajouter Flutter au PATH s'il est installé dans le home directory
    if [ -d "$HOME/flutter/bin" ]; then
        export PATH="$HOME/flutter/bin:$PATH"
    fi
    
    if ! command -v flutter &> /dev/null; then
        log_error "Flutter n'est pas installé."
        log_info "Options:"
        log_info "  1. Installer Flutter: https://flutter.dev/docs/get-started/install"
        log_info "  2. Utiliser Docker: ./manage-mobile.sh build-web-docker"
        log_info "  3. Utiliser le frontend web à la place: ./manage-web.sh dev"
        exit 1
    fi
}

case "${1:-}" in
  dev)
    check_flutter
    log_info "Démarrage en mode développement..."
    log_warning "Note: Le mode Linux natif peut nécessiter des dépendances C++"
    log_info "Si vous rencontrez des erreurs, utilisez: ./manage-mobile.sh dev-web"
    cd "$MOBILE_DIR"
    
    if [ ! -d ".dart_tool" ]; then
        log_info "Installation des dépendances Flutter..."
        flutter pub get
    fi
    
    log_success "Lancement de l'app Flutter..."
    log_info "Appuyez sur Ctrl+C pour arrêter"
    log_info "Choisissez [2] Chrome (web) si Linux natif ne fonctionne pas"
    echo ""
    flutter run
    ;;
  
  dev-web)
    check_flutter
    log_info "Démarrage en mode développement (web)..."
    cd "$MOBILE_DIR"
    
    if [ ! -d ".dart_tool" ]; then
        log_info "Installation des dépendances Flutter..."
        flutter pub get
    fi
    
    log_success "Lancement de l'app Flutter Web..."
    log_info "L'app sera accessible sur http://localhost:8082"
    log_info "Appuyez sur Ctrl+C pour arrêter"
    echo ""
    flutter run -d chrome --web-port=8082
    ;;
  
  build-android)
    check_flutter
    log_info "Construction de l'APK Android..."
    cd "$MOBILE_DIR"
    
    flutter pub get
    flutter build apk --release
    
    if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
        log_success "APK construit avec succès"
        log_info "Fichier: $MOBILE_DIR/build/app/outputs/flutter-apk/app-release.apk"
    else
        log_error "Échec de la construction de l'APK"
        exit 1
    fi
    ;;
  
  build-ios)
    check_flutter
    log_info "Construction de l'app iOS..."
    cd "$MOBILE_DIR"
    
    # Vérifier qu'on est sur macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        log_error "La construction iOS nécessite macOS"
        exit 1
    fi
    
    flutter pub get
    flutter build ios --release
    
    log_success "App iOS construite avec succès"
    log_info "Fichier dans: $MOBILE_DIR/build/ios/iphoneos/Runner.app"
    ;;
  
  build-web)
    check_flutter
    log_info "Construction de l'app web..."
    cd "$MOBILE_DIR"
    
    flutter pub get
    flutter build web --release
    
    log_success "App web construite avec succès"
    log_info "Fichiers dans: $MOBILE_DIR/build/web/"
    log_info "Pour servir: cd build/web && python3 -m http.server 8082"
    ;;
  
  build-web-docker)
    log_info "Construction de l'app web avec Docker (sans Flutter local)..."
    cd "$PROJECT_ROOT"
    
    docker compose -f docker-compose.mobile.yml build
    
    log_success "Build terminé"
    log_info "Les fichiers sont dans le volume Docker"
    ;;
  
  clean)
    if command -v flutter &> /dev/null; then
        log_info "Nettoyage des builds..."
        cd "$MOBILE_DIR"
        flutter clean
        log_success "Nettoyage terminé"
    else
        log_warning "Flutter n'est pas installé, nettoyage manuel..."
        cd "$MOBILE_DIR"
        rm -rf build .dart_tool
        log_success "Nettoyage terminé"
    fi
    ;;
  
  *)
    echo "Usage: $0 {dev|dev-web|build-android|build-ios|build-web|build-web-docker|clean}"
    echo ""
    echo "Commandes:"
    echo "  dev              - Démarrer en mode développement (nécessite Flutter)"
    echo "  dev-web          - Démarrer en mode développement web (nécessite Flutter)"
    echo "  build-android    - Construire l'APK Android (nécessite Flutter)"
    echo "  build-ios        - Construire l'app iOS (macOS + Flutter)"
    echo "  build-web        - Construire l'app web (nécessite Flutter)"
    echo "  build-web-docker - Construire l'app web avec Docker (sans Flutter)"
    echo "  clean            - Nettoyer les builds"
    echo ""
    echo "Note: Si Flutter n'est pas installé, utilisez 'build-web-docker' ou installez Flutter:"
    echo "  https://flutter.dev/docs/get-started/install"
    exit 1
    ;;
esac
