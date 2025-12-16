# Endpoints Spotify utiles pour AREA

## Authentification / Tokens

### `POST https://accounts.spotify.com/api/token` — Client Credentials

- **Description** : obtient un `access_token` d’application (sans utilisateur) à partir de `client_id` / `client_secret`.
- **Corps (x-www-form-urlencoded)** :
  - `grant_type=client_credentials`
  - `client_id={CLIENT_ID}`
  - `client_secret={CLIENT_SECRET}`
- **Usage AREA (actions)** :
  - Appels qui ne dépendent pas d’un utilisateur précis (recherche de titres, artistes, etc.).

---

### `POST https://accounts.spotify.com/api/token` — Authorization Code

- **Description** : échange un `code` utilisateur (obtenu après login) contre un `access_token` + `refresh_token`.
- **Corps (x-www-form-urlencoded)** :
  - `grant_type=authorization_code`
  - `code={CODE}`
  - `redirect_uri={REDIRECT_URI}`
  - `client_id={CLIENT_ID}`
  - `client_secret={CLIENT_SECRET}`
- **Usage AREA (actions)** :
  - Récupérer un token lié au compte Spotify de l’utilisateur pour contrôler sa lecture, ses playlists, etc.

---

### `POST https://accounts.spotify.com/api/token` — Refresh Token

- **Description** : régénère un `access_token` à partir d’un `refresh_token`.
- **Corps (x-www-form-urlencoded)** :
  - `grant_type=refresh_token`
  - `refresh_token={REFRESH_TOKEN}`
  - `client_id={CLIENT_ID}`
  - `client_secret={CLIENT_SECRET}`
- **Usage AREA (actions)** :
  - Garder un accès long terme au compte Spotify sans redemander un login.

---

## Profil utilisateur

### `GET https://api.spotify.com/v1/me`

- **Description** : renvoie les infos du compte (id, email, pays, type de compte, etc.).
- **Scopes** : `user-read-email` pour l’email, sinon infos publiques.
- **Usage AREA (actions)** :
  - Récupérer `user_id` Spotify pour d’autres endpoints.
  - Vérifier le type de compte (Free / Premium) avant certaines réactions.

---

## Lecture / Player

### `GET https://api.spotify.com/v1/me/player`

- **Description** : état actuel du player (lecture/pause, device, volume, morceau en cours, etc.).
- **Scopes** : `user-read-playback-state`.
- **Usage AREA (actions)** :
  - Savoir si de la musique est en cours de lecture.
  - Récupérer le morceau / artiste en cours pour l’utiliser dans une autre API.

### `PUT https://api.spotify.com/v1/me/player/play`

- **Description** : démarre ou reprend la lecture.
- **Scopes** : `user-modify-playback-state`.
- **Corps (JSON, optionnel)** :
  - `context_uri` (album/playlist),
  - ou `uris` (liste de tracks),
  - `position_ms` (position de départ).
- **Usage AREA (réactions)** :
  - Lancer une playlist spécifique en réponse à un événement.
  - Démarrer un morceau précis quand une condition est vraie.

### `PUT https://api.spotify.com/v1/me/player/pause`

- **Description** : met la lecture en pause.
- **Scopes** : `user-modify-playback-state`.
- **Usage AREA (réactions)** :
  - Pauser la musique lorsqu’un événement externe survient.

### `POST https://api.spotify.com/v1/me/player/next`

- **Description** : passe au morceau suivant.
- **Scopes** : `user-modify-playback-state`.
- **Usage AREA (réactions)** :
  - Passer automatiquement au titre suivant sur un trigger.

---

## Playlists

### `GET https://api.spotify.com/v1/me/playlists`

- **Description** : liste les playlists de l’utilisateur.
- **Scopes** : `playlist-read-private` pour voir les playlists privées.
- **Usage AREA (actions)** :
  - Récupérer l’ID d’une playlist cible pour d’autres opérations.

### `POST https://api.spotify.com/v1/users/{user_id}/playlists`

- **Description** : crée une nouvelle playlist pour l’utilisateur.
- **Scopes** : `playlist-modify-public` ou `playlist-modify-private`.
- **Corps (JSON)** :
  - `name`, `description`, `public`.
- **Usage AREA (réactions)** :
  - Créer une playlist automatiquement en réponse à un événement.

### `POST https://api.spotify.com/v1/playlists/{playlist_id}/tracks`

- **Description** : ajoute un ou plusieurs morceaux à une playlist.
- **Scopes** : `playlist-modify-public` ou `playlist-modify-private`.
- **Corps (JSON)** :
  - `uris` : liste d’URIs de tracks `spotify:track:...`.
- **Usage AREA (réactions)** :
  - Ajouter un titre dans une playlist lorsqu’un trigger survient.

---

## Bibliothèque / Liked tracks

### `GET https://api.spotify.com/v1/me/tracks`

- **Description** : liste les morceaux likés (bibliothèque de l’utilisateur).
- **Scopes** : `user-library-read`.
- **Usage AREA (actions)** :
  - Récupérer les derniers morceaux aimés pour les utiliser ailleurs.

### `PUT https://api.spotify.com/v1/me/tracks`

- **Description** : ajoute un ou plusieurs morceaux dans les “Liked Songs”.
- **Scopes** : `user-library-modify`.
- **Corps (JSON)** :
  - `ids` : liste d’IDs de tracks.
- **Usage AREA (réactions)** :
  - Liker automatiquement un morceau lorsqu’un événement externe se produit.

---

## Recherche

### `GET https://api.spotify.com/v1/search?q={query}&type=track,artist,...`

- **Description** : recherche des morceaux, artistes, albums, playlists.
- **Scopes** : aucun scope spécial pour une recherche publique.
- **Usage AREA (actions)** :
  - Trouver un track ou un artiste à partir d’un texte.
  - Construire une playlist ou lancer la lecture à partir d’un mot-clé.
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
