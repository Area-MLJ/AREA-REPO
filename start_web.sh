#!/bin/bash

# AREA MVP - Frontend Web Startup Script
# Démarre le frontend React/Vite sur le port 8081

echo "🌐 AREA Frontend Web Startup"
echo "============================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -d "frontend/web" ]; then
    echo -e "${RED}❌ Erreur: Dossier 'frontend/web' non trouvé${NC}"
    echo -e "${YELLOW}💡 Exécutez ce script depuis la racine du projet AREA${NC}"
    exit 1
fi

# Aller dans le dossier frontend/web
cd frontend/web

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erreur lors de l'installation des dépendances${NC}"
        exit 1
    fi
fi

# Vérifier que le port 8081 est libre
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Le port 8081 est déjà utilisé${NC}"
    echo -e "${BLUE}🔍 Processus utilisant le port 8081:${NC}"
    lsof -Pi :8081 -sTCP:LISTEN
    
    read -p "Voulez-vous arrêter le processus existant ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🛑 Arrêt du processus sur le port 8081...${NC}"
        pkill -f "vite --port 8081" || true
        sleep 2
    else
        echo -e "${YELLOW}⚠️  Script annulé${NC}"
        exit 1
    fi
fi

# Vérifier que le backend est accessible
echo -e "${BLUE}🔍 Vérification du backend...${NC}"
if curl -s http://localhost:8080/api/about.json >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend accessible sur http://localhost:8080${NC}"
else
    echo -e "${YELLOW}⚠️  Backend non accessible sur http://localhost:8080${NC}"
    echo -e "${YELLOW}💡 Assurez-vous que le backend est lancé avec ./start_backend.sh${NC}"
    
    read -p "Continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Script annulé${NC}"
        exit 1
    fi
fi

# Nettoyer le cache Vite si nécessaire
if [ -d "node_modules/.vite" ]; then
    echo -e "${BLUE}🧹 Nettoyage du cache Vite...${NC}"
    rm -rf node_modules/.vite
fi

# Afficher les informations de démarrage
echo -e "${GREEN}✅ Configuration validée${NC}"
echo -e "${BLUE}📊 Informations:${NC}"
echo -e "   • Répertoire: $(pwd)"
echo -e "   • Port: 8081"
echo -e "   • Mode: Development"
echo -e "   • URL: http://localhost:8081"
echo -e "   • Backend: http://localhost:8080"
echo ""

# Démarrer le serveur
echo -e "${GREEN}🚀 Démarrage du frontend...${NC}"
echo -e "${BLUE}📝 Logs du serveur:${NC}"
echo "========================"

# Lancer le serveur en mode développement
npm run dev

# Si le script arrive ici, c'est que le serveur s'est arrêté
echo ""
echo -e "${YELLOW}🛑 Serveur frontend arrêté${NC}"