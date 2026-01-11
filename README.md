<<<<<<< HEAD
# AREA Platform

Plateforme d'automatisation type n8n / IFTTT où les utilisateurs créent des AREA (Action–REAction) entre des services externes (Twitch, Discord, Gmail, etc.).

## Concept

- Un **AREA** = 1 Action (trigger) + 1..N Réactions.
- Une **Action** est un module qui détecte un événement (polling ou webhook) sur un service externe.
- Une **Réaction** est un module qui exécute une action sur un service externe (envoyer un message, un mail, créer un fichier, etc.).
- Les utilisateurs connectent leurs comptes (OAuth2) et composent des AREA à partir de la librairie de services et de modules.

Exemple :  
> Quand je lance un live Twitch (Action), alors envoyer un message sur Discord et un email à mes admins (deux Réactions).

## Architecture Modulaire

L'architecture AREA est composée de services indépendants qui peuvent être gérés séparément :

- **Backend** : API Next.js, Workers, Scheduler, Redis
- **Frontend Web** : Application React/Vite
- **Frontend Mobile** : Application Flutter

Chaque service peut être démarré, arrêté, mis à jour et redémarré indépendamment.

### Vue d'ensemble

```
AREA/
├── docker-compose.backend.yml    # Backend uniquement
├── docker-compose.web.yml        # Frontend web uniquement
├── docker-compose.mobile.yml     # Mobile builder (optionnel)
├── scripts/                       # Scripts de gestion modulaires
│   ├── manage-backend.sh         # Gestion backend
│   ├── manage-web.sh             # Gestion frontend web
│   ├── manage-mobile.sh          # Gestion frontend mobile
│   └── manage-all.sh             # Orchestration globale
├── backend/                       # Backend API
├── frontend/web/                  # Frontend web
└── frontend/mobile/               # Frontend mobile
```

## Démarrage Rapide

### Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour développement local)
- Flutter SDK (pour développement mobile)
- Fichier `.env` à la racine avec vos credentials

### Démarrer tous les services

```bash
# Démarrer backend et frontend web
./scripts/manage-all.sh start

# Vérifier la santé
./scripts/manage-all.sh health
```

### Démarrer un service spécifique

```bash
# Backend uniquement
./scripts/manage-backend.sh start

# Frontend web uniquement
./scripts/manage-web.sh start

# Frontend mobile (développement)
./scripts/manage-mobile.sh dev
```

## Gestion des Services

### Backend

```bash
# Démarrer
./scripts/manage-backend.sh start

# Redémarrer l'API sans interruption
./scripts/manage-backend.sh restart-api

# Vérifier la santé
./scripts/manage-backend.sh health

# Voir les logs
./scripts/manage-backend.sh logs api
```

### Frontend Web

```bash
# Démarrer en production
./scripts/manage-web.sh start

# Mode développement
./scripts/manage-web.sh dev

# Mettre à jour
./scripts/manage-web.sh update
```

### Frontend Mobile

```bash
# Mode développement
./scripts/manage-mobile.sh dev

# Construire l'APK Android
./scripts/manage-mobile.sh build-android
```

## Architecture Technique

### Backend

- **API HTTP** : Next.js (TypeScript)
- **Queue** : Redis + BullMQ
- **Auth** : JWT + Supabase Auth
- **Database** : Supabase (PostgreSQL)
- **Workers** : Node.js pour exécution des AREA
- **Scheduler** : Polling des actions

### Frontend Web

- **Framework** : React 18 + Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router
- **API Client** : Fetch avec retry logic

### Frontend Mobile

- **Framework** : Flutter
- **State Management** : Provider
- **API Client** : HTTP avec retry logic

## Endpoints Principaux

- **API Backend** : http://localhost:8080
- **Frontend Web** : http://localhost:8081
- **Health Check** : http://localhost:8080/api/health
- **About** : http://localhost:8080/about.json

## Documentation

- [Architecture détaillée](docs/ARCHITECTURE.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)
- [Schéma de base de données](docs/DB_SHEMA.md)
- [Design du moteur](docs/ENGINE_DESIGN.md)
- [Spécification API](backend/docs/API_SPEC.md)
- [Guide de contribution](backend/docs/HOWTOCONTRIBUTE.md)

## Rolling Restart (Sans Interruption)

Le backend supporte le redémarrage sans interruption :

```bash
# Redémarrer uniquement l'API
./scripts/manage-backend.sh restart-api

# Redémarrer tous les services backend (rolling)
./scripts/manage-backend.sh restart
```

Les frontends implémentent un retry logic avec backoff exponentiel pour gérer gracieusement les indisponibilités temporaires du backend.

## Health Checks

Le backend expose un endpoint `/api/health` qui vérifie :
- **Database (Supabase)** : Connexion et requête de test
- **Redis** : Ping Redis

```bash
# Vérifier la santé
./scripts/manage-backend.sh health

# Ou via curl
curl http://localhost:8080/api/health
```

## Mises à Jour Indépendantes

Chaque service peut être mis à jour indépendamment :

```bash
# Mettre à jour le backend
./scripts/manage-backend.sh update

# Mettre à jour le frontend web
./scripts/manage-web.sh update
```

## Organisation du Repository

```
AREA/
├── backend/                      # Backend API
│   ├── src/
│   │   ├── app/api/             # Routes HTTP
│   │   ├── core/engine/         # Moteur d'exécution
│   │   ├── core/nodes/          # Modules Action/Reaction
│   │   ├── core/services/       # Accès DB
│   │   └── workers/             # Entrypoint worker
│   ├── deploy/docker/           # Dockerfiles et docker-compose
│   └── docs/                    # Documentation backend
├── frontend/
│   ├── web/                     # Frontend web (React/Vite)
│   └── mobile/                  # Frontend mobile (Flutter)
├── scripts/                     # Scripts de gestion modulaires
├── docs/                        # Documentation globale
└── docker-compose.*.yml         # Docker Compose modulaires
```

## Tech Stack

### Backend
- **Langage** : TypeScript (Node.js)
- **API HTTP** : Next.js 14
- **Queue** : Redis + BullMQ
- **Auth** : JWT + Supabase Auth
- **Database** : Supabase (PostgreSQL)
- **Déploiement** : Docker + Kubernetes

### Frontend Web
- **Framework** : React 18
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Routing** : React Router

### Frontend Mobile
- **Framework** : Flutter
- **State Management** : Provider
- **HTTP** : http package

## Support

Pour plus d'informations :
- [Guide de déploiement](docs/DEPLOYMENT.md) - Instructions détaillées
- [Architecture](docs/ARCHITECTURE.md) - Vue d'ensemble technique
- [Backend README](backend/README.md) - Documentation backend

## Licence

[À définir]
=======
# AREA MVP - Action REAction Platform

Minimum Viable Product for an automation platform similar to IFTTT/Zapier. Users can create automations by connecting triggers (Actions) to tasks (REActions) across different services.

## 🏗️ MVP Architecture

```
area-mvp/
├── 🔧 backend/              # Next.js API Server (Port 8080)
│   ├── pages/api/          # REST API endpoints
│   ├── src/                # Core business logic
│   └── scripts/            # Database utilities
├── 🌐 frontend/web/         # React Web Client (Port 8081)
│   ├── src/                # React components
│   └── public/             # Static assets
├── 🔄 shared/               # Common types & utilities
└── 📚 docs/                 # Project documentation
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend/web && npm install
```

### 3. Development Mode
```bash
# Option 1: Both services together
npm run dev

# Option 2: Separate terminals
npm run dev:backend    # Terminal 1
npm run dev:web        # Terminal 2
```

## 🎯 MVP Features

### ✅ Current Implementation
- **Backend API** - Complete REST API with Next.js
- **User Authentication** - Registration, login with JWT
- **Frontend Interface** - React web application
- **Service Architecture** - Pluggable service system
- **Basic Automation** - Area creation and management
- **Database Integration** - Supabase PostgreSQL

### 🔄 Core Functionality
- User registration and authentication
- Service connection management
- Area (automation) creation
- Basic hook system for triggers
- Web interface for all operations

## 📡 API Endpoints

### Public
- `GET /api/about.json` - Server information

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Protected (JWT Required)
- `GET /api/services` - Available services
- `GET /api/areas` - User automations
- `POST /api/areas` - Create automation
- `GET /api/users/services` - Connected services

## 🔧 Technology Stack

### Backend
- **Next.js 14** - API framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database
- **JWT** - Authentication

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling

## 🚢 Development

### Quick Start Scripts
```bash
# Lancer tout ensemble (recommandé)
./start_all.sh

# Lancer individuellement
./start_backend.sh       # Backend seul
./start_web.sh          # Frontend seul
```

### Manual Commands
```bash
# Development
npm run dev              # Both backend + frontend
npm run dev:backend      # Backend only
npm run dev:web         # Frontend only

# Production Build
npm run build           # Both projects
npm run build:backend   # Backend only
npm run build:web      # Frontend only

# Production Start
npm run start          # Both services
```

### URLs
- **Backend API**: http://localhost:8080
- **Frontend Web**: http://localhost:8081

## 📋 MVP Requirements

✅ **REST API** - Complete backend implementation  
✅ **User Management** - Registration, authentication  
✅ **Web Interface** - React frontend  
✅ **Service Architecture** - Pluggable services  
✅ **Basic Automation** - Area creation  
✅ **Database** - Supabase integration  
✅ **Authentication** - JWT tokens  
✅ **Required Endpoints** - /about.json compliance  

## 🎯 Next Steps

1. **Service Integration** - Add real services (Gmail, GitHub, etc.)
2. **OAuth Implementation** - Third-party authentication
3. **Advanced Triggers** - Webhook support
4. **UI Enhancement** - Better user experience
5. **Mobile Support** - React Native app
6. **Deployment** - Docker containerization

## 📚 Documentation

- [Backend API](./backend/README.md) - Detailed API documentation
- [Frontend Guide](./frontend/web/README.md) - Frontend development guide
- [Project Specification](./docs/reference/) - Original requirements

## 📄 License

Educational project for Epitech - Area Module
>>>>>>> 22-services-api-ready---spotfy
