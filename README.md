# AREA - Plateforme d'Automatisation

Plateforme d'automatisation (type IFTTT) permettant aux utilisateurs de créer des "Areas" qui connectent des Actions (déclencheurs) à des Réactions (actions à exécuter).

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ (20+ recommandé)
- Docker et Docker Compose
- PostgreSQL (ou via Docker)

### Scripts de Démarrage

#### Backend

```bash
./start_backend.sh
```

Ce script :
- Vérifie que Docker est installé
- Crée `.env.local` à partir de `.env.example` si nécessaire
- Démarre PostgreSQL et le backend avec Docker Compose
- Vérifie que le backend est accessible sur `http://localhost:8080`

#### Frontend Web

```bash
./start_web.sh
```

Ce script :
- Vérifie que Node.js est installé
- Installe les dépendances si nécessaire
- Vérifie que le backend est accessible
- Démarre le serveur de développement sur `http://localhost:8081`

## 📋 Fonctionnement

### Flux Utilisateur

1. **Création de compte** : L'utilisateur s'inscrit avec email/password ou via OAuth
2. **Liste des services** : L'utilisateur peut voir tous les services disponibles avec leurs actions et réactions
3. **Connexion de services** : L'utilisateur connecte ses comptes aux services externes (Google, GitHub, Discord, Spotify, etc.)
4. **Création d'AREA** : L'utilisateur crée une AREA en :
   - Choisissant une **action** (déclencheur) depuis un service connecté
   - Configurant les paramètres de l'action
   - Choisissant une ou plusieurs **réactions** (actions à exécuter)
   - Configurant les paramètres de chaque réaction
5. **Activation** : L'AREA est activée et surveille les événements de l'action pour déclencher les réactions

### Structure de la Base de Données

- **users** : Comptes utilisateurs
- **services** : Services externes disponibles (Google, GitHub, etc.)
- **service_actions** : Actions disponibles par service (ex: "nouvel email reçu")
- **service_reactions** : Réactions disponibles par service (ex: "envoyer un email")
- **user_services** : Services connectés par les utilisateurs
- **areas** : Automatisations créées par les utilisateurs
- **area_actions** : Action configurée dans une AREA
- **area_reactions** : Réactions configurées dans une AREA
- **hook_jobs** : Jobs de polling/webhook pour surveiller les actions
- **execution_logs** : Logs d'exécution des AREAs

## 🏗️ Structure du Projet

```
AREA/
├── backend/              # Backend Next.js/TypeScript
├── frontend/
│   ├── web/             # Frontend React/Vite
│   └── mobile/         # Frontend Mobile
├── docs/                # Documentation et schéma DB
├── start_backend.sh    # Script de démarrage backend
└── start_web.sh        # Script de démarrage frontend web
```

Voir [STRUCTURE.md](STRUCTURE.md) pour plus de détails.

## 🔌 API Backend

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

#### Services
- `GET /api/services` - Liste des services
- `GET /api/services/[id]` - Détails d'un service
- `GET /api/services/[id]/actions` - Actions d'un service
- `GET /api/services/[id]/reactions` - Réactions d'un service
- `GET /api/services/[id]/actions/[actionId]/params` - Paramètres d'une action
- `GET /api/services/[id]/reactions/[reactionId]/params` - Paramètres d'une réaction
- `POST /api/services/[id]/connect` - Connecter un service

#### Areas
- `GET /api/areas` - Liste des areas de l'utilisateur
- `POST /api/areas` - Créer une area (avec action et réactions)
- `GET /api/areas/[id]` - Détails d'une area
- `PUT /api/areas/[id]` - Mettre à jour une area
- `DELETE /api/areas/[id]` - Supprimer une area

#### Utilisateurs
- `GET /api/users` - Profil utilisateur
- `PUT /api/users` - Mettre à jour le profil
- `GET /api/users/services` - Services connectés

Voir [backend/README.md](backend/README.md) pour la documentation complète.

## 🐳 Docker

### Développement

```bash
# Démarrer tous les services
docker-compose up

# Ou utiliser les scripts
./start_backend.sh
./start_web.sh
```

### Services Docker

- **PostgreSQL** : Port 5432
- **Backend** : Port 8080
- **Frontend Web** : Port 8081

## 🔧 Configuration

### Backend

Créer le fichier `backend/.env` et configurer :

```env
DATABASE_URL=postgresql://area_user:area_password@localhost:5432/area_db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# etc.
```

## 📝 Notes

- Le schéma de base de données est dans `docs/shema_db.sql`
- Les scripts de démarrage vérifient automatiquement les prérequis
- Le backend doit être démarré avant le frontend web

