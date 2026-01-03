-- Script pour ajouter des services de base dans la base de données
-- À exécuter dans Supabase SQL Editor

-- 1. Service Timer
INSERT INTO services (name, display_name, description, icon_url)
VALUES ('timer', 'Timer', 'Service de timer pour déclencher des actions à des dates/heures spécifiques', NULL)
ON CONFLICT (name) DO NOTHING;

-- 2. Service Discord
INSERT INTO services (name, display_name, description, icon_url)
VALUES ('discord', 'Discord', 'Service Discord pour envoyer des messages et recevoir des notifications', NULL)
ON CONFLICT (name) DO NOTHING;

-- 3. Service Email
INSERT INTO services (name, display_name, description, icon_url)
VALUES ('email', 'Email', 'Service email pour envoyer des emails', NULL)
ON CONFLICT (name) DO NOTHING;

-- Récupérer les IDs des services (à adapter selon votre base)
-- Supposons que les IDs sont générés automatiquement

-- Actions pour Timer
INSERT INTO service_actions (service_id, name, display_name, description, polling_supported, webhook_supported)
SELECT 
  id,
  'specific_datetime',
  'Date/Heure spécifique',
  'Déclenché à une date et/ou heure spécifique',
  true,
  false
FROM services WHERE name = 'timer'
ON CONFLICT (service_id, name) DO NOTHING;

-- Paramètres pour l'action Timer
INSERT INTO service_action_params (service_action_id, name, display_name, data_type, required, position, description)
SELECT 
  sa.id,
  'date',
  'Date (DD/MM)',
  'string',
  false,
  0,
  'Date au format DD/MM (ex: 25/12 pour Noël). Optionnel si time est fourni.'
FROM service_actions sa
JOIN services s ON sa.service_id = s.id
WHERE s.name = 'timer' AND sa.name = 'specific_datetime'
ON CONFLICT (service_action_id, name) DO NOTHING;

INSERT INTO service_action_params (service_action_id, name, display_name, data_type, required, position, description)
SELECT 
  sa.id,
  'time',
  'Heure (HH:MM)',
  'string',
  false,
  1,
  'Heure au format HH:MM (ex: 14:30). Optionnel si date est fourni.'
FROM service_actions sa
JOIN services s ON sa.service_id = s.id
WHERE s.name = 'timer' AND sa.name = 'specific_datetime'
ON CONFLICT (service_action_id, name) DO NOTHING;

-- Réactions pour Discord
INSERT INTO service_reactions (service_id, name, display_name, description)
SELECT 
  id,
  'send_message',
  'Envoyer un message',
  'Envoie un message dans un channel Discord'
FROM services WHERE name = 'discord'
ON CONFLICT (service_id, name) DO NOTHING;

-- Paramètres pour la réaction Discord
INSERT INTO service_reaction_params (service_reaction_id, name, display_name, data_type, required, position, description)
SELECT 
  sr.id,
  'channel_id',
  'ID du channel',
  'string',
  true,
  0,
  'ID du channel Discord où envoyer le message'
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'discord' AND sr.name = 'send_message'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

INSERT INTO service_reaction_params (service_reaction_id, name, display_name, data_type, required, position, description)
SELECT 
  sr.id,
  'message',
  'Message',
  'string',
  true,
  1,
  'Contenu du message à envoyer'
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'discord' AND sr.name = 'send_message'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

-- Réactions pour Email
INSERT INTO service_reactions (service_id, name, display_name, description)
SELECT 
  id,
  'send_email',
  'Envoyer un email',
  'Envoie un email à une adresse spécifiée'
FROM services WHERE name = 'email'
ON CONFLICT (service_id, name) DO NOTHING;

-- Paramètres pour la réaction Email
INSERT INTO service_reaction_params (service_reaction_id, name, display_name, data_type, required, position, description)
SELECT 
  sr.id,
  'to',
  'Destinataire',
  'string',
  true,
  0,
  'Adresse email du destinataire'
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'email' AND sr.name = 'send_email'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

INSERT INTO service_reaction_params (service_reaction_id, name, display_name, data_type, required, position, description)
SELECT 
  sr.id,
  'subject',
  'Sujet',
  'string',
  true,
  1,
  'Sujet de l''email'
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'email' AND sr.name = 'send_email'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

INSERT INTO service_reaction_params (service_reaction_id, name, display_name, data_type, required, position, description)
SELECT 
  sr.id,
  'body',
  'Corps du message',
  'string',
  true,
  2,
  'Corps de l''email'
FROM service_reactions sr
JOIN services s ON sr.service_id = s.id
WHERE s.name = 'email' AND sr.name = 'send_email'
ON CONFLICT (service_reaction_id, name) DO NOTHING;

