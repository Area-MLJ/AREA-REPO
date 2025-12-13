import type { NextApiResponse } from 'next'
import { withAuth, type AuthenticatedRequest } from '../../../../src/middleware/auth'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { buildAuthorizeUrl, generateOAuthState } from '../../../../src/services/spotify/oauth'
import { createOAuthState } from '../../../../src/services/spotify/stateStore'

export default withAuth(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const state = generateOAuthState()
    await createOAuthState(req.userId, state)

    const url = buildAuthorizeUrl(state)
    Logger.logResponse(res, 302, { redirect: url })
    res.writeHead(302, { Location: url })
    res.end()
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_AUTHORIZE_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
})
