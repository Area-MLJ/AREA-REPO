# Guide de contribution - Ajouter un nouveau service

Ce guide explique comment ajouter un nouveau service (avec ses actions et réactions) à la plateforme AREA.

## Vue d'ensemble

Pour ajouter un nouveau service, vous devez :

1. Créer les modules Action/Reaction dans le code
2. Enregistrer les modules dans le registry
3. Ajouter les données dans la base de données (services, service_actions, service_reactions, paramètres)

## Étape 1 : Créer les modules Action/Reaction

### Structure des fichiers

Créez les fichiers dans `src/core/nodes/` :

```
src/core/nodes/
├── actions/
│   └── votre-service/
│       └── index.ts
└── reactions/
    └── votre-service/
        └── index.ts
```

### Exemple : Action

```typescript
// src/core/nodes/actions/votre-service/index.ts
import { ActionNode, ActionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

export const votreServiceAction: ActionNode = {
  type: 'action',
  service: 'votre-service', // Nom du service (doit correspondre à la DB)
  name: 'nom_action', // Nom de l'action (doit correspondre à la DB)
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ActionResult> => {
    // Récupérer les credentials depuis user_service
    const userService = await ctx.supabaseClient
      .from('user_services')
      .select('*')
      .eq('id', ctx.userServiceId)
      .single();

    if (!userService.data || !userService.data.access_token) {
      throw new Error('Access token not found');
    }

    // Utiliser ctx.httpClient pour faire des requêtes HTTP
    // Utiliser ctx.logger pour logger
    // Utiliser params pour les paramètres configurés par l'utilisateur

    const response = await ctx.httpClient.get(
      'https://api.votre-service.com/endpoint',
      {
        Authorization: `Bearer ${userService.data.access_token}`,
      }
    );

    // Détecter si l'événement s'est produit
    const triggered = response.someCondition;

    return {
      triggered,
      output: triggered ? response.data : undefined,
    };
  },
};
```

### Exemple : Réaction

```typescript
// src/core/nodes/reactions/votre-service/index.ts
import { ReactionNode, ReactionResult } from '../../base';
import { NodeContext } from '../../../engine/node-context';

export const votreServiceReaction: ReactionNode = {
  type: 'reaction',
  service: 'votre-service',
  name: 'nom_reaction',
  execute: async (ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult> => {
    // Récupérer les credentials
    const userService = await ctx.supabaseClient
      .from('user_services')
      .select('*')
      .eq('id', ctx.userServiceId)
      .single();

    if (!userService.data || !userService.data.access_token) {
      throw new Error('Access token not found');
    }

    // Exécuter l'action
    const response = await ctx.httpClient.post(
      'https://api.votre-service.com/endpoint',
      {
        // Données depuis params et ctx.input (données de l'action)
        message: params.message || ctx.input.message,
      },
      {
        Authorization: `Bearer ${userService.data.access_token}`,
      }
    );

    return {
      success: true,
      output: response,
    };
  },
};
```

## Étape 2 : Enregistrer les modules

Modifiez `src/core/nodes/registry-init.ts` :

```typescript
import { registerAction, registerReaction } from './registry';

// Importer vos nouveaux modules
import { votreServiceAction } from './actions/votre-service';
import { votreServiceReaction } from './reactions/votre-service';

export function initializeRegistry(): void {
  // ... modules existants ...

  // Enregistrer vos nouveaux modules
  registerAction(votreServiceAction);
  registerReaction(votreServiceReaction);
}
```

## Étape 3 : Ajouter les données dans la base

### 3.1 Créer le service

```sql
INSERT INTO services (name, display_name, description, icon_url)
VALUES ('votre-service', 'Votre Service', 'Description du service', 'https://...');
```

### 3.2 Créer les actions

```sql
-- Récupérer l'ID du service créé
-- Supposons que l'ID soit 'service-uuid'

INSERT INTO service_actions (service_id, name, display_name, description, polling_supported, webhook_supported)
VALUES (
  'service-uuid',
  'nom_action',
  'Nom de l''action affiché',
  'Description de l''action',
  true,  -- Supporte le polling
  false  -- Ne supporte pas les webhooks
);
```

### 3.3 Créer les paramètres des actions

```sql
-- Récupérer l'ID de l'action créée
-- Supposons que l'ID soit 'action-uuid'

INSERT INTO service_action_params (
  service_action_id,
  name,
  display_name,
  data_type,
  required,
  position,
  description
)
VALUES (
  'action-uuid',
  'param_name',
  'Nom du paramètre',
  'string',  -- ou 'number', 'boolean', 'json'
  true,
  0,
  'Description du paramètre'
);
```

### 3.4 Créer les réactions

```sql
INSERT INTO service_reactions (service_id, name, display_name, description)
VALUES (
  'service-uuid',
  'nom_reaction',
  'Nom de la réaction affiché',
  'Description de la réaction'
);
```

### 3.5 Créer les paramètres des réactions

```sql
-- Récupérer l'ID de la réaction créée
INSERT INTO service_reaction_params (
  service_reaction_id,
  name,
  display_name,
  data_type,
  required,
  position,
  description
)
VALUES (
  'reaction-uuid',
  'param_name',
  'Nom du paramètre',
  'string',
  true,
  0,
  'Description'
);
```

## Exemple complet : Service Timer

### 1. Module Action

```typescript
// src/core/nodes/actions/timer/index.ts
export const timerAction: ActionNode = {
  type: 'action',
  service: 'timer',
  name: 'specific_datetime',
  execute: async (ctx, params) => {
    const { date, time } = params;
    const now = new Date();
    // ... logique de détection ...
    return { triggered: true, output: { ... } };
  },
};
```

### 2. Enregistrement

```typescript
// registry-init.ts
registerAction(timerAction);
```

### 3. Base de données

```sql
-- Service
INSERT INTO services (name, display_name) VALUES ('timer', 'Timer');

-- Action
INSERT INTO service_actions (service_id, name, display_name, polling_supported)
VALUES ((SELECT id FROM services WHERE name = 'timer'), 'specific_datetime', 'Date/Heure spécifique', true);

-- Paramètres
INSERT INTO service_action_params (service_action_id, name, display_name, data_type, required)
VALUES 
  ((SELECT id FROM service_actions WHERE name = 'specific_datetime'), 'date', 'Date (DD/MM)', 'string', false),
  ((SELECT id FROM service_actions WHERE name = 'specific_datetime'), 'time', 'Heure (HH:MM)', 'string', false);
```

## Bonnes pratiques

1. **Gestion des erreurs** : Toujours gérer les erreurs et logger avec `ctx.logger`
2. **Validation des paramètres** : Valider les paramètres requis
3. **Refresh tokens** : Implémenter le refresh automatique des tokens OAuth si nécessaire
4. **Rate limiting** : Respecter les limites d'API des services externes
5. **Documentation** : Documenter les paramètres et leur format

## Tests

Après avoir ajouté un service :

1. Vérifier que `/api/services` liste le nouveau service
2. Vérifier que `/api/services/:id/actions` et `/api/services/:id/reactions` fonctionnent
3. Créer une AREA de test avec le nouveau service
4. Tester l'exécution complète

## Support OAuth

Si votre service nécessite OAuth :

1. Implémenter le flux OAuth dans le frontend
2. Stocker les tokens dans `user_services` via `POST /api/me/services`
3. Utiliser les tokens dans les modules Action/Reaction via `ctx.userServiceId`

## Questions ?

Consultez les modules existants dans `src/core/nodes/actions/` et `src/core/nodes/reactions/` pour des exemples.

