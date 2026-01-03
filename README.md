# AREA Platform Backend

Plateforme d'automatisation type n8n / IFTTT où les utilisateurs créent des AREA (Action–REAction) entre des services externes (Twitch, Discord, Gmail, etc.).

## Concept

- Un **AREA** = 1 Action (trigger) + 1..N Réactions.
- Une **Action** est un module qui détecte un événement (polling ou webhook) sur un service externe.
- Une **Réaction** est un module qui exécute une action sur un service externe (envoyer un message, un mail, créer un fichier, etc.).
- Les utilisateurs connectent leurs comptes (OAuth2) et composent des AREA à partir de la librairie de services et de modules.

Exemple :  
> Quand je lance un live Twitch (Action), alors envoyer un message sur Discord et un email à mes admins (deux Réactions).

## Architecture globale

### Vue d’ensemble

- **Frontend** (hors scope ici) : UI web pour gérer les AREA, visualiser les exécutions, etc.
- **Backend API (main)** :
  - API REST (users, auth, services, AREA, logs, webhooks).
  - Scheduler des actions en polling.
  - Webhook endpoints pour les services externes.
  - Pousse les jobs d’exécution dans une **queue** (Redis ou équivalent).
- **Workers** :
  - Consomment la queue.
  - Chargent la définition d’un AREA dans la base.
  - Exécutent séquentiellement / en parallèle l’Action + les Réactions.
  - Loguent les exécutions.

- **Supabase (Postgres + Auth)** :
  - Stocke users, services, AREA, hooks, logs (schéma décrit dans `docs/DB_SCHEMA.md`).
- **Queue (Redis)** :
  - Transporte les jobs “exécuter AREA X pour hook Y”.

## Tech stack cible (backend)

- Langage : TypeScript (Node.js) ou Go (à adapter selon ton choix, les interfaces sont pensées pour les deux).
- API HTTP : Express / Fastify / Gin / Echo / autre.
- Queue : Redis + BullMQ / RSMQ / library équivalente, ou RabbitMQ.
- Auth : JWT + Supabase Auth (email/password + OAuth).
- Déploiement : Docker + Kubernetes.

## Organisation du repo

- `src/`
  - `api/` : routes HTTP.
  - `core/engine/` : moteur d’exécution des AREA.
  - `core/nodes/` : modules Action/Reaction pour chaque service.
  - `core/queue/` : abstraction de la queue.
  - `core/services/` : accès DB, gestion des modèles.
  - `workers/` : entrypoint worker.
  - `main/` : entrypoint API.
- `docs/`
  - `ARCHITECTURE.md`
  - `ENGINE_DESIGN.md`
  - `DB_SCHEMA.md`
  - `API_SPEC.md`
  - `HOWTOCONTRIBUTE.md`
- `deploy/`
  - `k8s/` : manifests Kubernetes.
  - `docker/` : Dockerfiles, docker-compose de dev.

Voir les fichiers de `docs/` pour les détails d’implémentation.
