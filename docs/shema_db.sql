-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

------------------------------------------------------------
-- USERS
------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  display_name text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token text,
  jwt_token text,
  ip_address text,
  user_agent text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE oauth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text,
  provider_user_id text,
  access_token text,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX oauth_identity_provider_uid_unique
  ON oauth_identities(provider, provider_user_id);

------------------------------------------------------------
-- SERVICES
------------------------------------------------------------

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text,
  description text,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE service_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name text,
  display_name text,
  description text,
  polling_supported boolean DEFAULT true,
  webhook_supported boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX service_actions_unique
  ON service_actions(service_id, name);

CREATE TABLE service_action_params (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_action_id uuid NOT NULL REFERENCES service_actions(id) ON DELETE CASCADE,
  name text,
  display_name text,
  data_type text,
  required boolean DEFAULT false,
  position int DEFAULT 0,
  enum_values text,
  default_value text,
  description text
);

CREATE UNIQUE INDEX service_action_params_unique
  ON service_action_params(service_action_id, name);

CREATE TABLE service_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name text,
  display_name text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX service_reactions_unique
  ON service_reactions(service_id, name);

CREATE TABLE service_reaction_params (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_reaction_id uuid NOT NULL REFERENCES service_reactions(id) ON DELETE CASCADE,
  name text,
  display_name text,
  data_type text,
  required boolean DEFAULT false,
  position int DEFAULT 0,
  enum_values text,
  default_value text,
  description text
);

CREATE UNIQUE INDEX service_reaction_params_unique
  ON service_reaction_params(service_reaction_id, name);

------------------------------------------------------------
-- USER SERVICES (OAuth-linked user accounts)
------------------------------------------------------------

CREATE TABLE user_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  display_name text,
  oauth_account_id uuid REFERENCES oauth_identities(id),
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX user_services_unique
  ON user_services(user_id, service_id, oauth_account_id);

------------------------------------------------------------
-- AREAS
------------------------------------------------------------

CREATE TABLE areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text,
  description text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

------------------------------------------------------------
-- AREA ACTIONS
------------------------------------------------------------

CREATE TABLE area_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  service_action_id uuid NOT NULL REFERENCES service_actions(id) ON DELETE CASCADE,
  user_service_id uuid NOT NULL REFERENCES user_services(id),
  enabled boolean DEFAULT true,
  last_evaluated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX area_actions_unique
  ON area_actions(area_id, service_action_id, user_service_id);

CREATE TABLE area_action_param_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_action_id uuid NOT NULL REFERENCES area_actions(id) ON DELETE CASCADE,
  service_action_param_id uuid NOT NULL REFERENCES service_action_params(id) ON DELETE CASCADE,
  value_text text,
  value_json text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX area_action_param_values_unique
  ON area_action_param_values(area_action_id, service_action_param_id);

------------------------------------------------------------
-- AREA REACTIONS
------------------------------------------------------------

CREATE TABLE area_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  service_reaction_id uuid NOT NULL REFERENCES service_reactions(id) ON DELETE CASCADE,
  user_service_id uuid NOT NULL REFERENCES user_services(id),
  enabled boolean DEFAULT true,
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX area_reactions_unique
  ON area_reactions(area_id, service_reaction_id, user_service_id, position);

CREATE TABLE area_reaction_param_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_reaction_id uuid NOT NULL REFERENCES area_reactions(id) ON DELETE CASCADE,
  service_reaction_param_id uuid NOT NULL REFERENCES service_reaction_params(id) ON DELETE CASCADE,
  value_text text,
  value_json text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX area_reaction_param_values_unique
  ON area_reaction_param_values(area_reaction_id, service_reaction_param_id);

------------------------------------------------------------
-- HOOK JOBS (polling + webhook)
------------------------------------------------------------

CREATE TABLE hook_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_action_id uuid NOT NULL REFERENCES area_actions(id) ON DELETE CASCADE,
  type text,
  polling_interval_seconds int,
  last_run_at timestamptz,
  webhook_endpoint text,
  status text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE hook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_job_id uuid NOT NULL REFERENCES hook_jobs(id) ON DELETE CASCADE,
  event_payload text,
  detected_at timestamptz DEFAULT now(),
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

------------------------------------------------------------
-- EXECUTION LOGS
------------------------------------------------------------

CREATE TABLE execution_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  area_action_id uuid REFERENCES area_actions(id) ON DELETE SET NULL,
  area_reaction_id uuid REFERENCES area_reactions(id) ON DELETE SET NULL,
  status text,
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  request_payload text,
  response_payload text,
  error_text text
);

------------------------------------------------------------
-- AUDIT LOGS
------------------------------------------------------------

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action_type text,
  target_resource text,
  metadata text,
  created_at timestamptz DEFAULT now()
);