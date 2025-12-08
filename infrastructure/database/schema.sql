-- AREA Platform Database Schema
-- Execute this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  display_name TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT,
  jwt_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth identities table
CREATE TABLE IF NOT EXISTS oauth_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  scope TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service actions table
CREATE TABLE IF NOT EXISTS service_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  polling_supported BOOLEAN DEFAULT FALSE,
  webhook_supported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, name)
);

-- Service action parameters table
CREATE TABLE IF NOT EXISTS service_action_params (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_action_id UUID NOT NULL REFERENCES service_actions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  data_type TEXT,
  required BOOLEAN DEFAULT FALSE,
  position INTEGER,
  enum_values TEXT,
  default_value TEXT,
  description TEXT,
  UNIQUE(service_action_id, name)
);

-- Service reactions table
CREATE TABLE IF NOT EXISTS service_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, name)
);

-- Service reaction parameters table
CREATE TABLE IF NOT EXISTS service_reaction_params (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_reaction_id UUID NOT NULL REFERENCES service_reactions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  data_type TEXT,
  required BOOLEAN DEFAULT FALSE,
  position INTEGER,
  enum_values TEXT,
  default_value TEXT,
  description TEXT,
  UNIQUE(service_reaction_id, name)
);

-- User services table
CREATE TABLE IF NOT EXISTS user_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  display_name TEXT,
  oauth_account_id UUID,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_id, oauth_account_id)
);

-- Areas table
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Area actions table
CREATE TABLE IF NOT EXISTS area_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  service_action_id UUID NOT NULL REFERENCES service_actions(id) ON DELETE CASCADE,
  user_service_id UUID NOT NULL REFERENCES user_services(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  last_evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area_id, service_action_id, user_service_id)
);

-- Area action parameter values table
CREATE TABLE IF NOT EXISTS area_action_param_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_action_id UUID NOT NULL REFERENCES area_actions(id) ON DELETE CASCADE,
  service_action_param_id UUID NOT NULL REFERENCES service_action_params(id) ON DELETE CASCADE,
  value_text TEXT,
  value_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area_action_id, service_action_param_id)
);

-- Area reactions table
CREATE TABLE IF NOT EXISTS area_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  service_reaction_id UUID NOT NULL REFERENCES service_reactions(id) ON DELETE CASCADE,
  user_service_id UUID NOT NULL REFERENCES user_services(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area_id, service_reaction_id, user_service_id, position)
);

-- Area reaction parameter values table
CREATE TABLE IF NOT EXISTS area_reaction_param_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_reaction_id UUID NOT NULL REFERENCES area_reactions(id) ON DELETE CASCADE,
  service_reaction_param_id UUID NOT NULL REFERENCES service_reaction_params(id) ON DELETE CASCADE,
  value_text TEXT,
  value_json TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area_reaction_id, service_reaction_param_id)
);

-- Hook jobs table
CREATE TABLE IF NOT EXISTS hook_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_action_id UUID NOT NULL REFERENCES area_actions(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'polling' or 'webhook'
  polling_interval_seconds INTEGER,
  last_run_at TIMESTAMPTZ,
  webhook_endpoint TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hook logs table
CREATE TABLE IF NOT EXISTS hook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hook_job_id UUID NOT NULL REFERENCES hook_jobs(id) ON DELETE CASCADE,
  event_payload TEXT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Execution logs table
CREATE TABLE IF NOT EXISTS execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  area_action_id UUID REFERENCES area_actions(id) ON DELETE SET NULL,
  area_reaction_id UUID REFERENCES area_reactions(id) ON DELETE SET NULL,
  status TEXT, -- 'running', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  request_payload TEXT,
  response_payload TEXT,
  error_text TEXT
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT,
  target_resource TEXT,
  metadata TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_identities_user_id ON oauth_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_service_actions_service_id ON service_actions(service_id);
CREATE INDEX IF NOT EXISTS idx_service_reactions_service_id ON service_reactions(service_id);
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_areas_user_id ON areas(user_id);
CREATE INDEX IF NOT EXISTS idx_area_actions_area_id ON area_actions(area_id);
CREATE INDEX IF NOT EXISTS idx_area_reactions_area_id ON area_reactions(area_id);
CREATE INDEX IF NOT EXISTS idx_hook_jobs_area_action_id ON hook_jobs(area_action_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_area_id ON execution_logs(area_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic examples - customize as needed)
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can read own areas" ON areas FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own services" ON user_services FOR ALL USING (user_id = auth.uid());