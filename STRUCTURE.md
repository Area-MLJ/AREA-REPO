# Structure du Projet AREA

## Vue d'ensemble

AREA est une plateforme d'automatisation (type IFTTT) permettant aux utilisateurs de créer des "Areas" qui connectent des Actions (déclencheurs) à des Réactions (actions à exécuter).

## Architecture Globale

```
AREA/
├── backend/                    # Backend Next.js/TypeScript
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── api/           # API Routes
│   │   │   │   ├── auth/      # Authentification
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── register/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── refresh/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── oauth/
│   │   │   │   │       ├── [provider]/
│   │   │   │   │       │   └── route.ts
│   │   │   │   ├── users/     # Gestion utilisateurs
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── route.ts
│   │   │   │   ├── services/  # Services externes
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── [id]/connect/
│   │   │   │   │       └── route.ts
│   │   │   │   ├── areas/     # Automatisations
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   ├── webhooks/  # Webhooks
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [service]/
│   │   │   │   │       └── route.ts
│   │   │   │   └── about.json/
│   │   │   │       └── route.ts
│   │   │   └── layout.tsx
│   │   ├── lib/               # Bibliothèques utilitaires
│   │   │   ├── db/            # Client base de données
│   │   │   │   ├── client.ts
│   │   │   │   └── migrations.ts
│   │   │   ├── auth/          # JWT, OAuth
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── oauth.ts
│   │   │   │   └── session.ts
│   │   │   ├── services/      # Intégrations services
│   │   │   │   ├── base.ts
│   │   │   │   ├── google.ts
│   │   │   │   ├── github.ts
│   │   │   │   ├── discord.ts
│   │   │   │   └── spotify.ts
│   │   │   └── validators/    # Validation Zod
│   │   │       ├── auth.ts
│   │   │       ├── users.ts
│   │   │       ├── services.ts
│   │   │       └── areas.ts
│   │   ├── types/             # Types TypeScript
│   │   │   ├── database.ts
│   │   │   ├── api.ts
│   │   │   └── services.ts
│   │   └── middleware.ts      # Middleware Next.js
│   ├── prisma/                # Schéma Prisma
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env.example
│   ├── .env.local
│   ├── .gitignore
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── docker-compose.yml     # Pour développement local
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── web/                   # Frontend Web (React/Vite)
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   └── mobile/                # Frontend Mobile
│       ├── src/
│       ├── Dockerfile
│       └── package.json
├── docs/
│   ├── shema_db.sql           # Schéma SQL existant
│   └── reference/
│       └── G-DEV-500_AREA.pdf
└── docker-compose.yml         # Orchestration globale
```

## Backend - Architecture Détaillée

### Stack Technique

- **Framework**: Next.js 14+ (App Router) avec TypeScript
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT + OAuth (Google, GitHub, Discord, Spotify)
- **Validation**: Zod
- **API**: RESTful sur le port 8080

### Modules Principaux

#### 1. Authentification (`/api/auth`)

- `POST /api/auth/register` - Inscription avec email/password
- `POST /api/auth/login` - Connexion avec email/password
- `POST /api/auth/refresh` - Rafraîchissement du token
- `GET /api/auth/oauth/[provider]` - Initiation OAuth
- `GET /api/auth/oauth/[provider]/callback` - Callback OAuth

#### 2. Utilisateurs (`/api/users`)

- `GET /api/users` - Profil utilisateur actuel
- `PUT /api/users` - Mise à jour du profil
- `GET /api/users/services` - Services connectés par l'utilisateur
- `POST /api/users/services` - Connecter un service
- `DELETE /api/users/services/[id]` - Déconnecter un service

#### 3. Services (`/api/services`)

- `GET /api/services` - Liste des services disponibles
- `GET /api/services/[id]` - Détails d'un service
- `GET /api/services/[id]/actions` - Actions disponibles
- `GET /api/services/[id]/reactions` - Réactions disponibles
- `POST /api/services/[id]/connect` - Connexion OAuth à un service

#### 4. Areas (`/api/areas`)

- `GET /api/areas` - Liste des areas de l'utilisateur
- `POST /api/areas` - Créer une area
- `GET /api/areas/[id]` - Détails d'une area
- `PUT /api/areas/[id]` - Mettre à jour une area
- `DELETE /api/areas/[id]` - Supprimer une area
- `POST /api/areas/[id]/toggle` - Activer/désactiver une area

#### 5. Webhooks (`/api/webhooks`)

- `POST /api/webhooks/[service]` - Réception des webhooks externes
- `GET /api/webhooks/logs` - Logs des webhooks

#### 6. Informations (`/api/about.json`)

- `GET /api/about.json` - Informations sur le serveur

### Base de Données

Le schéma de base de données est défini dans `docs/shema_db.sql` et comprend :

- **users** - Utilisateurs de la plateforme
- **user_sessions** - Sessions utilisateur avec tokens
- **oauth_identities** - Identités OAuth liées aux utilisateurs
- **services** - Services externes disponibles
- **service_actions** - Actions disponibles par service
- **service_reactions** - Réactions disponibles par service
- **user_services** - Services connectés par les utilisateurs
- **areas** - Automatisations créées par les utilisateurs
- **area_actions** - Actions configurées dans les areas
- **area_reactions** - Réactions configurées dans les areas
- **hook_jobs** - Jobs de polling/webhook
- **hook_logs** - Logs des hooks
- **execution_logs** - Logs d'exécution des areas
- **audit_logs** - Logs d'audit

### Dockerisation

#### Backend

- **Dockerfile** : Build de production optimisé (multi-stage)
- **Dockerfile.dev** : Build de développement avec hot-reload
- **docker-compose.yml** : Backend + PostgreSQL pour développement local

#### Orchestration Globale

- **docker-compose.yml** (racine) : Orchestration de tous les services
  - Backend (port 8080)
  - Frontend Web (port 8081)
  - Frontend Mobile (si nécessaire)
  - PostgreSQL (port 5432)
  - Redis (optionnel, pour cache)

### Points d'Intégration

- **API REST** : `http://localhost:8080/api`
- **CORS** : Configuré pour accepter les requêtes depuis :
  - Frontend Web : `http://localhost:8081`
  - Frontend Mobile : Configuration spécifique selon le besoin
- **Webhooks** : Endpoints publics pour recevoir les événements des services externes
- **Alignement** : Les endpoints sont alignés avec `frontend/web/src/lib/api.ts`

## Frontend

### Web (React/Vite)

- Port : 8081
- Framework : React 18 + Vite
- Styling : Tailwind CSS
- Routing : React Router

### Mobile

- Framework : React Native ou autre selon la branche existante
- Build : APK pour Android

## Développement

### Prérequis

- Node.js 18+
- Docker et Docker Compose
- PostgreSQL (ou via Docker)

### Commandes Principales

#### Backend

```bash
cd backend
npm install
npm run dev          # Développement local
npm run build        # Build de production
npm run start        # Production
docker-compose up    # Avec Docker
```

#### Frontend Web

```bash
cd frontend/web
npm install
npm run dev          # Développement (port 8081)
```

### Variables d'Environnement

#### Backend (.env.local)

```
DATABASE_URL=postgresql://user:password@localhost:5432/area_db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
NEXTAUTH_URL=http://localhost:8080

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# API
API_PORT=8080
NODE_ENV=development
```

## Sécurité

- Authentification JWT avec refresh tokens
- Hashage des mots de passe (bcrypt)
- Validation des entrées avec Zod
- Protection CSRF
- Rate limiting
- Sanitization des données

## Tests

- Tests unitaires (Jest/Vitest)
- Tests d'intégration
- Tests E2E (optionnel)

## Déploiement

- Production : Docker multi-stage build
- CI/CD : Configuration selon l'environnement
- Monitoring : Logs structurés

