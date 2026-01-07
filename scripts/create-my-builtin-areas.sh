#!/bin/bash

# Script pour créer les AREA built-in pour votre compte
# Utilise l'endpoint API avec votre token

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_URL="${API_URL:-http://localhost:8080/api}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Vérifier si le token est fourni
if [ -z "$1" ]; then
    log_error "Usage: $0 <your_access_token>"
    log_info ""
    log_info "Pour obtenir votre token:"
    log_info "  1. Connectez-vous sur le frontend web"
    log_info "  2. Ouvrez la console du navigateur (F12)"
    log_info "  3. Tapez: localStorage.getItem('area_access_token')"
    log_info "  4. Copiez le token et utilisez-le comme argument"
    exit 1
fi

TOKEN="$1"

log_info "Création des AREA built-in pour votre compte..."
log_info "API: $API_URL/admin/create-builtin-areas"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/create-builtin-areas" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    log_success "AREA built-in créées avec succès !"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    log_info ""
    log_info "Rechargez votre dashboard pour voir les AREA built-in"
else
    log_error "Erreur HTTP $HTTP_CODE"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

