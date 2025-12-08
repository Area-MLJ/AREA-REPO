import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { hashPassword, generateToken } from '../../../src/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = registerSchema.parse(req.body)
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const passwordHash = await hashPassword(body.password)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: body.email,
        password_hash: passwordHash,
        display_name: body.displayName,
        is_verified: false
      })
      .select()
      .single()

    if (error) {
      throw error
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

    res.status(201).json({
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
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}