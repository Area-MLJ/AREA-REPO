import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { withAuth, AuthenticatedRequest } from '../../../src/middleware/auth'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        service_actions (*),
        service_reactions (*)
      `)
      .order('name')

    if (error) {
      throw error
    }

    res.status(200).json({ services })
  } catch (error) {
    console.error('Services fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)