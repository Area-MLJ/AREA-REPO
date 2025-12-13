import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { exchangeCodeForToken } from '../../../../src/services/spotify/oauth'
import { upsertSpotifyTokens } from '../../../../src/services/spotify/tokenStore'
import { consumeOAuthState } from '../../../../src/services/spotify/stateStore'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const code = typeof req.query.code === 'string' ? req.query.code : null
    const state = typeof req.query.state === 'string' ? req.query.state : null

    if (!code || !state) {
      Logger.logResponse(res, 400, null, 'Missing code/state')
      return res.status(400).json({ error: 'Missing code or state' })
    }

    const stateRow = await consumeOAuthState(state)
    if (!stateRow) {
      Logger.logResponse(res, 400, null, 'Invalid/expired state')
      return res.status(400).json({ error: 'Invalid or expired state' })
    }

    const token = await exchangeCodeForToken(code)
    await upsertSpotifyTokens(stateRow.user_id, token)

    const redirectTo = process.env.SPOTIFY_POST_CONNECT_REDIRECT || '/'
    Logger.logResponse(res, 302, { redirect: redirectTo })
    res.writeHead(302, { Location: redirectTo })
    res.end()
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_CALLBACK_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
}
