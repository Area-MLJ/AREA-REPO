/**
 * API Discord - Health Check
 * Endpoint pour vérifier l'état du service Discord
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { Logger } from '@/lib/logger'
import { getDiscordServiceHealth } from '@/services/discord'
import { corsMiddleware } from '@/middleware/cors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res)

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    const health = getDiscordServiceHealth()

    Logger.debug('Discord health check', { health })

    return res.status(health.status === 'healthy' ? 200 : 503).json({
      success: true,
      data: {
        service: 'discord',
        ...health,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    Logger.error('Discord health check error', { error })

    return res.status(500).json({
      success: false,
      error: 'Health check failed',
      data: {
        service: 'discord',
        status: 'unhealthy',
        ready: false,
        timestamp: new Date().toISOString()
      }
    })
  }
}