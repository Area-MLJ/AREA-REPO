import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'
import { exchangeCodeForToken } from '../../../../src/services/spotify/oauth'
import { setBuiltInTokensFromAuthorizationCode } from '../../../../src/services/spotify/builtInStore'

function getCookie(req: NextApiRequest, name: string): string | null {
  const raw = req.headers.cookie
  if (!raw) return null
  const parts = raw.split(';').map(p => p.trim())
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) return decodeURIComponent(part.substring(name.length + 1))
  }
  return null
}

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

    const cookieState = getCookie(req, 'spotify_oauth_state')
    if (!cookieState || cookieState !== state) {
      Logger.logResponse(res, 400, null, 'Invalid/expired state')
      return res.status(400).json({ error: 'Invalid or expired state' })
    }

    res.setHeader(
      'Set-Cookie',
      `spotify_oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    )

    const token = await exchangeCodeForToken(code)

    const { refreshToken } = setBuiltInTokensFromAuthorizationCode(token)

    const responseData = {
      message: 'Spotify connected. Save SPOTIFY_REFRESH_TOKEN in your .env (server) and redeploy/restart backend.',
      refresh_token: refreshToken
    }

    Logger.logResponse(res, 200, responseData)
    res.status(200).json(responseData)
  } catch (error) {
    Logger.logError(error, 'SPOTIFY_CALLBACK_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
}
