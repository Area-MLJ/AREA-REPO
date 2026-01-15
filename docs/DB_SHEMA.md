# Schéma de base de données (Supabase)

La DB est hébergée via Supabase (Postgres). Le schéma suivant est déjà défini (simplifié ici pour la doc).

## Utilisateurs & sessions

- `users` : informations de base (email, mot de passe hash, display name, vérification).
- `user_sessions` : sessions / tokens.
- `oauth_identities` : comptes OAuth (provider, provider_user_id, tokens).

## Services & modules

- `services` :
  - Liste des services intégrés (twitch, discord, gmail, etc.).
- `service_actions` :
  - Actions possibles d’un service (triggers).
  - Champs :
    - `polling_supported` (true/false)
    - `webhook_supported` (true/false)
- `service_action_params` :
  - Paramètres configurables pour une action (ex: channel Twitch, mots-clés).
- `service_reactions` :
  - Réactions disponibles pour un service (ex: envoyer message).
- `service_reaction_params` :
  - Paramètres configurables pour une réaction (ex: channel Discord, contenu du message).

## Connexions utilisateur / service

- `user_services` :
  - Associe un `user_id` à un `service_id` et à un compte OAuth spécifique (`oauth_account_id`).
  - Stocke `access_token`, `refresh_token`, `token_expires_at`.

## AREA

- `areas` :
  - Entité principale définie par utilisateur (nom, description, enabled).
- `area_actions` :
  - Associe une AREA à une `service_action`.
  - Référence le `user_service` qui fournit les credentials à utiliser.
- `area_action_param_values` :
  - Valeurs des paramètres pour cette action (texte ou JSON).

- `area_reactions` :
  - Associe une AREA à une `service_reaction`.
  - Référence le `user_service` à utiliser.
  - `position` permet d’ordonner les réactions si besoin.
- `area_reaction_param_values` :
  - Valeurs des paramètres pour cette réaction.

## Hooks & exécutions

- `hook_jobs` :
  - Configure la façon de déclencher une action pour un `area_action` donné.
  - Champs clés :
    - `type` : `polling` ou `webhook`.
    - `polling_interval_seconds`.
    - `webhook_endpoint` : chemin unique pour ce job.
    - `status` : actif/inactif.
- `hook_logs` :
  - Chaque événement détecté (polling ou webhook) crée un log.
  - Contient le `event_payload` brut.
  - `processed` indique si un worker a déjà traité cet événement.

- `execution_logs` :
  - Historique des exécutions d’AREA.
  - `area_id`, `area_action_id`, `area_reaction_id` (optionnel).
  - `status` : running, success, failed, skipped, partial_success.
  - `request_payload`, `response_payload`, `error_text`.

- `audit_logs` :
  - Log fonctionnel (actions admin/utilisateur sur la config).

Ce schéma permet de reconstruire en mémoire la définition complète d’un AREA ainsi que l’historique de ses exécutions.
