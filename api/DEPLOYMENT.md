# Guide de déploiement de l'API sur Vercel

## 📋 Prérequis

1. Un compte Vercel (gratuit)
2. Un projet Supabase configuré
3. Node.js installé localement

## 🚀 Étapes de déploiement

### 1. Installer les dépendances

```bash
npm install @vercel/node @supabase/supabase-js
```

### 2. Créer la table `areas` dans Supabase

Exécutez le script SQL `create_areas_table.sql` dans votre dashboard Supabase :
- Allez dans SQL Editor
- Copiez-collez le contenu de `create_areas_table.sql`
- Exécutez le script

### 3. Déployer sur Vercel

#### Option A : Via CLI Vercel

```bash
# Installer Vercel CLI globalement
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel

# Pour la production
vercel --prod
```

#### Option B : Via GitHub (recommandé)

1. Poussez votre code sur GitHub
2. Allez sur [vercel.com](https://vercel.com)
3. Cliquez sur "Add New Project"
4. Importez votre repository
5. Vercel détectera automatiquement le dossier `/api`

### 4. Configurer les variables d'environnement sur Vercel

Dans votre projet Vercel, allez dans **Settings > Environment Variables** et ajoutez :

- `SUPABASE_URL` ou `SUPABASE_URL` : `https://yasdtbcdtmhscfzrdveo.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` : Votre clé service role (trouvable dans Supabase > Settings > API)

⚠️ **Important** : Utilisez la **Service Role Key** (pas l'anon key) pour bypasser RLS si nécessaire.

### 5. Mettre à jour l'URL de l'API dans le frontend

Une fois déployé, Vercel vous donnera une URL comme : `https://votre-projet.vercel.app`

Mettez à jour votre fichier `.env` :

```bash
API_URL=https://votre-projet.vercel.app
```

Ou si vous déployez aussi le frontend sur Vercel, utilisez une variable d'environnement relative :

```bash
API_URL=/api
```

## 📝 Structure des endpoints

Une fois déployé, vos endpoints seront disponibles à :

- `GET https://votre-projet.vercel.app/api/areas` - Liste toutes les AREAs
- `GET https://votre-projet.vercel.app/api/areas/[id]` - Récupère une AREA
- `POST https://votre-projet.vercel.app/api/areas/[id]/toggle` - Active/désactive une AREA
- `POST https://votre-projet.vercel.app/api/areas/[id]/execute` - Exécute une AREA

## 🔧 Configuration du bot Discord

Mettez à jour la variable `API_URL` dans votre bot Discord (sur fly.io) :

```bash
API_URL=https://votre-projet.vercel.app
```

## ✅ Vérification

Testez vos endpoints avec curl ou Postman :

```bash
# Lister les AREAs
curl https://votre-projet.vercel.app/api/areas

# Toggle une AREA
curl -X POST https://votre-projet.vercel.app/api/areas/[id]/toggle
```

## 🐛 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que les variables d'environnement sont bien configurées sur Vercel
- Redéployez après avoir ajouté les variables

### Erreur "Area not found"
- Vérifiez que la table `areas` existe dans Supabase
- Vérifiez que vous utilisez le bon ID

### CORS errors
- Vercel gère automatiquement les CORS pour les API routes
- Si vous avez des problèmes, vérifiez les headers dans vos fonctions

