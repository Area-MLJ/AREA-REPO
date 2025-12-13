#!/bin/bash

# AREA MVP - Backend Startup Script (Docker)
# Démarre le backend Next.js API sur le port 8080 avec Docker

echo "🐳 AREA Backend Startup (Docker)"
echo "================================"

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

# Vérifier si Docker Compose est installé (nouvelle ou ancienne syntaxe)
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installez Docker Compose${NC}"
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env non trouvé${NC}"
    echo -e "${RED}❌ Le fichier .env est requis pour Docker${NC}"
    exit 1
fi

# Arrêter les conteneurs existants
echo -e "${BLUE}🛑 Arrêt des conteneurs existants...${NC}"
$DOCKER_COMPOSE_CMD down --remove-orphans 2>/dev/null || true

# Vérifier que le port 8080 est libre
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Le port 8080 est déjà utilisé${NC}"
    echo -e "${BLUE}🔍 Processus utilisant le port 8080:${NC}"
    lsof -Pi :8080 -sTCP:LISTEN 2>/dev/null || echo "Impossible de lister les processus"
    
    read -p "Voulez-vous continuer ? Docker va essayer d'utiliser ce port (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Script annulé${NC}"
        exit 1
    fi
fi

# Construire et démarrer uniquement le backend
echo -e "${BLUE}🔨 Construction de l'image Docker backend...${NC}"
$DOCKER_COMPOSE_CMD build backend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de la construction de l'image Docker${NC}"
    exit 1
fi

# Afficher les informations de démarrage
echo -e "${GREEN}✅ Configuration validée${NC}"
echo -e "${BLUE}📊 Informations:${NC}"
echo -e "   • Conteneur: area-backend"
echo -e "   • Port: 8080"
echo -e "   • Mode: Development"
echo -e "   • API: http://localhost:8080"
echo -e "   • Environment: Docker"
echo ""

# Démarrer le backend
echo -e "${GREEN}🚀 Démarrage du backend Docker...${NC}"
echo -e "${BLUE}📝 Logs du conteneur:${NC}"
echo "========================"

# Lancer uniquement le service backend avec logs
docker-compose up backend

# Si le script arrive ici, c'est que le conteneur s'est arrêté
echo ""
echo -e "${YELLOW}🛑 Conteneur backend arrêté${NC}"