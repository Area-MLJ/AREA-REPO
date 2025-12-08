import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { withAuth, AuthenticatedRequest } from '../../../src/middleware/auth'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUserServices(req, res)
    case 'POST':
      return connectService(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getUserServices(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { data: userServices, error } = await supabase
      .from('user_services')
      .select(`
        *,
        services (*)
      `)
      .eq('user_id', req.userId)

    if (error) {
      throw error
    }

    res.status(200).json({ userServices })
  } catch (error) {
    console.error('User services fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function connectService(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { serviceId, accessToken, refreshToken, displayName } = req.body

    const { data: userService, error } = await supabase
      .from('user_services')
      .insert({
        user_id: req.userId,
        service_id: serviceId,
        display_name: displayName,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour default
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    res.status(201).json({ userService })
  } catch (error) {
    console.error('Service connection error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)