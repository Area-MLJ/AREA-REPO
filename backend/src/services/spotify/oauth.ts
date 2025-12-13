import { randomBytes } from 'crypto'
import { getSpotifyScopes } from './scopes'
import type { SpotifyTokenResponse } from './types'

function requireEnv(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing env var: ${name}`)
  return val
}

export function getSpotifyClientId(): string {
  return process.env.SPOTIFY_CLIENT_ID || process.env._CLIENT_ID || requireEnv('SPOTIFY_CLIENT_ID')
}

export function getSpotifyClientSecret(): string {
  return requireEnv('SPOTIFY_CLIENT_SECRET')
}

export function getSpotifyRedirectUri(): string {
  return process.env.SPOTIFY_REDIRECT_URI || process.env.SPOTIFY_REDIRECT_URL || requireEnv('SPOTIFY_REDIRECT_URI')
}

export function generateOAuthState(): string {
  return randomBytes(16).toString('hex')
}

export function buildAuthorizeUrl(state: string): string {
  const base = 'https://accounts.spotify.com/authorize'
  const params = new URLSearchParams({
    client_id: getSpotifyClientId(),
    response_type: 'code',
    redirect_uri: getSpotifyRedirectUri(),
    scope: getSpotifyScopes(),
    state
  })
  return `${base}?${params.toString()}`
}

export async function exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
  const url = 'https://accounts.spotify.com/api/token'
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getSpotifyRedirectUri()
  })

  const basic = Buffer.from(`${getSpotifyClientId()}:${getSpotifyClientSecret()}`).toString('base64')

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`
    },
    body
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Spotify token exchange failed (${resp.status}): ${text}`)
  }

  return (await resp.json()) as SpotifyTokenResponse
}

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const url = 'https://accounts.spotify.com/api/token'
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  })

  const basic = Buffer.from(`${getSpotifyClientId()}:${getSpotifyClientSecret()}`).toString('base64')

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`
    },
    body
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Spotify refresh failed (${resp.status}): ${text}`)
  }

  return (await resp.json()) as SpotifyTokenResponse
}
