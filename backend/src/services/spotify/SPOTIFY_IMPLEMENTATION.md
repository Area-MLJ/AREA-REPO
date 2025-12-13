# Spotify implementation (backend)

Ce dossier contient une implémentation **minimaliste et séparée** du service Spotify pour le backend Next.js (API Routes).

Objectifs :
- OAuth **Authorization Code (Flow A)** avec `refresh_token`
- Stockage des tokens dans **Supabase**
- Endpoints API simples (`authorize`, `callback`, `refresh`, `me`)
- Facilement extensible plus tard (player, playlists, etc.)

## 1) Variables d’environnement

À définir dans `.env` (côté serveur) :

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (serveur uniquement)
- `JWT_SECRET`

Spotify :
- `SPOTIFY_CLIENT_ID` (ou fallback `_CLIENT_ID`)
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI` (ou fallback `SPOTIFY_REDIRECT_URL`)

Optionnel :
- `SPOTIFY_SCOPES` (sinon scopes par défaut)
- `SPOTIFY_POST_CONNECT_REDIRECT` (default: `/`)

Notes :
- Le `redirect_uri` **doit correspondre exactement** à celui déclaré dans le dashboard Spotify.
- Ne jamais exposer `SPOTIFY_CLIENT_SECRET` au frontend.

## 2) Routes API

### A) `GET /api/services/spotify/authorize`
- Protégé par JWT (`Authorization: Bearer <token>`)
- Génère un `state` OAuth
- Sauvegarde le `state` en DB (table `oauth_states`) lié à l’utilisateur
- Redirige (302) vers Spotify `/authorize`

### B) `GET /api/services/spotify/callback`
- Endpoint public (appelé par Spotify)
- Lit `code` et `state` depuis la querystring
- Vérifie que le `state` existe (table `oauth_states`) et le consomme (anti-CSRF)
- Échange `code` -> `access_token` + `refresh_token`
- Stocke/Upsert tokens dans `user_service_tokens` pour l’utilisateur associé
- Redirige vers `SPOTIFY_POST_CONNECT_REDIRECT` (ou `/`)

### C) `POST /api/services/spotify/refresh`
- Protégé par JWT
- Récupère les tokens de l’utilisateur en DB
- Si expiré : refresh via Spotify `/api/token` (`grant_type=refresh_token`)
- Upsert et renvoie `{ access_token, expires_at }`

### D) `GET /api/services/spotify/me`
- Protégé par JWT
- Récupère tokens en DB
- Refresh si expiré
- Proxy vers `GET https://api.spotify.com/v1/me`

## 3) Data model (Supabase)

Cette implémentation utilise 2 tables :
- `user_service_tokens` : tokens par utilisateur/service
- `oauth_states` : états OAuth temporaires anti-CSRF

### SQL (à exécuter dans Supabase > SQL Editor)

#### `user_service_tokens`
```sql
create table if not exists public.user_service_tokens (
  user_id text not null,
  service text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, service)
);
```

#### `oauth_states`
```sql
create table if not exists public.oauth_states (
  state text primary key,
  provider text not null,
  user_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists oauth_states_provider_state_idx
  on public.oauth_states(provider, state);
```

## 4) Auth: comment on retrouve l’utilisateur

Le backend utilise un JWT maison :
- `generateToken(user.id)` signe un payload `{ userId }`
- le middleware `withAuth` met `req.userId = decoded.userId`

Les tokens Spotify sont stockés avec `user_id = req.userId`.

## 5) Smoke test (manuel)

Pré-requis :
- serveur backend lancé (Next.js, port 8080)
- tables Supabase créées
- variables Spotify configurées

### Étapes
1) Obtenir un JWT (via ton endpoint `register`/`login`) => `token`
2) Appeler : `GET /api/services/spotify/authorize` avec `Authorization: Bearer <token>`
3) Se connecter sur Spotify, accepter
4) Vérifier : `GET /api/services/spotify/me` avec `Authorization: Bearer <token>`

## 6) Fichiers

- `oauth.ts` : build authorize URL, exchange code, refresh
- `tokenStore.ts` : lecture/upsert tokens en DB
- `stateStore.ts` : création/consommation des states OAuth
- `client.ts` : wrapper simple pour appels API Spotify
- `scopes.ts` : scopes par défaut / override env
