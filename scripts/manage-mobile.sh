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
    if ! command -v flutter &> /dev/null; then
        log_error "Flutter n'est pas installé."
        log_info "Installez Flutter depuis https://flutter.dev/docs/get-started/install"
        exit 1
    fi
}

case "${1:-}" in
  dev)
    check_flutter
    log_info "Démarrage en mode développement..."
    cd "$MOBILE_DIR"
    
    if [ ! -d ".dart_tool" ]; then
        log_info "Installation des dépendances Flutter..."
        flutter pub get
    fi
    
    log_success "Lancement de l'app Flutter..."
    log_info "Appuyez sur Ctrl+C pour arrêter"
    echo ""
    flutter run
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
    ;;
  
  clean)
    check_flutter
    log_info "Nettoyage des builds..."
    cd "$MOBILE_DIR"
    flutter clean
    log_success "Nettoyage terminé"
    ;;
  
  *)
    echo "Usage: $0 {dev|build-android|build-ios|build-web|clean}"
    echo ""
    echo "Commandes:"
    echo "  dev           - Démarrer en mode développement"
    echo "  build-android - Construire l'APK Android"
    echo "  build-ios      - Construire l'app iOS (macOS uniquement)"
    echo "  build-web      - Construire l'app web"
    echo "  clean         - Nettoyer les builds"
    exit 1
    ;;
esac

