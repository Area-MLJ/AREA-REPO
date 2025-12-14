# Spotify implementation (backend)

Ce dossier contient une implémentation **minimaliste et séparée** du service Spotify pour le backend Next.js (API Routes).

Objectifs :
- OAuth **Authorization Code (Flow A)** avec `refresh_token`
- Mode **built-in mono-compte** (un seul compte Spotify, typiquement le tien)
- Endpoints API simples (`authorize`, `callback`, `refresh`, `me`)
- Facilement extensible plus tard (player, playlists, etc.)

## 1) Variables d’environnement

À définir dans `.env` (côté serveur) :

Spotify :
- `SPOTIFY_CLIENT_ID` (ou fallback `_CLIENT_ID`)
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI` (ou fallback `SPOTIFY_REDIRECT_URL`)

Built-in (mono-compte) :
- `SPOTIFY_REFRESH_TOKEN` (à récupérer une seule fois via le callback, puis à coller dans `.env`)

Optionnel :
- `SPOTIFY_SCOPES` (sinon scopes par défaut)

Notes :
- Le `redirect_uri` **doit correspondre exactement** à celui déclaré dans le dashboard Spotify.
- Ne jamais exposer `SPOTIFY_CLIENT_SECRET` au frontend.

## 2) Mode built-in (comment ça marche)

L’idée :
- Le backend possède un `SPOTIFY_REFRESH_TOKEN` global.
- Le backend génère des `access_token` à la volée (refresh automatique).
- Aucun stockage DB / Supabase n’est nécessaire pour Spotify.

### Récupérer `SPOTIFY_REFRESH_TOKEN` (1 seule fois)

1) Appelle `GET /api/services/spotify/authorize`
2) Connecte-toi à Spotify et accepte
3) Spotify redirige vers `GET /api/services/spotify/callback?code=...&state=...`
4) Le backend renvoie un JSON contenant `refresh_token`
5) Copie ce `refresh_token` dans ton `.env` sous `SPOTIFY_REFRESH_TOKEN=...`
6) Redémarre le backend

## 2) Routes API

### A) `GET /api/services/spotify/authorize`
- Génère un `state` OAuth
- Stocke le `state` dans un cookie HttpOnly temporaire
- Redirige (302) vers Spotify `/authorize`

### B) `GET /api/services/spotify/callback`
- Endpoint public (appelé par Spotify)
- Lit `code` et `state` depuis la querystring
- Vérifie que le `state` correspond au cookie (anti-CSRF minimal)
- Échange `code` -> `access_token` + `refresh_token`
- Renvoie le `refresh_token` au format JSON (à coller dans `.env`)

### C) `POST /api/services/spotify/refresh`
- Renvoie un `access_token` (refresh automatique à partir de `SPOTIFY_REFRESH_TOKEN`)

### D) `GET /api/services/spotify/me`

### E) `GET /api/services/spotify/playlists`
- Liste les playlists du compte connecté
- Query params optionnels : `limit`, `offset`

### F) `PUT /api/services/spotify/play`
- Lance/reprend la lecture
- Body JSON optionnel (Spotify API) : `context_uri`, `uris`, `position_ms`, etc.
- Query param optionnel : `device_id`

### G) `PUT /api/services/spotify/pause`
- Met la lecture en pause
- Query param optionnel : `device_id`

### H) `POST /api/services/spotify/next`
- Passe au titre suivant
- Query param optionnel : `device_id`

## 3) Smoke test (manuel)

Pré-requis :
- serveur backend lancé (Next.js, port 8080)
- variables Spotify configurées
- `SPOTIFY_REFRESH_TOKEN` configuré (après la 1ère connexion)

### Étapes
1) Appeler : `GET /api/services/spotify/authorize`
2) Se connecter sur Spotify, accepter
3) Récupérer le `refresh_token` renvoyé par `callback` et le mettre dans `.env`
4) Redémarrer le backend
5) Vérifier : `GET /api/services/spotify/me`

## 6) Fichiers

- `oauth.ts` : build authorize URL, exchange code, refresh
- `builtInStore.ts` : cache access_token + refresh à partir de `SPOTIFY_REFRESH_TOKEN`
- `client.ts` : wrapper simple pour appels API Spotify
- `scopes.ts` : scopes par défaut / override env
