#!/bin/bash

# AREA MVP - Backend Startup Script
# Démarre le backend Next.js API sur le port 8080

echo "🚀 AREA Backend Startup"
echo "======================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Erreur: Dossier 'backend' non trouvé${NC}"
    echo -e "${YELLOW}💡 Exécutez ce script depuis la racine du projet AREA${NC}"
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé dans backend/${NC}"
    echo -e "${BLUE}📋 Création du fichier .env depuis .env.example...${NC}"
    
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${YELLOW}⚠️  Veuillez éditer backend/.env avec vos vraies credentials Supabase${NC}"
    else
        echo -e "${RED}❌ Fichier .env.example non trouvé${NC}"
        exit 1
    fi
fi

# Aller dans le dossier backend
cd backend

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installation des dépendances...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erreur lors de l'installation des dépendances${NC}"
        exit 1
    fi
fi

# Vérifier que le port 8080 est libre
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Le port 8080 est déjà utilisé${NC}"
    echo -e "${BLUE}🔍 Processus utilisant le port 8080:${NC}"
    lsof -Pi :8080 -sTCP:LISTEN
    
    read -p "Voulez-vous arrêter le processus existant ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🛑 Arrêt du processus sur le port 8080...${NC}"
        pkill -f "next dev -p 8080" || true
        sleep 2
    else
        echo -e "${YELLOW}⚠️  Script annulé${NC}"
        exit 1
    fi
fi

# Afficher les informations de démarrage
echo -e "${GREEN}✅ Configuration validée${NC}"
echo -e "${BLUE}📊 Informations:${NC}"
echo -e "   • Répertoire: $(pwd)"
echo -e "   • Port: 8080"
echo -e "   • Mode: Development"
echo -e "   • API: http://localhost:8080"
echo ""

# Démarrer le serveur
echo -e "${GREEN}🚀 Démarrage du backend...${NC}"
echo -e "${BLUE}📝 Logs du serveur:${NC}"
echo "========================"

# Lancer le serveur en mode développement
npm run dev

# Si le script arrive ici, c'est que le serveur s'est arrêté
echo ""
echo -e "${YELLOW}🛑 Serveur backend arrêté${NC}"