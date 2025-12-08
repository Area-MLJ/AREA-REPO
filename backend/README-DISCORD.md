# 🤖 Discord Service Integration

## 📋 Overview

Ce service Discord propre intègre votre système AREA avec Discord pour permettre :
- **Actions Discord** : Déclencher des AREAs sur les événements Discord
- **Réactions Discord** : Exécuter des actions en réponse aux AREAs
- **Commandes Slash** : Gérer les AREAs directement depuis Discord

## 🏗️ Architecture

```
backend/src/services/discord/
├── types.ts                    # Types TypeScript
├── config.ts                   # Configuration et mappings
├── client.ts                   # Manager du client Discord
├── index.ts                    # Exports principaux
├── deploy-commands.ts          # Déploiement des slash commands
├── executors/
│   ├── area-executor.ts        # Exécution des AREAs
│   └── reaction-executor.ts    # Exécution des réactions
└── handlers/
    ├── event-handler.ts        # Gestion des événements Discord
    └── command-handler.ts      # Gestion des slash commands
```

## ⚙️ Configuration

### Variables d'environnement requises :

```bash
# Discord Bot
DISCORD_TOKEN=your_discord_bot_token
DISCORD_APPLICATION_ID=your_discord_app_id

# Email (pour les réactions)
RESEND_API_KEY=your_resend_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=admin@yourdomain.com

# Logging (optionnel)
DISCORD_LOG_LEVEL=info
```

### Obtenir les tokens Discord :

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer une nouvelle application
3. Aller dans "Bot" → Copier le token
4. Copier l'Application ID depuis "General Information"

## 🚀 Démarrage

### 1. Installation des dépendances
```bash
cd backend
npm install
```

### 2. Déployer les slash commands
```bash
npm run deploy-discord-commands
```

### 3. Démarrer le backend
```bash
npm run dev
```

Le service Discord se lance automatiquement avec le backend.

## 📡 Événements Discord Supportés

### Actions (Déclencheurs)
- **MessageCreate** : Nouveau message envoyé
- **GuildMemberAdd** : Utilisateur rejoint le serveur  
- **GuildMemberRemove** : Utilisateur quitte le serveur
- **MessageReactionAdd** : Réaction ajoutée à un message

### Réactions (Responses)
- **Email/Resend** : Envoie un email
- **Discord Message** : Envoie un message Discord
- **Webhook** : Appelle un webhook HTTP

## 🎯 Slash Commands

| Commande | Description | Paramètres |
|----------|-------------|------------|
| `/areas` | Liste toutes les AREAs | - |
| `/area` | Détails d'une AREA | `id` |
| `/trigger` | Déclenche une AREA | `id` |
| `/toggle` | Active/désactive une AREA | `id` |
| `/stats` | Statistiques des AREAs | - |

## 🔌 API Endpoints

### `GET /api/discord/health`
Vérifie l'état du service Discord.

**Response :**
```json
{
  "success": true,
  "data": {
    "service": "discord",
    "status": "healthy",
    "ready": true,
    "uptime": 1234567
  }
}
```

### `POST /api/discord/trigger?areaId={id}`
Déclenche une AREA manuellement.

**Body :**
```json
{
  "eventData": {
    "message": "Test message",
    "author": "User#1234"
  }
}
```

## 🔄 Flux d'Exécution

1. **Événement Discord** → `EventHandler`
2. **Matching des AREAs** → `AreaExecutor.getMatchingAreas()`
3. **Exécution parallèle** → `ReactionExecutor.executeReaction()`
4. **Logging complet** → Base de données + Logger

## 🛠️ Développement

### Ajouter un nouvel événement Discord

1. **Étendre les types** dans `types.ts` :
```typescript
export type DiscordEventType = 
  | 'messageCreate'
  | 'newEventType'  // ← Ajouter ici
```

2. **Ajouter le mapping** dans `config.ts` :
```typescript
export const ACTION_MAPPINGS = {
  newEventType: ['Nouvelle action Discord'],
  // ...
}
```

3. **Implémenter le handler** dans `event-handler.ts` :
```typescript
public async handleNewEvent(data: any): Promise<void> {
  await this.areaExecutor.triggerDiscordAreas('newEventType', eventData)
}
```

### Ajouter une nouvelle réaction

1. **Implémenter dans** `reaction-executor.ts` :
```typescript
case 'NewService':
  return await this.executeNewServiceReaction(reaction, eventData, executionId)
```

## 🔍 Monitoring & Debugging

### Logs structurés
Tous les événements sont loggés avec le format :
```
2024-12-08 13:45:23 [INFO] Discord event detected { eventType: "messageCreate", executionId: "discord_123456", ... }
```

### Health Check
```bash
curl http://localhost:8080/api/discord/health
```

### Base de données
- **`execution_logs`** : Historique d'exécution des AREAs
- **`hook_logs`** : Logs des événements Discord détectés

## 🚨 Gestion d'Erreurs

- **Resilience** : Une AREA qui échoue n'affecte pas les autres
- **Retry logic** : Pas implémenté (à ajouter si besoin)  
- **Graceful degradation** : Le backend fonctionne même si Discord est down
- **Logging complet** : Toutes les erreurs sont tracées

## 🔒 Sécurité

- **Token sécurisé** : Token Discord en variable d'environnement
- **Validation** : Tous les inputs sont validés
- **Rate limiting** : À implémenter selon les besoins
- **Sanitization** : Les données sensibles sont masquées dans les logs

## 📈 Performance

- **Exécution parallèle** : Les AREAs s'exécutent en parallèle
- **Connexion unique** : Un seul client Discord par instance
- **Cache** : Client Discord maintenu en mémoire
- **Logging asynchrone** : Les logs n'bloquent pas l'exécution

## 🔄 Prochaines étapes

- [ ] Rate limiting Discord API
- [ ] Retry logic pour les réactions échouées
- [ ] Cache intelligent des AREAs
- [ ] Métriques Prometheus
- [ ] Tests unitaires et d'intégration
- [ ] Documentation OpenAPI