import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../src/lib/supabase'
import { applyCors } from '../../src/middleware/cors'
import { Logger } from '../../src/middleware/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Appliquer CORS
  await applyCors(req, res)
  
  // Logger la requête
  Logger.logRequest(req)
  
  if (req.method !== 'GET') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     '127.0.0.1'

    // Get services with their actions and reactions
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        name,
        service_actions (
          name,
          display_name,
          description
        ),
        service_reactions (
          name,
          display_name,
          description
        )
      `)

    if (error) {
      throw error
    }

    const formattedServices = services?.map(service => ({
      name: service.name,
      actions: service.service_actions?.map(action => ({
        name: action.name,
        description: action.description || action.display_name
      })) || [],
      reactions: service.service_reactions?.map(reaction => ({
        name: reaction.name,
        description: reaction.description || reaction.display_name
      })) || []
    })) || []

    const response = {
      client: {
        host: Array.isArray(clientIp) ? clientIp[0] : clientIp
      },
      server: {
        current_time: Math.floor(Date.now() / 1000),
        services: formattedServices
      }
    }

    Logger.logResponse(res, 200, response)
    res.status(200).json(response)
  } catch (error) {
    Logger.logError(error, 'ABOUT_JSON_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
}