# Spécification API Backend AREA

## Base URL

- Développement : `http://localhost:8080`
- Production : À configurer

## Authentification

La plupart des endpoints nécessitent un token JWT dans le header `Authorization` :

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentification

#### POST /api/auth/register

Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "John Doe" // optionnel
}
```

**Réponse 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe"
  },
  "access_token": "jwt_token",
  "refresh_token": "jwt_refresh_token"
}
```

#### POST /api/auth/login

Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe"
  },
  "access_token": "jwt_token",
  "refresh_token": "jwt_refresh_token"
}
```

#### POST /api/auth/refresh

Rafraîchir le token d'accès.

**Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Réponse 200:**
```json
{
  "access_token": "new_jwt_token"
}
```

### Services

#### GET /api/services

Liste tous les services disponibles.

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "name": "discord",
    "display_name": "Discord",
    "description": "Service Discord",
    "icon_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/services/:id/actions

Liste les actions disponibles pour un service.

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "service_id": "uuid",
    "name": "new_message",
    "display_name": "Nouveau message",
    "description": "Déclenché quand un nouveau message est reçu",
    "polling_supported": true,
    "webhook_supported": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/services/:id/reactions

Liste les réactions disponibles pour un service.

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "service_id": "uuid",
    "name": "send_message",
    "display_name": "Envoyer un message",
    "description": "Envoie un message dans un channel",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### User Services

#### GET /api/me/services

Liste les connexions de services de l'utilisateur authentifié.

**Headers:** `Authorization: Bearer <token>`

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "service_id": "uuid",
    "display_name": "Mon compte Discord",
    "oauth_account_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/me/services

Crée une connexion de service pour l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "service_id": "uuid",
  "oauth_account_id": "uuid", // optionnel
  "access_token": "token", // optionnel
  "refresh_token": "token", // optionnel
  "token_expires_at": "2024-12-31T23:59:59Z", // optionnel
  "display_name": "Mon compte" // optionnel
}
```

**Réponse 201:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "service_id": "uuid",
  ...
}
```

### AREA

#### GET /api/me/areas

Liste les AREA de l'utilisateur authentifié.

**Headers:** `Authorization: Bearer <token>`

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Mon AREA",
    "description": "Description",
    "enabled": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/me/areas

Crée une nouvelle AREA.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Mon AREA",
  "description": "Description", // optionnel
  "enabled": true // optionnel, défaut: true
}
```

**Réponse 201:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Mon AREA",
  ...
}
```

#### PUT /api/me/areas/:id

Met à jour une AREA.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nouveau nom", // optionnel
  "description": "Nouvelle description", // optionnel
  "enabled": false // optionnel
}
```

#### DELETE /api/me/areas/:id

Supprime une AREA.

**Headers:** `Authorization: Bearer <token>`

**Réponse 200:**
```json
{
  "message": "Area deleted"
}
```

#### POST /api/me/areas/:id/actions

Ajoute une action à une AREA.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "service_action_id": "uuid",
  "user_service_id": "uuid",
  "enabled": true, // optionnel
  "param_values": [ // optionnel
    {
      "service_action_param_id": "uuid",
      "value_text": "valeur",
      "value_json": "{\"key\": \"value\"}" // optionnel
    }
  ]
}
```

**Réponse 201:**
```json
{
  "id": "uuid",
  "area_id": "uuid",
  "service_action_id": "uuid",
  ...
}
```

#### POST /api/me/areas/:id/reactions

Ajoute une réaction à une AREA.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "service_reaction_id": "uuid",
  "user_service_id": "uuid",
  "position": 0, // optionnel
  "enabled": true, // optionnel
  "param_values": [ // optionnel
    {
      "service_reaction_param_id": "uuid",
      "value_text": "valeur",
      "value_json": "{\"key\": \"value\"}" // optionnel
    }
  ]
}
```

**Réponse 201:**
```json
{
  "id": "uuid",
  "area_id": "uuid",
  "service_reaction_id": "uuid",
  ...
}
```

#### GET /api/me/areas/:id/hooks

Liste les hooks d'une AREA.

**Headers:** `Authorization: Bearer <token>`

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "area_action_id": "uuid",
    "type": "polling",
    "polling_interval_seconds": 60,
    "status": "active",
    ...
  }
]
```

#### POST /api/me/areas/:id/hooks

Crée un hook pour une AREA.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "area_action_id": "uuid",
  "type": "polling", // ou "webhook"
  "polling_interval_seconds": 60, // requis si type="polling"
  "webhook_endpoint": "unique-endpoint-id", // requis si type="webhook"
  "status": "active" // optionnel, défaut: "active"
}
```

**Réponse 201:**
```json
{
  "id": "uuid",
  "area_action_id": "uuid",
  "type": "polling",
  ...
}
```

#### GET /api/me/areas/:id/executions

Liste les logs d'exécution d'une AREA.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `limit` : Nombre de résultats (défaut: 100)

**Réponse 200:**
```json
[
  {
    "id": "uuid",
    "area_id": "uuid",
    "area_action_id": "uuid",
    "status": "success",
    "started_at": "2024-01-01T00:00:00Z",
    "finished_at": "2024-01-01T00:00:01Z",
    "request_payload": "...",
    "response_payload": "...",
    "error_text": null
  }
]
```

### Webhooks

#### POST /api/webhooks/:service/:hookJobId

Endpoint public pour recevoir les webhooks des services externes.

**Body:** Payload brut (texte ou JSON) selon le service

**Réponse 200:**
```json
{
  "message": "Webhook received",
  "hook_log_id": "uuid"
}
```

### About

#### GET /about.json

Informations sur les services disponibles (conforme au sujet).

**Réponse 200:**
```json
{
  "client": {
    "host": "10.101.53.35"
  },
  "server": {
    "current_time": 1531680780,
    "services": [
      {
        "name": "discord",
        "actions": [
          {
            "name": "new_message",
            "description": "Un nouveau message est reçu"
          }
        ],
        "reactions": [
          {
            "name": "send_message",
            "description": "Envoyer un message"
          }
        ]
      }
    ]
  }
}
```

## Codes d'erreur

- `200` : Succès
- `201` : Créé
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Interdit
- `404` : Non trouvé
- `409` : Conflit (ex: utilisateur existe déjà)
- `500` : Erreur serveur

## Rate Limiting

À implémenter selon les besoins.

