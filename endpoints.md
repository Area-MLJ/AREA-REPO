# Endpoints Twitch utiles pour AREA

## Authentification / Tokens

### `POST https://id.twitch.tv/oauth2/token`

- **Description** : échange un `code` d’autorisation ou un `refresh_token` contre un `access_token` (ou régénère un token).
- **Usage AREA (action)** :
  - Récupérer un token utilisateur après login Twitch.
  - Rafraîchir le token périodiquement pour garder l’accès aux APIs.

### `GET https://id.twitch.tv/oauth2/validate`

- **Description** : vérifie qu’un `access_token` est encore valide et renvoie ses scopes, `client_id`, `user_id`.
- **Usage AREA (action)** :
  - Vérifier que le token est toujours bon avant d’appeler d’autres endpoints.
  - Déclencher une réaction si le token est expiré (par ex. prévenir l’utilisateur).

---

## Utilisateur

### `GET https://api.twitch.tv/helix/users`

- **Description** : renvoie les infos du compte (`id`, `display_name`, `email` si scope `user:read:email`, etc.).
- **Scopes** : `user:read:email` pour avoir l’email, sinon juste les infos publiques.
- **Usage AREA (action)** :
  - Récupérer et sauvegarder `user_id` (ce que tu fais déjà).
  - Vérifier le pseudo, l’email, l’avatar pour des intégrations.

---

## Follows

### `GET https://api.twitch.tv/helix/channels/followed?user_id={user_id}`

- **Description** : retourne la liste des chaînes suivies par un utilisateur.
- **Scopes** : `user:read:follows`.
- **Usage AREA (actions)** :
  - Détecter si un utilisateur suit une chaîne donnée.
  - Lister toutes les chaînes suivies pour déclencher des réactions (ex : “quand un streamer suivi est en live”).

### `GET https://api.twitch.tv/helix/users/follows?from_id={user_id}`

- **Description** : ancienne route de follow, encore utile pour certains cas (from → to).
- **Usage AREA (actions)** :
  - Lister les follows de l’utilisateur de manière plus générique.

---

## Streams / Lives

### `GET https://api.twitch.tv/helix/streams?user_id={user_id}`

- **Description** : donne l’état du live pour un ou plusieurs utilisateurs (titre, jeu, `viewer_count`…).
- **Scopes** : public (pas forcément besoin de scope utilisateur).
- **Usage AREA (actions)** :
  - Déclencher une réaction “quand un streamer est en live”.
  - Récupérer le titre / jeu actuel pour construire un message.

---

## Chaînes / Informations de chaîne

### `GET https://api.twitch.tv/helix/channels?broadcaster_id={user_id}`

- **Description** : renvoie les infos de chaîne (titre du live, langue, catégorie…).
- **Usage AREA (actions)** :
  - Vérifier/capturer le titre actuel du stream.
  - Utiliser la catégorie/jeu comme donnée pour une autre API (Spotify, YouTube, etc).

### `PATCH https://api.twitch.tv/helix/channels?broadcaster_id={user_id}`

- **Description** : met à jour certaines infos de la chaîne (titre, catégorie…).
- **Scopes** : `channel:manage:broadcast`.
- **Usage AREA (réactions)** :
  - Réaction du style : “quand X arrive, change automatiquement le titre du stream”.
  - Mettre à jour la catégorie du live en fonction d’un événement externe.

---

## Clips

### `POST https://api.twitch.tv/helix/clips?broadcaster_id={user_id}`

- **Description** : crée un clip sur le live de l’utilisateur.
- **Scopes** : `clips:edit`.
- **Usage AREA (réactions)** :
  - Créer un clip automatiquement quand un événement arrive (ex : un pic de viewers, un trigger depuis une autre API).

### `GET https://api.twitch.tv/helix/clips?broadcaster_id={user_id}`

- **Description** : liste les clips d’un streamer.
- **Usage AREA (actions)** :
  - Récupérer le dernier clip pour l’envoyer sur une autre plateforme.

---

## EventSub (webhooks temps réel – si tu vas plus loin)

### `POST https://api.twitch.tv/helix/eventsub/subscriptions`

- **Description** : s’abonner à des événements temps réel (stream online, follow, sub, etc.).
- **Usage AREA (actions déclencheurs)** :
  - Action “Quand un utilisateur est follow par quelqu’un”.
  - Action “Quand un stream passe en live / offline”.
  - Action “Quand un utilisateur reçoit un sub”.

> Nécessite un serveur HTTP accessible par Twitch pour recevoir les webhooks.

---

## Exemples de mapping Action / Réaction pour AREA

### Exemple 1 : streamer suivi passe en live

- **Action** : “Quand un streamer suivi passe en live”
- **Endpoint** : `GET /helix/streams` (ou EventSub `stream.online`).
- **Réaction possible** :
  - Envoyer un mail (via Gmail).
  - Créer une playlist Spotify avec le titre du stream.
  - Poster un message dans un autre service (Discord, etc.).

### Exemple 2 : nouvel abonnement à une chaîne

- **Action** : “Quand un user suit une nouvelle chaîne”
- **Endpoint** : `GET /helix/channels/followed` (poll) ou EventSub `channel.follow`.
- **Réaction** :
  - Ajouter une entrée dans une base de données.
  - Déclencher une autre API (par ex. envoyer un mail de notif).