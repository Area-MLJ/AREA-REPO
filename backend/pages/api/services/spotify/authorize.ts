import type { NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { buildAuthorizeUrl, generateOAuthState } from '../../../../src/services/spotify/oauth'

export default async function handler(req: any, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const state = generateOAuthState()
    res.setHeader(
      'Set-Cookie',
      `spotify_oauth_state=${state}; HttpOnly; Path=/; Max-Age=600; SameSite=Lax`
    )

    const url = buildAuthorizeUrl(state)
    Logger.logResponse(res, 302, { redirect: url })
    res.writeHead(302, { Location: url })
    res.end()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    Logger.logError(error, 'SPOTIFY_AUTHORIZE_ERROR')
    const isDev = process.env.NODE_ENV !== 'production'
    Logger.logResponse(res, 500, null, message)
    res.status(500).json({
      error: 'Internal server error',
      ...(isDev ? { details: message } : {})
    })
  }
}
