import type { NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { SpotifyApiError, spotifyApiGet } from '../../../../src/services/spotify/client'
import { getBuiltInAccessToken } from '../../../../src/services/spotify/builtInStore'

export default async function handler(req: any, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const accessToken = await getBuiltInAccessToken()

    const me = await spotifyApiGet<any>('/v1/me', accessToken)
    Logger.logResponse(res, 200, me)
    res.status(200).json(me)
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_ME_ERROR')
    if (error instanceof SpotifyApiError) {
      Logger.logResponse(res, error.status, null, error.bodyText)
      return res.status(error.status).json({
        error: 'Spotify API error',
        details: error.bodyText
      })
    }

    const message = error instanceof Error ? error.message : 'Internal server error'
    Logger.logResponse(res, 500, null, message)
    res.status(500).json({ error: 'Internal server error', details: message })
  }
}
