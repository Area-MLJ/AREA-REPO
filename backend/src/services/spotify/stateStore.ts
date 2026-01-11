import { supabase } from '../../lib/supabase'

const TABLE_NAME = 'oauth_states'
const PROVIDER = 'spotify'

export interface OAuthStateRow {
  state: string
  provider: string
  user_id: string
  expires_at: string
}

export async function createOAuthState(userId: string, state: string, ttlMinutes = 10): Promise<OAuthStateRow> {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      state,
      provider: PROVIDER,
      user_id: userId,
      expires_at: expiresAt
    })
    .select()
    .single()

  if (error) throw error
  return data as OAuthStateRow
}

export async function consumeOAuthState(state: string): Promise<OAuthStateRow | null> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('state, provider, user_id, expires_at')
    .eq('state', state)
    .eq('provider', PROVIDER)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const expiresAt = new Date((data as any).expires_at).getTime()
  if (Date.now() > expiresAt) {
    await supabase.from(TABLE_NAME).delete().eq('state', state).eq('provider', PROVIDER)
    return null
  }

  await supabase.from(TABLE_NAME).delete().eq('state', state).eq('provider', PROVIDER)
  return data as OAuthStateRow
}
