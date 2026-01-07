# Guide de Déploiement Modulaire - AREA

Ce guide explique comment déployer et gérer les services AREA de manière modulaire et indépendante.

## Architecture Modulaire

L'architecture AREA est composée de services indépendants :

- **Backend** : API Next.js, Workers, Scheduler, Redis
- **Frontend Web** : Application React/Vite
- **Frontend Mobile** : Application Flutter (développement local)

Chaque service peut être démarré, arrêté, mis à jour et redémarré indépendamment.

## Prérequis

- Docker et Docker Compose installés
- Node.js 18+ (pour développement local)
- Flutter SDK (pour développement mobile)
- Fichier `.env` à la racine avec les variables d'environnement nécessaires

## Structure des Fichiers

```
AREA/
├── docker-compose.backend.yml    # Backend uniquement
├── docker-compose.web.yml        # Frontend web uniquement
├── docker-compose.mobile.yml     # Mobile builder (optionnel)
├── scripts/                       # Scripts de gestion
│   ├── manage-backend.sh
│   ├── manage-web.sh
│   ├── manage-mobile.sh
│   └── manage-all.sh
└── .env                          # Variables d'environnement
```

## Gestion des Services

### Scripts Disponibles

#### `scripts/manage-backend.sh`

Gère le backend (API, Workers, Scheduler, Redis).

**Commandes :**
- `start` - Démarrer tous les services backend
- `stop` - Arrêter tous les services backend
- `restart` - Redémarrer tous les services (rolling restart)
- `restart-api` - Redémarrer uniquement l'API (sans interruption)
- `update` - Mettre à jour et reconstruire les services
- `logs [service]` - Afficher les logs (optionnel: service spécifique)
- `status` - Afficher l'état des services
- `health` - Vérifier la santé du backend

**Exemples :**
```bash
# Démarrer le backend
./scripts/manage-backend.sh start

# Redémarrer uniquement l'API (sans interruption)
./scripts/manage-backend.sh restart-api

# Vérifier la santé
./scripts/manage-backend.sh health

# Voir les logs de l'API
./scripts/manage-backend.sh logs api
```

#### `scripts/manage-web.sh`

Gère le frontend web.

**Commandes :**
- `start` - Démarrer avec Docker
- `stop` - Arrêter
- `restart` - Redémarrer
- `update` - Mettre à jour et reconstruire
- `dev` - Mode développement (sans Docker)
- `logs` - Afficher les logs
- `status` - Afficher l'état

**Exemples :**
```bash
# Démarrer en production
./scripts/manage-web.sh start

# Mode développement
./scripts/manage-web.sh dev

# Mettre à jour
./scripts/manage-web.sh update
```

#### `scripts/manage-mobile.sh`

Gère le frontend mobile (Flutter).

**Commandes :**
- `dev` - Mode développement
- `build-android` - Construire l'APK Android
- `build-ios` - Construire l'app iOS (macOS uniquement)
- `build-web` - Construire l'app web
- `clean` - Nettoyer les builds

**Exemples :**
```bash
# Démarrer en développement
./scripts/manage-mobile.sh dev

# Construire l'APK
./scripts/manage-mobile.sh build-android
```

#### `scripts/manage-all.sh`

Orchestre tous les services.

**Commandes :**
- `start` - Démarrer tous les services
- `stop` - Arrêter tous les services
- `restart` - Redémarrer tous les services
- `restart-backend` - Redémarrer uniquement le backend (sans interruption)
- `status` - État de tous les services
- `health` - Santé de tous les services
- `logs [service]` - Logs d'un service spécifique

**Exemples :**
```bash
# Démarrer tout
./scripts/manage-all.sh start

# Redémarrer le backend sans interruption
./scripts/manage-all.sh restart-backend

# Vérifier la santé
./scripts/manage-all.sh health
```

## Rolling Restart (Redémarrage sans Interruption)

Le backend supporte le rolling restart pour éviter les interruptions de service.

### Redémarrer l'API uniquement

```bash
./scripts/manage-backend.sh restart-api
```

Cette commande :
1. Redémarre uniquement le conteneur API
2. Les workers et scheduler continuent de fonctionner
3. Les requêtes en cours sont gérées gracieusement grâce au retry logic dans les frontends

### Redémarrer tous les services backend

```bash
./scripts/manage-backend.sh restart
```

Cette commande effectue un rolling restart :
1. Redémarre l'API
2. Attend 5 secondes
3. Redémarre le worker
4. Attend 5 secondes
5. Redémarre le scheduler

## Health Checks

### Backend Health Check

Le backend expose un endpoint `/api/health` qui vérifie :
- **Database (Supabase)** : Connexion et requête de test
- **Redis** : Ping Redis

**Réponse :**
```json
{
  "status": "ok" | "degraded",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "up" | "down",
    "redis": "up" | "down"
  }
}
```

**Codes de statut :**
- `200` : Tous les services sont opérationnels
- `503` : Au moins un service est down

**Vérifier la santé :**
```bash
# Via script
./scripts/manage-backend.sh health

# Via curl
curl http://localhost:8080/api/health
```

## Mises à Jour Indépendantes

### Mettre à jour le backend

```bash
./scripts/manage-backend.sh update
```

Cette commande :
1. Pull les nouvelles images (si disponibles)
2. Reconstruit les conteneurs
3. Redémarre les services avec la nouvelle version

### Mettre à jour le frontend web

```bash
./scripts/manage-web.sh update
```

Le frontend web peut être mis à jour indépendamment du backend. Les utilisateurs verront la nouvelle version après rechargement de la page.

### Mettre à jour le frontend mobile

Le frontend mobile nécessite une nouvelle build et distribution via les stores (Play Store, App Store).

## Résilience et Retry Logic

### Frontend Web

Le frontend web implémente un retry logic avec backoff exponentiel :
- **Max retries** : 3
- **Backoff** : Exponentiel (1s, 2s, 4s)
- **Retry sur** : Erreurs 5xx, erreurs réseau
- **Pas de retry** : Erreurs 401/403

### Frontend Mobile

Le frontend mobile implémente également un retry logic :
- **Max retries** : 3
- **Backoff** : Exponentiel
- **Retry sur** : Erreurs 5xx, SocketException, TimeoutException
- **Pas de retry** : Erreurs 401/403

## Déploiement en Production

### 1. Préparer l'environnement

```bash
# Vérifier que .env est configuré
cat .env | grep -E "SUPABASE|REDIS|JWT"

# Vérifier Docker
docker --version
docker-compose --version
```

### 2. Démarrer les services

```bash
# Démarrer le backend
./scripts/manage-backend.sh start

# Attendre que le backend soit prêt
./scripts/manage-backend.sh health

# Démarrer le frontend web
./scripts/manage-web.sh start
```

### 3. Vérifier le déploiement

```bash
# Vérifier la santé globale
./scripts/manage-all.sh health

# Vérifier les logs
./scripts/manage-all.sh logs backend
```

## Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
./scripts/manage-backend.sh logs

# Vérifier Redis
docker ps | grep redis

# Vérifier les variables d'environnement
cat .env | grep SUPABASE
```

### Frontend web ne peut pas se connecter au backend

```bash
# Vérifier que le backend est accessible
curl http://localhost:8080/api/health

# Vérifier la variable d'environnement
cat frontend/web/.env
# Doit contenir: VITE_API_BASE_URL=http://localhost:8080/api
```

### Erreur 503 sur /api/health

```bash
# Vérifier Supabase
./scripts/manage-backend.sh logs api | grep -i supabase

# Vérifier Redis
docker exec -it area-redis redis-cli ping
```

### Redémarrer un service spécifique

```bash
# Redémarrer uniquement l'API
./scripts/manage-backend.sh restart-api

# Redémarrer uniquement le worker
docker-compose -f docker-compose.backend.yml restart worker
```

## Bonnes Pratiques

1. **Toujours vérifier la santé après un redémarrage**
   ```bash
   ./scripts/manage-backend.sh health
   ```

2. **Utiliser rolling restart pour le backend en production**
   ```bash
   ./scripts/manage-backend.sh restart-api
   ```

3. **Mettre à jour les services indépendamment**
   - Backend et frontend peuvent être mis à jour séparément
   - Le frontend gère gracieusement les indisponibilités temporaires du backend

4. **Monitorer les logs régulièrement**
   ```bash
   ./scripts/manage-backend.sh logs api
   ```

5. **Vérifier les health checks avant les déploiements**
   ```bash
   ./scripts/manage-all.sh health
   ```

## Variables d'Environnement

### Backend

- `SUPABASE_URL` - URL de votre instance Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clé de service Supabase
- `SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `REDIS_URL` - URL Redis (par défaut: `redis://redis:6379`)
- `JWT_SECRET` - Secret pour les tokens JWT

### Frontend Web

- `VITE_API_BASE_URL` - URL de l'API backend (par défaut: `http://localhost:8080/api`)

## Support

Pour plus d'informations, consultez :
- `README.md` - Documentation principale
- `backend/README.md` - Documentation backend
- `docs/ARCHITECTURE.md` - Architecture détaillée

