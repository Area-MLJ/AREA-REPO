#!/bin/bash

# AREA MVP - Startup Script Complet
# Lance backend et frontend ensemble

echo "🚀 AREA MVP - Démarrage Complet"
echo "==============================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend/web" ]; then
    echo -e "${RED}❌ Erreur: Structure de projet non trouvée${NC}"
    echo -e "${YELLOW}💡 Exécutez ce script depuis la racine du projet AREA${NC}"
    exit 1
fi

# Vérifier si concurrently est installé
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx non trouvé. Installez Node.js${NC}"
    exit 1
fi

# Installation des dépendances si nécessaire
echo -e "${BLUE}📦 Vérification des dépendances...${NC}"

# Dépendances racine
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances racine...${NC}"
    npm install
fi

# Dépendances backend
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances backend...${NC}"
    cd backend && npm install && cd ..
fi

# Dépendances frontend
if [ ! -d "frontend/web/node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}"
    cd frontend/web && npm install && cd ../..
fi

# Vérifier les ports
echo -e "${BLUE}🔍 Vérification des ports...${NC}"

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 8080 (backend) déjà utilisé${NC}"
    pkill -f "next dev -p 8080" || true
    sleep 1
fi

if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 8081 (frontend) déjà utilisé${NC}"
    pkill -f "vite --port 8081" || true
    sleep 1
fi

# Nettoyer les caches
echo -e "${BLUE}🧹 Nettoyage des caches...${NC}"
rm -rf frontend/web/node_modules/.vite 2>/dev/null || true

# Afficher les informations
echo -e "${GREEN}✅ Configuration validée${NC}"
echo -e "${BLUE}📊 Services qui vont démarrer:${NC}"
echo -e "   • Backend API: http://localhost:8080"
echo -e "   • Frontend Web: http://localhost:8081"
echo ""
echo -e "${YELLOW}💡 Utilisez Ctrl+C pour arrêter tous les services${NC}"
echo ""

# Démarrer les services
echo -e "${GREEN}🚀 Démarrage des services...${NC}"
echo "=============================="

# Utiliser concurrently pour lancer les deux services
npm run dev

# Si le script arrive ici, c'est que les serveurs se sont arrêtés
echo ""
echo -e "${YELLOW}🛑 Tous les services arrêtés${NC}"