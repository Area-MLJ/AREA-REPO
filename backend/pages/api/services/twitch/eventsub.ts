import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { Logger } from '../../../../src/middleware/logger'
import { getBuiltInAccessToken } from '../../../../src/services/spotify/builtInStore'
import { spotifyApiPut } from '../../../../src/services/spotify/client'

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

export const config = {
  api: {
    bodyParser: false
  }
}

const seenMessageIds = new Map<string, number>()

function pruneSeenMessageIds() {
  const now = Date.now()
  seenMessageIds.forEach((ts, id) => {
    if (now - ts > 10 * 60 * 1000) {
      seenMessageIds.delete(id)
    }
  })
}

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

function parseSpotifyTrackUriFromUrlOrUri(value: string): string {
  if (value.startsWith('spotify:track:')) return value

  const match = value.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/)
  if (!match) {
    throw new Error('Invalid SPOTIFY_TWITCH_LIVE_TRACK (expected spotify:track:... or open.spotify.com/track/...)')
  }

  return `spotify:track:${match[1]}`
}

function verifyTwitchSignature({
  secret,
  messageId,
  messageTimestamp,
  rawBody,
  signatureHeader
}: {
  secret: string
  messageId: string
  messageTimestamp: string
  rawBody: Buffer
  signatureHeader: string
}) {
  const message = Buffer.concat([
    Buffer.from(messageId, 'utf8'),
    Buffer.from(messageTimestamp, 'utf8'),
    rawBody
  ])

  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(message).digest('hex')

  if (!timingSafeEqual(expected, signatureHeader)) {
    throw new Error('Invalid Twitch EventSub signature')
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  Logger.logRequest(req)

  if (req.method !== 'POST') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const secret = process.env.TWITCH_EVENTSUB_SECRET
    const targetLogin = (process.env.TWITCH_TARGET_LOGIN || 'gotaga').toLowerCase()
    const trackToPlay = process.env.SPOTIFY_TWITCH_LIVE_TRACK

    if (!secret) {
      Logger.logResponse(res, 500, null, 'TWITCH_EVENTSUB_SECRET missing')
      return res.status(500).json({ error: 'TWITCH_EVENTSUB_SECRET missing' })
    }

    if (!trackToPlay) {
      Logger.logResponse(res, 500, null, 'SPOTIFY_TWITCH_LIVE_TRACK missing')
      return res.status(500).json({ error: 'SPOTIFY_TWITCH_LIVE_TRACK missing' })
    }

    const rawBody = await readRawBody(req)

    const messageId = String(req.headers['twitch-eventsub-message-id'] || '')
    const messageTimestamp = String(req.headers['twitch-eventsub-message-timestamp'] || '')
    const signatureHeader = String(req.headers['twitch-eventsub-message-signature'] || '')
    const messageType = String(req.headers['twitch-eventsub-message-type'] || '')

    if (!messageId || !messageTimestamp || !signatureHeader || !messageType) {
      Logger.logResponse(res, 400, null, 'Missing Twitch EventSub headers')
      return res.status(400).json({ error: 'Missing Twitch EventSub headers' })
    }

    pruneSeenMessageIds()
    if (seenMessageIds.has(messageId)) {
      Logger.logResponse(res, 200, null, 'Duplicate EventSub message ignored')
      return res.status(200).end()
    }

    verifyTwitchSignature({
      secret,
      messageId,
      messageTimestamp,
      rawBody,
      signatureHeader
    })

    seenMessageIds.set(messageId, Date.now())

    const json = JSON.parse(rawBody.toString('utf8'))

    if (messageType === 'webhook_callback_verification') {
      const challenge = json?.challenge
      if (!challenge || typeof challenge !== 'string') {
        Logger.logResponse(res, 400, null, 'Missing challenge')
        return res.status(400).json({ error: 'Missing challenge' })
      }
      Logger.logResponse(res, 200, null, 'EventSub challenge ok')
      res.setHeader('Content-Type', 'text/plain')
      return res.status(200).send(challenge)
    }

    if (messageType === 'notification') {
      const subscriptionType = json?.subscription?.type
      const broadcasterLogin = String(json?.event?.broadcaster_user_login || '').toLowerCase()

      if (subscriptionType === 'stream.online' && broadcasterLogin === targetLogin) {
        const trackUri = parseSpotifyTrackUriFromUrlOrUri(trackToPlay)

        const accessToken = await getBuiltInAccessToken()
        await spotifyApiPut('/v1/me/player/play', accessToken, {
          uris: [trackUri]
        })

        Logger.logResponse(res, 204, null)
        return res.status(204).end()
      }

      Logger.logResponse(res, 204, null)
      return res.status(204).end()
    }

    if (messageType === 'revocation') {
      Logger.logResponse(res, 204, null)
      return res.status(204).end()
    }

    Logger.logResponse(res, 400, null, `Unhandled Twitch message type: ${messageType}`)
    return res.status(400).json({ error: 'Unhandled Twitch message type' })
  } catch (error) {
    Logger.logError(error, 'TWITCH_EVENTSUB_ERROR')
    const message = error instanceof Error ? error.message : 'Internal server error'
    Logger.logResponse(res, 500, null, message)
    return res.status(500).json({ error: 'Internal server error', details: message })
  }
}
