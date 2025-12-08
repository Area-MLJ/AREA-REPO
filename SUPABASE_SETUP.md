# Configuration Supabase pour AREA

## 📋 Étapes de configuration

### 1. Exécuter le schéma SQL

1. Allez dans votre **Supabase Dashboard** → **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu du fichier `supabase-schema.sql`
4. Exécutez la requête

Cela va créer :
- La table `services` avec les services par défaut (Gmail, GitHub, Timer, OneDrive, Discord)
- La table `service_actions` avec toutes les actions disponibles
- La table `service_reactions` avec toutes les réactions disponibles
- La table `areas` pour stocker les automatisations des utilisateurs
- Les politiques RLS (Row Level Security) pour la sécurité

### 2. Variables d'environnement

Assurez-vous d'avoir ces variables dans votre fichier `.env` :

```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key

# Pour l'API server (optionnel, pour le bot Discord)
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
# OU utilisez SUPABASE_ANON_KEY si vous n'avez pas la service role key
```

### 3. Vérification

Après avoir exécuté le schéma SQL, vous devriez voir :

- ✅ 5 services dans la table `services`
- ✅ Plusieurs actions et réactions dans les tables correspondantes
- ✅ Les politiques RLS activées

## 🔧 Activation/Désactivation des services

Les services peuvent maintenant être activés/désactivés directement depuis l'interface web (`/services`). 

- **Activer un service** : Cliquez sur "Connecter" → Le service devient disponible pour créer des AREAs
- **Désactiver un service** : Cliquez sur "Déconnecter" → Le service n'apparaîtra plus dans la création d'AREA

## 📊 Structure de la base de données

```
services
├── id (UUID)
├── name (TEXT)
├── description (TEXT)
├── icon (TEXT)
├── category (TEXT)
└── is_active (BOOLEAN) ← Utilisé pour activer/désactiver

service_actions
├── id (UUID)
├── service_id (UUID → services.id)
├── name (TEXT)
└── description (TEXT)

service_reactions
├── id (UUID)
├── service_id (UUID → services.id)
├── name (TEXT)
└── description (TEXT)

areas
├── id (UUID)
├── user_id (UUID → auth.users.id)
├── name (TEXT)
├── description (TEXT)
├── is_active (BOOLEAN)
├── action_service_id (UUID → services.id)
├── action_id (UUID → service_actions.id)
├── reaction_service_id (UUID → services.id)
├── reaction_id (UUID → service_reactions.id)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_triggered (TIMESTAMP)
```

## 🎯 Services par défaut

Les services suivants sont créés automatiquement :

1. **Gmail** (communication) - Actions et réactions email
2. **GitHub** (productivity) - Actions et réactions pour les issues/PR
3. **Timer** (time) - Actions basées sur le temps
4. **OneDrive** (storage) - Actions et réactions pour les fichiers
5. **Discord** (communication) - Actions et réactions Discord

## 🔐 Sécurité (RLS)

- **Services** : Lecture publique, modification par utilisateurs authentifiés
- **Areas** : Chaque utilisateur ne voit et ne modifie que ses propres AREAs
- **Actions/Réactions** : Lecture publique

## 🚀 Prochaines étapes

1. Exécutez le schéma SQL dans Supabase
2. Configurez vos variables d'environnement
3. Redémarrez votre application
4. Testez l'activation/désactivation des services depuis `/services`

