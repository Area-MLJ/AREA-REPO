// Types pour les tables de la base de données

export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  display_name: string | null;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  refresh_token: string | null;
  jwt_token: string | null;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: Date | null;
  created_at: Date;
}

export interface OAuthIdentity {
  id: string;
  user_id: string;
  provider: string;
  provider_user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  scope: string | null;
  expires_at: Date | null;
  created_at: Date;
}

export interface Service {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  icon_url: string | null;
  created_at: Date;
}

export interface ServiceAction {
  id: string;
  service_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  polling_supported: boolean;
  webhook_supported: boolean;
  created_at: Date;
}

export interface ServiceActionParam {
  id: string;
  service_action_id: string;
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
  id: string;
  service_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  created_at: Date;
}

export interface ServiceReactionParam {
  id: string;
  service_reaction_id: string;
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
  id: string;
  user_id: string;
  service_id: string;
  display_name: string | null;
  oauth_account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: Date | null;
  created_at: Date;
}

export interface Area {
  id: string;
  user_id: string;
  name: string | null;
  description: string | null;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AreaAction {
  id: string;
  area_id: string;
  service_action_id: string;
  user_service_id: string;
  enabled: boolean;
  last_evaluated_at: Date | null;
  created_at: Date;
}

export interface AreaActionParamValue {
  id: string;
  area_action_id: string;
  service_action_param_id: string;
  value_text: string | null;
  value_json: string | null;
  created_at: Date;
}

export interface AreaReaction {
  id: string;
  area_id: string;
  service_reaction_id: string;
  user_service_id: string;
  enabled: boolean;
  position: number;
  created_at: Date;
}

export interface AreaReactionParamValue {
  id: string;
  area_reaction_id: string;
  service_reaction_param_id: string;
  value_text: string | null;
  value_json: string | null;
  created_at: Date;
}

export interface HookJob {
  id: string;
  area_action_id: string;
  type: string | null;
  polling_interval_seconds: number | null;
  last_run_at: Date | null;
  webhook_endpoint: string | null;
  status: string | null;
  created_at: Date;
}

export interface HookLog {
  id: string;
  hook_job_id: string;
  event_payload: string | null;
  detected_at: Date;
  processed: boolean;
  created_at: Date;
}

export interface ExecutionLog {
  id: string;
  area_id: string;
  area_action_id: string | null;
  area_reaction_id: string | null;
  status: string | null;
  started_at: Date;
  finished_at: Date | null;
  request_payload: string | null;
  response_payload: string | null;
  error_text: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: string | null;
  target_resource: string | null;
  metadata: string | null;
  created_at: Date;
}

