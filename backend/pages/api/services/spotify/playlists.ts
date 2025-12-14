import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { getBuiltInAccessToken } from '../../../../src/services/spotify/builtInStore'
import { spotifyApiGet } from '../../../../src/services/spotify/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const accessToken = await getBuiltInAccessToken()

    const limit = typeof req.query.limit === 'string' ? req.query.limit : undefined
    const offset = typeof req.query.offset === 'string' ? req.query.offset : undefined

    const params = new URLSearchParams()
    if (limit) params.set('limit', limit)
    if (offset) params.set('offset', offset)

    const path = params.toString().length > 0 ? `/v1/me/playlists?${params.toString()}` : '/v1/me/playlists'

    const playlists = await spotifyApiGet<any>(path, accessToken)
    Logger.logResponse(res, 200, playlists)
    res.status(200).json(playlists)
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_PLAYLISTS_ERROR')
    const message = error instanceof Error ? error.message : 'Internal server error'
    Logger.logResponse(res, 500, null, message)
    res.status(500).json({ error: 'Internal server error', details: message })
  }
}
