# Areas Built-in - Documentation

## Vue d'ensemble

Les Areas built-in sont des modules Action/Reaction pré-configurés qui ne nécessitent pas d'authentification OAuth. Ils utilisent des clés API directement dans les variables d'environnement.

## Système de Définition JSON

Tous les services, actions et réactions sont définis dans des fichiers JSON dans `backend/services/`. Ces fichiers sont la **source de vérité** et sont automatiquement synchronisés avec la base de données.

### Structure des fichiers

```
backend/services/
├── news/
│   ├── service.json              # Définition du service
│   └── actions/
│       └── top_article.json     # Définition de l'action
├── mail/
│   ├── service.json
│   └── reactions/
│       └── send_email.json
└── ...
```

### Rechargement automatique

Le système détecte automatiquement les modifications des fichiers JSON :

- **Mode développement** : Watch mode avec `chokidar` - rechargement immédiat (< 500ms)
- **Mode production** : Synchronisation périodique toutes les 10 minutes
- **Synchronisation manuelle** : Endpoint `POST /api/admin/sync-services` ou commande `npm run sync-services`

### Format des fichiers JSON

#### service.json
```json
{
  "name": "news",
  "display_name": "News",
  "description": "Service pour récupérer des articles de news",
  "icon_url": "https://...",
  "built_in": true,
  "oauth_required": false
}
```

#### action.json / reaction.json
```json
{
  "name": "top_article",
  "display_name": "Top Article",
  "description": "Récupère le top article",
  "polling_supported": true,
  "webhook_supported": false,
  "params": [
    {
      "name": "keyword",
      "display_name": "Mot-clé",
      "description": "Mot-clé pour filtrer les articles",
      "type": "text",
      "required": false,
      "default": "technologie"
    }
  ]
}
```

### Synchronisation

Les fichiers JSON sont synchronisés avec la base de données :
- Au démarrage du worker et du scheduler
- Automatiquement lors des modifications (dev)
- Périodiquement en production
- Via l'endpoint API `/api/admin/sync-services`

**Important** : Modifier un fichier JSON met automatiquement à jour la base de données. Pas besoin de redémarrer le backend !

## Area News → Mail

### Description

Cette Area built-in permet de :
1. **Action News** : Récupérer automatiquement le top article de technologie
2. **Réaction Mail** : Envoyer cet article par email

### Configuration requise

#### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```bash
# News API (EventRegistry)
NEWS_API_KEY=your_eventregistry_api_key

# Mail API (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

#### Obtenir les clés API

1. **EventRegistry** (News) :
   - Créez un compte sur [EventRegistry](https://eventregistry.org/)
   - Récupérez votre clé API dans le dashboard
   - Ajoutez `NEWS_API_KEY` dans `.env`

2. **Resend** (Mail) :
   - Créez un compte sur [Resend](https://resend.com/)
   - Créez une clé API
   - Ajoutez `RESEND_API_KEY` dans `.env`
   - Configurez `EMAIL_FROM` avec un domaine vérifié dans Resend

### Installation dans la base de données

**Les services sont automatiquement synchronisés depuis les fichiers JSON !**

Au démarrage du backend (worker ou scheduler), les fichiers JSON dans `backend/services/` sont automatiquement chargés et synchronisés avec la base de données.

Pour forcer une synchronisation manuelle :

```bash
# Via commande npm
cd backend
npm run sync-services

# Avec watch mode (développement)
npm run sync-services:watch

# Via API (nécessite authentification)
POST /api/admin/sync-services
Authorization: Bearer <token>
```

**Note** : Les anciens scripts SQL (`seed-services.sql`, `seed-news-mail-services.sql`) ne sont plus nécessaires. Les JSON sont la source de vérité.

### Utilisation

#### 1. Créer une Area

Via l'API :

```bash
POST /api/me/areas
{
  "name": "News to Email",
  "description": "Envoie le top article de tech par email",
  "enabled": true
}
```

#### 2. Ajouter l'Action News

```bash
POST /api/me/areas/{area_id}/actions
{
  "service_action_id": "<id de news.top_article>",
  "user_service_id": null,  # Pas de user_service pour les built-in
  "enabled": true,
  "param_values": [
    {
      "service_action_param_id": "<id du param keyword>",
      "value_text": "technologie"  # Optionnel, défaut: "technologie"
    }
  ]
}
```

**Note** : Pour les services built-in, `user_service_id` peut être `null` ou un UUID factice. Le système détectera que c'est un service built-in.

#### 3. Créer un Hook Job (Polling)

```bash
POST /api/me/areas/{area_id}/hooks
{
  "type": "polling",
  "polling_interval_seconds": 3600  # Vérifie toutes les heures
}
```

#### 4. Ajouter la Réaction Mail

```bash
POST /api/me/areas/{area_id}/reactions
{
  "service_reaction_id": "<id de mail.send_email>",
  "user_service_id": null,  # Pas de user_service pour les built-in
  "enabled": true,
  "position": 0,
  "param_values": [
    {
      "service_reaction_param_id": "<id du param to>",
      "value_text": "user@example.com"
    }
  ]
}
```

### Fonctionnement

1. **Scheduler** : Toutes les heures (ou selon `polling_interval_seconds`), le scheduler exécute l'action News
2. **Action News** : Récupère le top article de technologie via EventRegistry
3. **Si déclenché** : Crée un `hook_log` avec les données de l'article
4. **Worker** : Traite le job et exécute la réaction Mail
5. **Réaction Mail** : Envoie un email formaté avec l'article via Resend

### Format de l'email

L'email envoyé contient :
- **Titre** : 📰 {titre de l'article}
- **Source** : Nom de la source
- **Description** : Description ou corps de l'article
- **Lien** : Bouton pour lire l'article complet

### Exemple de données

**Output de l'Action News** :
```json
{
  "triggered": true,
  "output": {
    "title": "Nouvelle technologie révolutionnaire",
    "description": "Description de l'article...",
    "url": "https://example.com/article",
    "source": "TechNews",
    "keyword": "technologie",
    "timestamp": "2026-01-07T10:00:00.000Z"
  }
}
```

**Input de la Réaction Mail** :
Les données de `output` sont automatiquement passées à la réaction via `ctx.input`.

### Dépannage

#### L'action ne se déclenche pas

- Vérifiez que `NEWS_API_KEY` est défini
- Vérifiez les logs du scheduler : `./scripts/manage-backend.sh logs scheduler`
- Vérifiez que le hook job est actif : `GET /api/me/areas/{area_id}/hooks`

#### L'email n'est pas envoyé

- Vérifiez que `RESEND_API_KEY` est défini
- Vérifiez que `EMAIL_FROM` est un domaine vérifié dans Resend
- Vérifiez les logs du worker : `./scripts/manage-backend.sh logs worker`
- Vérifiez les logs d'exécution : `GET /api/me/areas/{area_id}/executions`

#### Erreur "User service not found"

Pour les services built-in, vous pouvez :
1. Créer un `user_service` factice avec `service_id` = service built-in
2. Ou modifier le code pour gérer les services built-in sans `user_service`

## Prochaines étapes

Une fois cette Area built-in fonctionnelle, vous pouvez :
1. Implémenter d'autres Areas built-in de la même manière
2. Ajouter plus de paramètres aux actions/réactions
3. Implémenter les services modulaires (avec OAuth)

