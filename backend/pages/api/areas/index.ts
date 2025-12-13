import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { withAuth, AuthenticatedRequest } from '../../../src/middleware/auth'
import { z } from 'zod'

const createAreaSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(true)
})

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUserAreas(req, res)
    case 'POST':
      return createArea(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getUserAreas(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { data: areas, error } = await supabase
      .from('areas')
      .select(`
        *,
        area_actions (
          *,
          service_actions (
            *,
            services (name, display_name)
          ),
          user_services (display_name)
        ),
        area_reactions (
          *,
          service_reactions (
            *,
            services (name, display_name)
          ),
          user_services (display_name)
        )
      `)
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.status(200).json({ areas })
  } catch (error) {
    console.error('Areas fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function createArea(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const body = createAreaSchema.parse(req.body)
    
    const { data: area, error } = await supabase
      .from('areas')
      .insert({
        user_id: req.userId,
        name: body.name,
        description: body.description,
        enabled: body.enabled
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({ area })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Area creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)