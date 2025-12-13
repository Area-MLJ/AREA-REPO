export const SPOTIFY_DEFAULT_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-follow-read',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-library-modify'
]

export function getSpotifyScopes(): string {
  const fromEnv = process.env.SPOTIFY_SCOPES
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv
  return SPOTIFY_DEFAULT_SCOPES.join(' ')
}
