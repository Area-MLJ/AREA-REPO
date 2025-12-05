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