-- Script pour ajouter les services News et Mail (built-in)
-- Ces services sont des exemples d'Area built-in

-- Service News (pour les actions/triggers)
INSERT INTO services (id, name, display_name, description, icon_url)
VALUES (
  gen_random_uuid(),
  'news',
  'News',
  'Service pour récupérer des articles de news via EventRegistry API',
  'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'
)
ON CONFLICT (name) DO NOTHING;

-- Service Mail (pour les réactions/actions)
INSERT INTO services (id, name, display_name, description, icon_url)
VALUES (
  gen_random_uuid(),
  'mail',
  'Mail',
  'Service pour envoyer des emails via Resend API',
  'https://cdn-icons-png.flaticon.com/512/732/732200.png'
)
ON CONFLICT (name) DO NOTHING;

-- Action News: top_article
INSERT INTO service_actions (id, service_id, name, display_name, description, polling_supported, webhook_supported)
SELECT
  gen_random_uuid(),
  s.id,
  'top_article',
  'Top Article',
  'Récupère le top article de technologie',
  true,  -- Supporte le polling
  false  -- Pas de webhook
FROM services s
WHERE s.name = 'news'
ON CONFLICT (service_id, name) DO NOTHING;

-- Paramètre optionnel pour l'action news: keyword
INSERT INTO service_action_params (id, service_action_id, name, display_name, description, data_type, required, default_value)
SELECT
  gen_random_uuid(),
  sa.id,
  'keyword',
  'Mot-clé',
  'Mot-clé pour filtrer les articles (défaut: "technologie")',
  'text',
  false,
  'technologie'
FROM service_actions sa
JOIN services s ON sa.service_id = s.id
WHERE s.name = 'news' AND sa.name = 'top_article'
ON CONFLICT (service_action_id, name) DO NOTHING;

-- Réaction Mail: send_email
INSERT INTO service_reactions (id, service_id, name, display_name, description)
SELECT
  gen_random_uuid(),
  s.id,
  'send_email',
  'Envoyer un Email',
  'Envoie un email avec le contenu de l''action déclenchée'
FROM services s
WHERE s.name = 'mail'
ON CONFLICT (service_id, name) DO NOTHING;

-- Paramètres pour la réaction mail
INSERT INTO service_reaction_params (id, service_reaction_id, name, display_name, description, data_type, required)
SELECT
  gen_random_uuid(),
  sr.id,
  'to',
  'Destinataire',
  'Adresse email du destinataire',
  'email',
  true
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'mail' AND sr.name = 'send_email'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

INSERT INTO service_reaction_params (id, service_reaction_id, name, display_name, description, data_type, required)
SELECT
  gen_random_uuid(),
  sr.id,
  'subject',
  'Sujet',
  'Sujet de l''email (optionnel, peut être généré depuis l''action)',
  'text',
  false
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'mail' AND sr.name = 'send_email'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

INSERT INTO service_reaction_params (id, service_reaction_id, name, display_name, description, data_type, required)
SELECT
  gen_random_uuid(),
  sr.id,
  'body',
  'Corps',
  'Corps de l''email (optionnel, peut être généré depuis l''action)',
  'text',
  false
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'mail' AND sr.name = 'send_email'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

