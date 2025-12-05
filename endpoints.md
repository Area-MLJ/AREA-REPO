# Endpoints Gmail utiles pour AREA

> L’API Gmail est une API REST Google, avec authentification OAuth2 (scopes Gmail).  
> Base URL : `https://gmail.googleapis.com/gmail/v1/users/{userId}/...`  
> Pour un utilisateur connecté, `userId` peut être `"me"`.

---

## Authentification / Tokens (Google OAuth)

### `GET https://accounts.google.com/o/oauth2/v2/auth`

- **Description** : page d’autorisation Google (consent screen) pour obtenir un `code` OAuth.
- **Principaux paramètres (query)** :
  - `client_id={CLIENT_ID}`
  - `redirect_uri={REDIRECT_URI}`
  - `response_type=code`
  - `scope=https://www.googleapis.com/auth/gmail.readonly` (ou autre scope Gmail)
  - `access_type=offline` (pour recevoir un `refresh_token`)
  - `prompt=consent` (pour forcer l’écran de consentement)
- **Usage AREA (actions)** :
  - Démarrer le flow OAuth et récupérer un `code` que tu échanges ensuite contre des tokens.

---

### `POST https://oauth2.googleapis.com/token` — Authorization Code

- **Description** : échange un `code` OAuth contre un `access_token` + `refresh_token`.
- **Corps (x-www-form-urlencoded ou JSON)** :
  - `grant_type=authorization_code`
  - `code={CODE}`
  - `client_id={CLIENT_ID}`
  - `client_secret={CLIENT_SECRET}`
  - `redirect_uri={REDIRECT_URI}`
- **Réponse typique** :
  - `access_token`, `refresh_token`, `expires_in`, `scope`, `token_type`
- **Usage AREA (actions)** :
  - Obtenir des tokens pour appeler l’API Gmail au nom de l’utilisateur.

---

### `POST https://oauth2.googleapis.com/token` — Refresh Token

- **Description** : régénère un `access_token` valide à partir d’un `refresh_token`.
- **Corps** :
  - `grant_type=refresh_token`
  - `refresh_token={REFRESH_TOKEN}`
  - `client_id={CLIENT_ID}`
  - `client_secret={CLIENT_SECRET}`
- **Usage AREA (actions)** :
  - Garder l’accès long terme à la boîte mail sans redemander un login.

---

## Messages (lecture)

### `GET https://gmail.googleapis.com/gmail/v1/users/{userId}/messages`

- **Description** : liste les messages de la boîte de réception (retourne des IDs, pas le contenu complet).
- **Scopes** :
  - `https://www.googleapis.com/auth/gmail.readonly`
  - ou `https://www.googleapis.com/auth/gmail.modify`
- **Paramètres utiles (query)** :
  - `q=` (recherche type Gmail : `from:xx`, `subject:`, `is:unread`, etc.)
  - `labelIds=` (ex : `INBOX`, `UNREAD`)
  - `maxResults=`
- **Usage AREA (actions)** :
  - Déclencheur “Quand je reçois un mail avec tel sujet / depuis telle adresse”.
  - Lister les derniers mails non lus.

---

### `GET https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/{id}`

- **Description** : récupère le contenu détaillé d’un message (en-têtes, corps encodé en base64, etc.).
- **Scopes** : même que ci-dessus (`gmail.readonly` ou `gmail.modify`).
- **Paramètres utiles** :
  - `format=metadata|minimal|full|raw`
- **Usage AREA (actions)** :
  - Lire le sujet, l’expéditeur, le corps du mail qui a déclenché l’action.
  - Extraire un lien / code depuis le contenu.

---

## Messages (envoi / modification)

### `POST https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/send`

- **Description** : envoie un nouveau mail via Gmail.
- **Scopes** :
  - `https://www.googleapis.com/auth/gmail.send`
- **Corps** :
  - JSON avec champ `raw` contenant le message RFC 2822 encodé en base64 URL-safe.
- **Usage AREA (réactions)** :
  - Envoyer un mail automatique en réponse à un événement (ex : streamer en live, nouvel event Spotify, etc.).

---

### `POST https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/modify`

- **Description** : ajoute / retire des labels à un message (ex : `UNREAD`, `STARRED`, labels custom).
- **Scopes** :
  - `https://www.googleapis.com/auth/gmail.modify`
- **Corps (JSON)** :
  - `addLabelIds`: liste d’IDs de labels
  - `removeLabelIds`: liste d’IDs de labels
- **Usage AREA (réactions)** :
  - Marquer un mail comme lu/non lu en fonction d’un event.
  - Ajouter un label spécial “traité par AREA” sur certains mails.

---

## Labels

### `GET https://gmail.googleapis.com/gmail/v1/users/{userId}/labels`

- **Description** : liste tous les labels de la boîte Gmail (INBOX, SENT, labels custom…).
- **Scopes** :
  - `https://www.googleapis.com/auth/gmail.readonly`
  - ou `https://www.googleapis.com/auth/gmail.settings.basic`
- **Usage AREA (actions)** :
  - Récupérer l’ID d’un label pour l’utiliser dans `messages.list` ou `messages.modify`.

---

## Exemples de mapping Action / Réaction pour AREA (Gmail)

### Exemple 1 : Nouveau mail spécifique → Réaction externe

- **Action** : “Quand je reçois un mail avec le sujet contenant ‘ALERT’”
  - Endpoint : `GET /gmail/v1/users/me/messages` avec `q="subject:ALERT is:unread"`.
- **Réactions possibles** :
  - Appeler une API externe (Twitch, Spotify, autre).
  - Envoyer un mail automatique de confirmation avec `messages.send`.

### Exemple 2 : Événement externe → notifier par mail

- **Action** : Un event vient d’une autre API (Twitch/Spotify/…) dans AREA.
- **Réaction** : “Envoyer un mail via Gmail”
  - Endpoint : `POST /gmail/v1/users/me/messages/send`.
