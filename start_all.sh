#!/bin/bash

echo "🚀 AREA MVP - Démarrage Complet"
echo "==============================="

# Fonction de nettoyage à la sortie
cleanup() {
    echo ""
    echo "🛑 Arrêt en cours..."
    docker-compose down 2>/dev/null
    echo "✅ Services arrêtés proprement"
    exit 0
}

# Intercepter Ctrl+C
trap cleanup SIGINT SIGTERM

# Vérifications
echo "📦 Vérification de Docker..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier les ports
echo "🔍 Vérification des ports..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 8080 déjà utilisé - arrêt du processus..."
    kill -9 $(lsof -ti:8080) 2>/dev/null || true
fi

if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 8081 déjà utilisé - arrêt du processus..."
    kill -9 $(lsof -ti:8081) 2>/dev/null || true
fi

# Validation
echo "✅ Configuration validée"
echo "📊 Services qui vont démarrer:"
echo "   • Backend API: http://localhost:8080"
echo "   • Frontend Web: http://localhost:8081"
echo ""
echo "💡 Utilisez Ctrl+C pour arrêter tous les services"
echo ""

# Démarrage
echo "🚀 Démarrage des services..."
echo "=============================="

cd "$(dirname "$0")"
docker-compose up --build