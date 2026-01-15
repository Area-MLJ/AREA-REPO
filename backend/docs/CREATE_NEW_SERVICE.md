# Guide : Créer un Nouveau Service

Ce guide explique comment créer un nouveau service avec des actions et/ou réactions en utilisant le système JSON.

## Structure requise

Créez un nouveau dossier dans `backend/services/` avec la structure suivante :

```
backend/services/
└── mon_service/
    ├── service.json
    ├── actions/
    │   └── mon_action.json
    └── reactions/
        └── ma_reaction.json
```

## 1. Créer service.json

Créez `backend/services/mon_service/service.json` :

```json
{
  "name": "mon_service",
  "display_name": "Mon Service",
  "description": "Description de votre service",
  "icon_url": "https://example.com/icon.png",
  "built_in": true,
  "oauth_required": false
}
```

**Champs** :
- `name` : Identifiant unique (snake_case)
- `display_name` : Nom affiché à l'utilisateur
- `description` : Description du service
- `icon_url` : URL de l'icône (optionnel)
- `built_in` : `true` si service intégré, `false` si externe
- `oauth_required` : `true` si nécessite OAuth, `false` sinon

## 2. Créer une action (optionnel)

Créez `backend/services/mon_service/actions/mon_action.json` :

```json
{
  "name": "mon_action",
  "display_name": "Mon Action",
  "description": "Description de l'action",
  "polling_supported": true,
  "webhook_supported": false,
  "params": [
    {
      "name": "param1",
      "display_name": "Paramètre 1",
      "description": "Description du paramètre",
      "type": "text",
      "required": true,
      "default": null
    }
  ]
}
```

**Champs** :
- `name` : Identifiant unique de l'action
- `display_name` : Nom affiché
- `description` : Description
- `polling_supported` : `true` si supporte le polling
- `webhook_supported` : `true` si supporte les webhooks
- `params` : Tableau des paramètres (optionnel)

**Types de paramètres** :
- `text` : Texte libre
- `email` : Adresse email
- `number` : Nombre
- `boolean` : Booléen
- `select` : Liste de choix (nécessite `enum_values`)

## 3. Créer une réaction (optionnel)

Créez `backend/services/mon_service/reactions/ma_reaction.json` :

```json
{
  "name": "ma_reaction",
  "display_name": "Ma Réaction",
  "description": "Description de la réaction",
  "params": [
    {
      "name": "param1",
      "display_name": "Paramètre 1",
      "description": "Description du paramètre",
      "type": "text",
      "required": true
    }
  ]
}
```

## 4. Implémenter le code TypeScript

Créez les fichiers de code correspondants :

### Action : `backend/src/core/nodes/actions/mon_service/index.ts`

```typescript
import { ActionNode, ActionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

export const monAction: ActionNode = {
  type: 'action',
  service: 'mon_service',
  name: 'mon_action',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ActionResult> => {
    // Votre logique ici
    return {
      triggered: true,
      output: { /* données */ },
    };
  },
};
```

### Réaction : `backend/src/core/nodes/reactions/mon_service/index.ts`

```typescript
import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

export const maReaction: ReactionNode = {
  type: 'reaction',
  service: 'mon_service',
  name: 'ma_reaction',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    // Votre logique ici
    return {
      success: true,
      output: { /* données */ },
    };
  },
};
```

## 5. Enregistrer dans le registry

Ajoutez vos nodes dans `backend/src/core/nodes/registry-init.ts` :

```typescript
import { monAction } from './actions/mon_service';
import { maReaction } from './reactions/mon_service';

export function initializeRegistry(): void {
  // ...
  registerAction(monAction);
  registerReaction(maReaction);
}
```

## 6. Synchronisation automatique

Une fois les fichiers JSON créés :

1. **En développement** : Le watch mode détecte automatiquement les changements et synchronise
2. **En production** : La synchronisation se fait au démarrage ou périodiquement
3. **Manuellement** : `npm run sync-services` ou `POST /api/admin/sync-services`

## Vérification

Vérifiez que votre service est bien synchronisé :

```bash
# Voir les services
GET /api/services

# Voir les actions d'un service
GET /api/services/{service_id}/actions

# Voir les réactions d'un service
GET /api/services/{service_id}/reactions
```

## Exemple complet : Service Weather

Voir `backend/services/news/` et `backend/services/mail/` pour des exemples complets.

## Bonnes pratiques

1. **Nommage** : Utilisez `snake_case` pour les noms (service, action, réaction)
2. **Validation** : Validez vos JSON avec un validateur JSON avant de les commiter
3. **Documentation** : Documentez bien les paramètres dans les descriptions
4. **Types** : Utilisez les types appropriés pour les paramètres
5. **Defaults** : Fournissez des valeurs par défaut quand c'est possible

