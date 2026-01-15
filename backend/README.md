# AREA Platform Backend

Backend de la plateforme AREA - Automatisation type IFTTT/Zapier.

## Installation

### Prérequis

- Node.js 20+
- npm ou yarn
- Redis (pour la queue)
- Compte Supabase avec base de données configurée

### Configuration

Variables requises :
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role de Supabase
- `SUPABASE_ANON_KEY` : Clé anonyme de Supabase (optionnel)
- `REDIS_URL` : URL de connexion Redis (ex: `redis://localhost:6379`)
- `JWT_SECRET` : Secret pour signer les tokens JWT
- `JWT_EXPIRES_IN` : Durée de validité du token (défaut: `7d`)
- `JWT_REFRESH_EXPIRES_IN` : Durée de validité du refresh token (défaut: `30d`)

### Installation des dépendances

```bash
npm install
```

### Base de données

Exécuter le script SQL dans Supabase pour créer les tables :

```bash
# Le schéma est dans docs/shema_db.sql
```

### Démarrage en développement

```bash
# Démarrer l'API
npm run dev

# Dans un autre terminal, démarrer le worker
npm run worker

# Dans un autre terminal, démarrer le scheduler (optionnel)
npm run scheduler
```

L'API sera accessible sur `http://localhost:8080`

## Structure du projet

```
backend/
├── src/
│   ├── app/              # Next.js App Router (API routes)
│   ├── core/
│   │   ├── engine/       # Moteur d'exécution AREA
│   │   ├── nodes/        # Modules Action/Reaction
│   │   ├── queue/        # Abstraction queue
│   │   ├── services/     # Services métier (DB)
│   │   └── scheduler/    # Scheduler polling
│   ├── workers/          # Worker consommant la queue
│   ├── lib/              # Utilitaires (auth, db, logger, etc.)
│   └── types/            # Types TypeScript
├── deploy/
│   ├── docker/           # Dockerfiles et docker-compose
│   └── k8s/              # Manifests Kubernetes
└── docs/                 # Documentation
```

## Scripts disponibles

- `npm run dev` : Démarre l'API en mode développement (port 8080)
- `npm run build` : Build de production
- `npm run start` : Démarre l'API en mode production
- `npm run worker` : Démarre le worker consommant la queue
- `npm run scheduler` : Démarre le scheduler de polling
- `npm run lint` : Lint du code

## API

L'API expose les endpoints suivants :

- `GET /about.json` : Informations sur les services disponibles
- `POST /api/auth/register` : Inscription
- `POST /api/auth/login` : Connexion
- `POST /api/auth/refresh` : Rafraîchir le token
- `GET /api/services` : Liste des services
- `GET /api/services/:id/actions` : Actions d'un service
- `GET /api/services/:id/reactions` : Réactions d'un service
- `GET /api/me/areas` : Liste des AREA de l'utilisateur
- `POST /api/me/areas` : Créer une AREA
- `POST /api/webhooks/:service/:hookJobId` : Webhook public

Voir `docs/API_SPEC.md` pour la documentation complète.

## Docker et Gestion Modulaire

### Gestion avec les scripts modulaires (Recommandé)

Le backend peut être géré de manière indépendante avec les scripts modulaires :

```bash
# À la racine du projet
# Démarrer le backend
./scripts/manage-backend.sh start

# Redémarrer uniquement l'API (sans interruption)
./scripts/manage-backend.sh restart-api

# Vérifier la santé
./scripts/manage-backend.sh health

# Voir les logs
./scripts/manage-backend.sh logs api
```

Voir [docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) pour plus de détails.

### Services Docker

Le backend est composé de :
- `api` : API Next.js (port 8080)
- `worker` : Worker consommant la queue
- `scheduler` : Scheduler de polling
- `redis` : Redis pour la queue

### Health Check

Le backend expose un endpoint `/api/health` qui vérifie :
- **Database (Supabase)** : Connexion et requête de test
- **Redis** : Ping Redis

```bash
# Vérifier la santé
curl http://localhost:8080/api/health

# Ou via script
./scripts/manage-backend.sh health
```

## Développement

### Ajouter un nouveau service

Voir `docs/HOWTOCONTRIBUTE.md` pour le guide complet.

1. Créer les modules Action/Reaction dans `src/core/nodes/`
2. Enregistrer les modules dans `src/core/nodes/registry-init.ts`
3. Ajouter les données dans la base (services, service_actions, service_reactions)

### Tests

```bash
# À venir
npm test
```

## Production

### Variables d'environnement

Assurez-vous de configurer toutes les variables d'environnement en production dans le fichier `.env` à la racine du projet.

### Rolling Restart

Le backend supporte le redémarrage sans interruption :

```bash
# Redémarrer uniquement l'API (sans interruption)
./scripts/manage-backend.sh restart-api

# Redémarrer tous les services (rolling)
./scripts/manage-backend.sh restart
```

### Scaling

- L'API est stateless, peut être répliquée
- Les workers peuvent être multipliés pour augmenter le throughput
- Le scheduler doit tourner en instance unique (ou utiliser un lock distribué)

### Mise à jour

```bash
# Mettre à jour le backend
./scripts/manage-backend.sh update
```

## Support

- [Guide de déploiement](../docs/DEPLOYMENT.md) - Instructions détaillées pour le déploiement modulaire
- [Architecture](../docs/ARCHITECTURE.md) - Vue d'ensemble de l'architecture
- [API Spec](docs/API_SPEC.md) - Spécification complète de l'API
- [How to Contribute](docs/HOWTOCONTRIBUTE.md) - Guide pour ajouter de nouveaux services

