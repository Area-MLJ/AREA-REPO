import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'
import { Logger } from '../../../../src/middleware/logger'

import fs from 'fs'
import path from 'path'

function loadEnvFromParentDotenv() {
  try {
    const dotenvPath = path.resolve(process.cwd(), '..', '.env')
    if (!fs.existsSync(dotenvPath)) return

    const raw = fs.readFileSync(dotenvPath, 'utf-8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eq = trimmed.indexOf('=')
      if (eq === -1) continue

      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // no-op (best effort)
  }
}

loadEnvFromParentDotenv()

async function getTwitchAppAccessToken(): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId) throw new Error('TWITCH_CLIENT_ID missing')
  if (!clientSecret) throw new Error('TWITCH_CLIENT_SECRET missing')

  const url = new URL('https://id.twitch.tv/oauth2/token')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('client_secret', clientSecret)
  url.searchParams.set('grant_type', 'client_credentials')

  const resp = await fetch(url.toString(), { method: 'POST' })
  const json = await resp.json().catch(() => null)

  if (!resp.ok) {
    throw new Error(`Twitch token failed (${resp.status}): ${JSON.stringify(json)}`)
  }

  if (!json?.access_token) throw new Error('Twitch token missing access_token')
  return json.access_token
}

async function getBroadcasterIdByLogin(login: string, accessToken: string): Promise<string> {
  const clientId = process.env.TWITCH_CLIENT_ID
  if (!clientId) throw new Error('TWITCH_CLIENT_ID missing')

  const url = new URL('https://api.twitch.tv/helix/users')
  url.searchParams.set('login', login)

  const resp = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': clientId
    }
  })

  const json = await resp.json().catch(() => null)
  if (!resp.ok) {
    throw new Error(`Twitch get user failed (${resp.status}): ${JSON.stringify(json)}`)
  }

  const id = json?.data?.[0]?.id
  if (!id) throw new Error('Twitch user not found')
  return id
}

async function createStreamOnlineSubscription({
  broadcasterUserId,
  callbackUrl,
  secret,
  accessToken
}: {
  broadcasterUserId: string
  callbackUrl: string
  secret: string
  accessToken: string
}) {
  const clientId = process.env.TWITCH_CLIENT_ID
  if (!clientId) throw new Error('TWITCH_CLIENT_ID missing')

  const resp = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'stream.online',
      version: '1',
      condition: {
        broadcaster_user_id: broadcasterUserId
      },
      transport: {
        method: 'webhook',
        callback: callbackUrl,
        secret
      }
    })
  })

  const json = await resp.json().catch(() => null)
  if (!resp.ok) {
    throw new Error(`Twitch subscription failed (${resp.status}): ${JSON.stringify(json)}`)
  }

  return json
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await applyCors(req, res)
  Logger.logRequest(req)

  if (req.method !== 'POST') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const targetLogin = (process.env.TWITCH_TARGET_LOGIN || 'gotaga').toLowerCase()
    const callbackBaseUrl = process.env.TWITCH_EVENTSUB_CALLBACK_BASE_URL
    const secret = process.env.TWITCH_EVENTSUB_SECRET

    if (!callbackBaseUrl) {
      Logger.logResponse(res, 500, null, 'TWITCH_EVENTSUB_CALLBACK_BASE_URL missing')
      return res.status(500).json({ error: 'TWITCH_EVENTSUB_CALLBACK_BASE_URL missing' })
    }
    if (!secret) {
      Logger.logResponse(res, 500, null, 'TWITCH_EVENTSUB_SECRET missing')
      return res.status(500).json({ error: 'TWITCH_EVENTSUB_SECRET missing' })
    }

    const callbackUrl = new URL('/api/services/twitch/eventsub', callbackBaseUrl).toString()

    const appToken = await getTwitchAppAccessToken()
    const broadcasterId = await getBroadcasterIdByLogin(targetLogin, appToken)

    const result = await createStreamOnlineSubscription({
      broadcasterUserId: broadcasterId,
      callbackUrl,
      secret,
      accessToken: appToken
    })

    Logger.logResponse(res, 200, result)
    return res.status(200).json({
      ok: true,
      targetLogin,
      broadcasterId,
      callbackUrl,
      subscription: result
    })
  } catch (error) {
    Logger.logError(error, 'TWITCH_SUBSCRIBE_ERROR')
    const message = error instanceof Error ? error.message : 'Internal server error'
    Logger.logResponse(res, 500, null, message)
    return res.status(500).json({ error: 'Internal server error', details: message })
  }
}
