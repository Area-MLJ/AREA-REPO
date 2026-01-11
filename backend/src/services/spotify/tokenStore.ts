import { supabase } from '../../lib/supabase'
import type { SpotifyTokenResponse, StoredServiceToken } from './types'

const SERVICE_NAME = 'spotify'
const TABLE_NAME = 'user_service_tokens'

export async function upsertSpotifyTokens(userId: string, token: SpotifyTokenResponse): Promise<StoredServiceToken> {
  if (!token.access_token) throw new Error('Missing access_token from Spotify')

  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()

  const { data: existing } = await supabase
    .from(TABLE_NAME)
    .select('refresh_token')
    .eq('user_id', userId)
    .eq('service', SERVICE_NAME)
    .maybeSingle()

  const refreshToken = token.refresh_token || existing?.refresh_token
  if (!refreshToken) throw new Error('Missing refresh_token (initial connect required)')

  const payload = {
    user_id: userId,
    service: SERVICE_NAME,
    access_token: token.access_token,
    refresh_token: refreshToken,
    expires_at: expiresAt
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'user_id,service' })
    .select()
    .single()

  if (error) throw error
  return data as StoredServiceToken
}

export async function getSpotifyTokens(userId: string): Promise<StoredServiceToken | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('user_id, service, access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('service', SERVICE_NAME)
    .maybeSingle()

  if (error) throw error
  return (data as StoredServiceToken) || null
}

export function isExpired(expiresAtIso: string, skewSeconds = 30): boolean {
  const expiresAt = new Date(expiresAtIso).getTime()
  return Date.now() >= expiresAt - skewSeconds * 1000
}
