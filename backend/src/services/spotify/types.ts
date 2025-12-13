export interface SpotifyTokenResponse {
  access_token: string
  token_type: 'Bearer' | string
  expires_in: number
  refresh_token?: string
  scope?: string
}

export interface StoredServiceToken {
  user_id: string
  service: string
  access_token: string
  refresh_token: string
  expires_at: string
}
