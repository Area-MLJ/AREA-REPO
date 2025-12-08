# 🤖 Bot Discord - Intégration avec le site AREA

Ce bot Discord permet d'interagir avec votre application AREA directement depuis Discord !

## 🚀 Démarrage rapide

### 1. Configuration

Créez un fichier `.env` à la racine avec :

```env
# Discord
DISCORD_TOKEN=votre_token_discord
DISCORD_APPLICATION_ID=votre_app_id

# API (optionnel, par défaut localhost:3001)
API_URL=http://localhost:3001

# Email (optionnel, pour la commande /sendmail)
RESEND_API_KEY=votre_cle_resend
EMAIL_FROM=onboarding@resend.dev
EMAIL_TO=votre_email@example.com
```

### 2. Déployer les commandes Discord

```bash
npm run deploy-commands
```

⚠️ **Important** : À exécuter une seule fois, ou après avoir modifié les commandes.

### 3. Démarrer l'API Server

Dans un premier terminal :

```bash
npm run api
```

L'API sera accessible sur `http://localhost:3001`

### 4. Démarrer le Bot Discord

Dans un second terminal :

```bash
npm run bot
```

## 📋 Commandes disponibles

### `/areas`
Liste toutes vos AREAs avec leur statut (actif/inactif).

### `/area id:<id>`
Affiche les détails d'une AREA spécifique (action, réaction, statut, etc.).

### `/trigger id:<id>`
Déclenche une AREA manuellement depuis Discord.

### `/toggle id:<id>`
Active ou désactive une AREA.

### `/stats`
Affiche les statistiques de vos AREAs (total, actives, inactives).

### `/sendmail content:<message>`
Envoie un email via Resend (nécessite la configuration Resend dans `.env`).

## 🔌 API Endpoints

L'API server expose les endpoints suivants :

- `GET /api/areas` - Liste toutes les AREAs
- `GET /api/areas/:id` - Récupère une AREA spécifique
- `POST /api/areas/:id/trigger` - Déclenche une AREA
- `POST /api/areas/:id/toggle` - Active/désactive une AREA
- `GET /api/stats` - Statistiques
- `GET /health` - Health check

## 🌐 Intégration avec le site web

Le service **Discord** apparaît maintenant dans la liste des services sur votre site web (`/services`). Vous pouvez :

1. Voir Discord dans la liste des services connectés
2. Utiliser Discord comme **Action** ou **Réaction** lors de la création d'une AREA
3. Créer des automatisations qui interagissent avec Discord

## 📝 Exemple d'utilisation

1. **Lister vos AREAs** :
   ```
   /areas
   ```

2. **Voir les détails d'une AREA** :
   ```
   /area id:1
   ```

3. **Déclencher une AREA** :
   ```
   /trigger id:1
   ```

4. **Activer/désactiver une AREA** :
   ```
   /toggle id:2
   ```

5. **Voir les statistiques** :
   ```
   /stats
   ```

## 🔧 Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Discord   │ ◄─────► │  Bot Discord │ ◄─────► │  API Server │
│   Server    │         │   (index.js) │         │(api-server) │
└─────────────┘         └──────────────┘         └─────────────┘
                                                          │
                                                          ▼
                                                   ┌─────────────┐
                                                   │   Site Web  │
                                                   │  (React App)│
                                                   └─────────────┘
```

## 🎯 Prochaines étapes

- [ ] Connecter l'API à Supabase pour utiliser les vraies données
- [ ] Ajouter l'authentification pour sécuriser l'API
- [ ] Implémenter les vraies actions/réactions Discord
- [ ] Ajouter des webhooks pour déclencher des AREAs depuis Discord

## 🐛 Dépannage

**Le bot ne répond pas aux commandes ?**
- Vérifiez que l'API server est démarré (`npm run api`)
- Vérifiez que `API_URL` dans `.env` correspond à l'URL de l'API
- Vérifiez les logs du bot pour voir les erreurs

**Les commandes ne s'affichent pas dans Discord ?**
- Relancez `npm run deploy-commands`
- Attendez quelques minutes (Discord peut prendre du temps à synchroniser)

**L'API ne répond pas ?**
- Vérifiez que le port 3001 n'est pas déjà utilisé
- Changez `API_PORT` dans `.env` si nécessaire

