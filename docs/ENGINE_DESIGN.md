# Design du moteur d’exécution

## Objectif

Fournir un moteur générique capable de :

- Charger la définition d’une AREA depuis la DB.
- Exécuter une Action (trigger) + plusieurs Réactions.
- Supporter différentes implémentations de modules (Twitch, Discord, Gmail, etc.).
- Gérer erreurs, retries, parallélisme.

## Concepts

### NodeContext

Représente le contexte d’exécution d’un module.

```ts
export type NodeContext = {
  areaId: string;
  areaActionId?: string;
  areaReactionId?: string;
  userId: string;
  userServiceId: string;
  input: any; // données provenant de l’Action ou de la Reaction précédente
  logger: Logger;
  httpClient: HttpClient;
  supabaseClient: SupabaseClient;
};
