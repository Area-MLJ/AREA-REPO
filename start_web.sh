#!/bin/bash

# AREA MVP - Frontend Web Startup Script (Docker)
# Démarre le frontend React/Vite sur le port 8081 avec Docker

echo "🐳 AREA Frontend Web Startup (Docker)"
echo "====================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Vérifier si on est dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erreur: Fichier docker-compose.yml non trouvé${NC}"
    echo -e "${YELLOW}💡 Exécutez ce script depuis la racine du projet AREA${NC}"
    exit 1
fi

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installez Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installez Docker Compose${NC}"
    exit 1
fi

# Arrêter le conteneur frontend s'il existe
echo -e "${BLUE}🛑 Arrêt du conteneur frontend existant...${NC}"
docker-compose stop frontend-web 2>/dev/null || true

# Vérifier que le port 8081 est libre
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Le port 8081 est déjà utilisé${NC}"
    echo -e "${BLUE}🔍 Processus utilisant le port 8081:${NC}"
    lsof -Pi :8081 -sTCP:LISTEN 2>/dev/null || echo "Impossible de lister les processus"
    
    read -p "Voulez-vous continuer ? Docker va essayer d'utiliser ce port (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
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
    echo -e "${YELLOW}💡 Démarrez d'abord le backend avec ./start_backend.sh${NC}"
    
    read -p "Continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Script annulé${NC}"
        exit 1
    fi
fi

# Construire et démarrer le frontend
echo -e "${BLUE}🔨 Construction de l'image Docker frontend...${NC}"
docker-compose build frontend-web

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la construction de l'image Docker${NC}"
    exit 1
fi

# Afficher les informations de démarrage
echo -e "${GREEN}✅ Configuration validée${NC}"
echo -e "${BLUE}📊 Informations:${NC}"
echo -e "   • Conteneur: area-frontend"
echo -e "   • Port: 8081"
echo -e "   • Mode: Development"
echo -e "   • URL: http://localhost:8081"
echo -e "   • Backend: http://localhost:8080"
echo -e "   • Environment: Docker"
echo ""

# Démarrer le frontend
echo -e "${GREEN}🚀 Démarrage du frontend Docker...${NC}"
echo -e "${BLUE}📝 Logs du conteneur:${NC}"
echo "========================"

# Lancer uniquement le service frontend avec logs
docker-compose up frontend-web

# Si le script arrive ici, c'est que le conteneur s'est arrêté
echo ""
echo -e "${YELLOW}🛑 Conteneur frontend arrêté${NC}"