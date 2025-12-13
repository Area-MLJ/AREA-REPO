import type { NextApiResponse } from 'next'
import { withAuth, type AuthenticatedRequest } from '../../../../src/middleware/auth'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { getSpotifyTokens, isExpired, upsertSpotifyTokens } from '../../../../src/services/spotify/tokenStore'
import { refreshAccessToken } from '../../../../src/services/spotify/oauth'
import { spotifyApiGet } from '../../../../src/services/spotify/client'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const tokens = await getSpotifyTokens(req.userId)
    if (!tokens) {
      Logger.logResponse(res, 404, null, 'Spotify not connected')
      return res.status(404).json({ error: 'Spotify not connected' })
    }

    let accessToken = tokens.access_token
    if (isExpired(tokens.expires_at)) {
      const refreshed = await refreshAccessToken(tokens.refresh_token)
      const stored = await upsertSpotifyTokens(req.userId, refreshed)
      accessToken = stored.access_token
    }

    const me = await spotifyApiGet<any>('/v1/me', accessToken)
    Logger.logResponse(res, 200, me)
    res.status(200).json(me)
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_ME_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
})
