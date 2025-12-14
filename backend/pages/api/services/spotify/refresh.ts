import type { NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { getBuiltInAccessToken } from '../../../../src/services/spotify/builtInStore'

export default async function handler(req: any, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'POST') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const accessToken = await getBuiltInAccessToken()
    Logger.logResponse(res, 200, { access_token: accessToken })
    res.status(200).json({ access_token: accessToken })
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_REFRESH_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
}
