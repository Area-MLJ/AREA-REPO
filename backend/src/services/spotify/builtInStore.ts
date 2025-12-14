import type { SpotifyTokenResponse } from './types'
import { refreshAccessToken } from './oauth'

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing env var: ${name}`)
  return val
}

type CachedToken = {
  accessToken: string
  expiresAt: number
}

let cached: CachedToken | null = null

export function getBuiltInRefreshToken(): string {
  return requireEnv('SPOTIFY_REFRESH_TOKEN')
}

export function setBuiltInTokensFromAuthorizationCode(token: SpotifyTokenResponse): { refreshToken: string } {
  if (!token.refresh_token) {
    throw new Error('Spotify did not return refresh_token (ensure first-time connect with Authorization Code flow)')
  }

  cached = {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000
  }

  return { refreshToken: token.refresh_token }
}

export async function getBuiltInAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - 30_000) {
    return cached.accessToken
  }

  const refreshed = await refreshAccessToken(getBuiltInRefreshToken())

  cached = {
    accessToken: refreshed.access_token,
    expiresAt: Date.now() + refreshed.expires_in * 1000
  }

  return cached.accessToken
}
