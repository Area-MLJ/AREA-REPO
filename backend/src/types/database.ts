<<<<<<< HEAD
// Types générés depuis le schéma de base de données Supabase
// Ces types correspondent au schéma défini dans docs/shema_db.sql

export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  password_hash: string | null;
  display_name: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: UUID;
  user_id: UUID;
  refresh_token: string | null;
  jwt_token: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface OAuthIdentity {
  id: UUID;
  user_id: UUID;
  provider: string;
  provider_user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  scope: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Service {
  id: UUID;
  name: string;
  display_name: string | null;
  description: string | null;
  icon_url: string | null;
  created_at: string;
}

export interface ServiceAction {
  id: UUID;
  service_id: UUID;
  name: string;
  display_name: string | null;
  description: string | null;
  polling_supported: boolean;
  webhook_supported: boolean;
  created_at: string;
}

export interface ServiceActionParam {
  id: UUID;
  service_action_id: UUID;
  name: string;
  display_name: string | null;
  data_type: string | null;
  required: boolean;
  position: number;
  enum_values: string | null;
  default_value: string | null;
  description: string | null;
}

export interface ServiceReaction {
  id: UUID;
  service_id: UUID;
  name: string;
  display_name: string | null;
  description: string | null;
  created_at: string;
}

export interface ServiceReactionParam {
  id: UUID;
  service_reaction_id: UUID;
  name: string;
  display_name: string | null;
  data_type: string | null;
  required: boolean;
  position: number;
  enum_values: string | null;
  default_value: string | null;
  description: string | null;
}

export interface UserService {
  id: UUID;
  user_id: UUID;
  service_id: UUID;
  display_name: string | null;
  oauth_account_id: UUID | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  created_at: string;
}

export interface Area {
  id: UUID;
  user_id: UUID;
  name: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AreaAction {
  id: UUID;
  area_id: UUID;
  service_action_id: UUID;
  user_service_id: UUID;
  enabled: boolean;
  last_evaluated_at: string | null;
  created_at: string;
}

export interface AreaActionParamValue {
  id: UUID;
  area_action_id: UUID;
  service_action_param_id: UUID;
  value_text: string | null;
  value_json: string | null;
  created_at: string;
}

export interface AreaReaction {
  id: UUID;
  area_id: UUID;
  service_reaction_id: UUID;
  user_service_id: UUID;
  enabled: boolean;
  position: number;
  created_at: string;
}

export interface AreaReactionParamValue {
  id: UUID;
  area_reaction_id: UUID;
  service_reaction_param_id: UUID;
  value_text: string | null;
  value_json: string | null;
  created_at: string;
}

export interface HookJob {
  id: UUID;
  area_action_id: UUID;
  type: 'polling' | 'webhook';
  polling_interval_seconds: number | null;
  last_run_at: string | null;
  webhook_endpoint: string | null;
  status: 'active' | 'inactive' | 'paused';
  created_at: string;
}

export interface HookLog {
  id: UUID;
  hook_job_id: UUID;
  event_payload: string | null;
  detected_at: string;
  processed: boolean;
  created_at: string;
}

export interface ExecutionLog {
  id: UUID;
  area_id: UUID;
  area_action_id: UUID | null;
  area_reaction_id: UUID | null;
  status: 'running' | 'success' | 'failed' | 'skipped' | 'partial_success';
  started_at: string;
  finished_at: string | null;
  request_payload: string | null;
  response_payload: string | null;
  error_text: string | null;
}

export interface AuditLog {
  id: UUID;
  user_id: UUID | null;
  action_type: string;
  target_resource: string | null;
  metadata: string | null;
  created_at: string;
}

=======
export interface User {
  id: string
  email: string
  password_hash?: string
  display_name?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  display_name?: string
  description?: string
  icon_url?: string
  created_at: string
}

export interface ServiceAction {
  id: string
  service_id: string
  name: string
  display_name?: string
  description?: string
  polling_supported: boolean
  webhook_supported: boolean
  created_at: string
}

export interface ServiceReaction {
  id: string
  service_id: string
  name: string
  display_name?: string
  description?: string
  created_at: string
}

export interface Area {
  id: string
  user_id: string
  name?: string
  description?: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface UserService {
  id: string
  user_id: string
  service_id: string
  display_name?: string
  oauth_account_id?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  created_at: string
}
>>>>>>> 22-services-api-ready---spotfy
