import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { verifyPassword, generateToken } from '../../../src/lib/auth'
import { applyCors } from '../../../src/middleware/cors'
import { Logger } from '../../../src/middleware/logger'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Appliquer CORS
  await applyCors(req, res)
  
  // Logger la requête
  Logger.logRequest(req)
  
  if (req.method !== 'POST') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = loginSchema.parse(req.body)
    
    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', body.email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    if (!user.password_hash || !await verifyPassword(body.password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user.id)

    // Create session
    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        jwt_token: token,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isVerified: user.is_verified
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}