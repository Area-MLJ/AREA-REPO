# API Routes pour Vercel

Ce dossier contient les fonctions serverless pour gérer les AREAs.

## Structure

- `/api/areas.ts` - GET /api/areas (liste toutes les AREAs)
- `/api/areas/[id].ts` - GET /api/areas/:id (récupère une AREA)
- `/api/areas/[id]/toggle.ts` - POST /api/areas/:id/toggle (active/désactive une AREA)
- `/api/areas/[id]/execute.ts` - POST /api/areas/:id/execute (exécute une AREA)

## Déploiement sur Vercel

1. **Installer les dépendances** :
   ```bash
   npm install @vercel/node @supabase/supabase-js
   ```

2. **Configurer les variables d'environnement sur Vercel** :
   - `SUPABASE_URL` ou `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Déployer** :
   ```bash
   vercel
   ```

   Ou connectez votre repo GitHub à Vercel pour un déploiement automatique.

## Variables d'environnement requises

- `SUPABASE_URL` ou `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role de Supabase (pour bypasser RLS si nécessaire)

## Structure de la table `areas` dans Supabase

La table doit avoir les colonnes suivantes :
- `id` (UUID, PRIMARY KEY)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `is_active` (BOOLEAN, default: true)
- `action_service` (TEXT)
- `action_name` (TEXT)
- `reaction_service` (TEXT)
- `reaction_name` (TEXT)
- `user_id` (UUID, nullable, pour filtrer par utilisateur)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_triggered` (TIMESTAMP, nullable)

## Scripts SQL

### Si la table n'existe pas encore
Exécutez `create_areas_table_v2.sql` dans le SQL Editor de Supabase.

### Si la table existe déjà mais avec une structure différente
Exécutez `fix_areas_table.sql` pour ajouter les colonnes manquantes.

### Structure de la table

```sql
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  action_service TEXT NOT NULL,
  action_name TEXT NOT NULL,
  reaction_service TEXT NOT NULL,
  reaction_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_triggered TIMESTAMP
);
```

