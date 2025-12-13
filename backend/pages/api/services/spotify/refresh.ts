import type { NextApiResponse } from 'next'
import { withAuth, type AuthenticatedRequest } from '../../../../src/middleware/auth'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { getSpotifyTokens, isExpired, upsertSpotifyTokens } from '../../../../src/services/spotify/tokenStore'
import { refreshAccessToken } from '../../../../src/services/spotify/oauth'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'POST') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const tokens = await getSpotifyTokens(req.userId)
    if (!tokens) {
      Logger.logResponse(res, 404, null, 'Spotify not connected')
      return res.status(404).json({ error: 'Spotify not connected' })
    }

    if (!isExpired(tokens.expires_at, 0)) {
      Logger.logResponse(res, 200, { access_token: tokens.access_token, expires_at: tokens.expires_at })
      return res.status(200).json({ access_token: tokens.access_token, expires_at: tokens.expires_at })
    }

    const refreshed = await refreshAccessToken(tokens.refresh_token)
    const stored = await upsertSpotifyTokens(req.userId, refreshed)

    Logger.logResponse(res, 200, { access_token: stored.access_token, expires_at: stored.expires_at })
    res.status(200).json({ access_token: stored.access_token, expires_at: stored.expires_at })
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_REFRESH_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
})
