/**
 * API Discord - Trigger AREA
 * Endpoint pour déclencher une AREA via Discord
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { Logger } from '@/lib/logger'
import { executeDiscordArea, isDiscordServiceReady } from '@/services/discord'
import { corsMiddleware } from '@/middleware/cors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res)

  const requestId = `discord_trigger_${Date.now()}`
  Logger.info('Discord trigger API called', { 
    requestId,
    method: req.method,
    areaId: req.query.areaId 
  })

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    })
  }

  try {
    // Vérifier si le service Discord est prêt
    if (!isDiscordServiceReady()) {
      return res.status(503).json({
        success: false,
        error: 'Discord service not ready'
      })
    }

    const { areaId } = req.query
    const eventData = req.body || {}

    if (!areaId || typeof areaId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Area ID is required'
      })
    }

    // Ajouter des métadonnées à l'événement
    const enrichedEventData = {
      ...eventData,
      source: 'api',
      requestId,
      timestamp: new Date().toISOString()
    }

    // Exécuter l'AREA
    const result = await executeDiscordArea(areaId, enrichedEventData)

    Logger.info('Discord AREA executed', { 
      requestId,
      areaId,
      success: result.success,
      executionTime: result.executionTime
    })

    return res.status(200).json({
      success: true,
      data: result
    })

  } catch (error) {
    Logger.error('Discord trigger API error', { 
      requestId,
      areaId: req.query.areaId,
      error 
    })

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}