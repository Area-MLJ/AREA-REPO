import type { NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { withAuth, AuthenticatedRequest } from '../../../src/middleware/auth'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // On supprime l'utilisateur courant (id injecté par withAuth)
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.userId)
      .select()
      .single()

    if (error) {
      // Si aucune ligne affectée → user introuvable
      if ((error as any).code === 'PGRST116' || (error as any).message?.includes('Results contain 0 rows')) {
        return res.status(404).json({ error: 'User not found' })
      }
      console.error('User delete error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      user: {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
      }
    })
  } catch (err) {
    console.error('User delete unexpected error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withAuth(handler)