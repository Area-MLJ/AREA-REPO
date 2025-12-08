-- ============================================
-- Schéma Supabase pour AREA (Services et Automatisations)
-- ============================================

-- Table services
-- Contient tous les services disponibles (Gmail, GitHub, Discord, etc.)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('social', 'productivity', 'storage', 'communication', 'time')),
  is_active BOOLEAN DEFAULT false, -- Service activé/désactivé par l'utilisateur
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table service_actions
-- Actions disponibles pour chaque service (déclencheurs)
CREATE TABLE IF NOT EXISTS service_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB, -- Paramètres optionnels pour l'action
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table service_reactions
-- Réactions disponibles pour chaque service (actions à exécuter)
CREATE TABLE IF NOT EXISTS service_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parameters JSONB, -- Paramètres optionnels pour la réaction
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table areas
-- Automatisations créées par les utilisateurs
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  action_service_id UUID NOT NULL REFERENCES services(id),
  action_id UUID NOT NULL REFERENCES service_actions(id),
  reaction_service_id UUID NOT NULL REFERENCES services(id),
  reaction_id UUID NOT NULL REFERENCES service_reactions(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_triggered TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_service_actions_service_id ON service_actions(service_id);
CREATE INDEX IF NOT EXISTS idx_service_reactions_service_id ON service_reactions(service_id);
CREATE INDEX IF NOT EXISTS idx_areas_user_id ON areas(user_id);
CREATE INDEX IF NOT EXISTS idx_areas_is_active ON areas(is_active);
CREATE INDEX IF NOT EXISTS idx_areas_action_service_id ON areas(action_service_id);
CREATE INDEX IF NOT EXISTS idx_areas_reaction_service_id ON areas(reaction_service_id);

-- Fonction pour mettre à jour updated_at automatiquement
-- (CREATE OR REPLACE permet de recréer la fonction si elle existe déjà)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_areas_updated_at ON areas;
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour services (lecture publique, modification par utilisateur authentifié)
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update service activation" ON services;
CREATE POLICY "Users can update service activation" ON services
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politiques RLS pour service_actions (lecture publique)
DROP POLICY IF EXISTS "Service actions are viewable by everyone" ON service_actions;
CREATE POLICY "Service actions are viewable by everyone" ON service_actions
    FOR SELECT USING (true);

-- Politiques RLS pour service_reactions (lecture publique)
DROP POLICY IF EXISTS "Service reactions are viewable by everyone" ON service_reactions;
CREATE POLICY "Service reactions are viewable by everyone" ON service_reactions
    FOR SELECT USING (true);

-- Politiques RLS pour areas (utilisateurs voient et gèrent leurs propres areas)
DROP POLICY IF EXISTS "Users can view own areas" ON areas;
CREATE POLICY "Users can view own areas" ON areas
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own areas" ON areas;
CREATE POLICY "Users can create own areas" ON areas
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own areas" ON areas;
CREATE POLICY "Users can update own areas" ON areas
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own areas" ON areas;
CREATE POLICY "Users can delete own areas" ON areas
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Insertion des services par défaut
INSERT INTO services (name, description, icon, category, is_active) VALUES
  ('Gmail', 'Gérez vos emails Gmail', '📧', 'communication', false),
  ('GitHub', 'Automatisez vos workflows GitHub', '🐙', 'productivity', false),
  ('Timer', 'Déclenchez des actions selon le temps', '⏰', 'time', true),
  ('OneDrive', 'Gérez vos fichiers OneDrive', '☁️', 'storage', false),
  ('Discord', 'Interagissez avec Discord via le bot', '💬', 'communication', true),
  ('Resend', 'Envoyez des emails via Resend', '📮', 'communication', false)
ON CONFLICT (name) DO NOTHING;

-- Insertion des actions pour Gmail
INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Nouvel email reçu', 'Se déclenche quand un nouvel email est reçu'
FROM services WHERE name = 'Gmail';

INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Email avec pièce jointe', 'Se déclenche quand un email avec pièce jointe est reçu'
FROM services WHERE name = 'Gmail';

-- Insertion des réactions pour Gmail
INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Envoyer un email', 'Envoie un email à un destinataire'
FROM services WHERE name = 'Gmail';

-- Insertion des actions pour GitHub
INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Nouvelle issue créée', 'Se déclenche quand une issue est créée'
FROM services WHERE name = 'GitHub';

INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Nouvelle Pull Request', 'Se déclenche quand une PR est créée'
FROM services WHERE name = 'GitHub';

-- Insertion des réactions pour GitHub
INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Créer une issue', 'Crée une nouvelle issue'
FROM services WHERE name = 'GitHub';

-- Insertion des actions pour Timer
INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Chaque jour à', 'Se déclenche chaque jour à une heure précise'
FROM services WHERE name = 'Timer';

INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Intervalle régulier', 'Se déclenche toutes les X minutes/heures'
FROM services WHERE name = 'Timer';

-- Insertion des actions pour OneDrive
INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Nouveau fichier', 'Se déclenche quand un fichier est ajouté'
FROM services WHERE name = 'OneDrive';

-- Insertion des réactions pour OneDrive
INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Uploader un fichier', 'Upload un fichier dans OneDrive'
FROM services WHERE name = 'OneDrive';

-- Insertion des actions pour Discord
INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Nouveau message dans un canal', 'Se déclenche quand un message est envoyé dans un canal'
FROM services WHERE name = 'Discord';

INSERT INTO service_actions (service_id, name, description) 
SELECT id, 'Utilisateur rejoint le serveur', 'Se déclenche quand un utilisateur rejoint le serveur'
FROM services WHERE name = 'Discord';

-- Insertion des réactions pour Discord
INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Envoyer un message', 'Envoie un message dans un canal Discord'
FROM services WHERE name = 'Discord';

INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Déclencher une AREA', 'Déclenche une AREA depuis Discord'
FROM services WHERE name = 'Discord';

-- Insertion des réactions pour Resend
INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Envoyer un email', 'Envoie un email via Resend'
FROM services WHERE name = 'Resend';

INSERT INTO service_reactions (service_id, name, description) 
SELECT id, 'Envoyer un email avec template', 'Envoie un email avec un template personnalisé via Resend'
FROM services WHERE name = 'Resend';

