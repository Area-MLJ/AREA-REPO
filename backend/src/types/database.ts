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