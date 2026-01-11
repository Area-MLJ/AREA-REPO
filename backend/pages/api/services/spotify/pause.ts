import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { getBuiltInAccessToken } from '../../../../src/services/spotify/builtInStore'
import { SpotifyApiError, spotifyApiPut } from '../../../../src/services/spotify/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'PUT') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const accessToken = await getBuiltInAccessToken()

    const deviceId = typeof req.query.device_id === 'string' ? req.query.device_id : undefined
    const path = deviceId ? `/v1/me/player/pause?device_id=${encodeURIComponent(deviceId)}` : '/v1/me/player/pause'

    await spotifyApiPut(path, accessToken)

    Logger.logResponse(res, 204, null)
    res.status(204).end()
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_PAUSE_ERROR')
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
