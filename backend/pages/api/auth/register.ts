import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../src/lib/supabase'
import { hashPassword, generateToken } from '../../../src/lib/auth'
import { applyCors } from '../../../src/middleware/cors'
import { Logger } from '../../../src/middleware/logger'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Appliquer CORS en premier
  await applyCors(req, res)
  
  // Logger la requête
  Logger.logRequest(req)
  if (req.method !== 'POST') {
    Logger.logResponse(res, 405, null, 'Method not allowed')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {

    console.log('DEBUG_ENV', {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY_LEN: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    JWT_SECRET_LEN: process.env.JWT_SECRET?.length,
  })


    Logger.logAuth('REGISTRATION_ATTEMPT', undefined, req.body?.email)
    const body = registerSchema.parse(req.body)
    
    // Check if user already exists
    Logger.logDatabase('SELECT id FROM users WHERE email = $1', [body.email])
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      Logger.logAuth('REGISTRATION_FAILED', undefined, body.email)
      Logger.logResponse(res, 400, null, 'User already exists')
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const passwordHash = await hashPassword(body.password)
    Logger.logAuth('PASSWORD_HASHED', undefined, body.email)

    // Create user
    Logger.logDatabase('INSERT INTO users', { email: body.email, display_name: body.displayName })
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
      Logger.logError(error, 'USER_CREATION_FAILED')
      throw error
    }
    
    Logger.logAuth('USER_CREATED', user.id, user.email)

    // Generate token
    const token = generateToken(user.id)
    Logger.logAuth('TOKEN_GENERATED', user.id, user.email)

    // Create session
    Logger.logDatabase('INSERT INTO user_sessions', { user_id: user.id })
    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        jwt_token: token,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isVerified: user.is_verified
      },
      token
    }
    
    Logger.logAuth('REGISTRATION_SUCCESS', user.id, user.email)
    Logger.logResponse(res, 201, responseData)
    res.status(201).json(responseData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      Logger.logError(error, 'VALIDATION_ERROR')
      Logger.logResponse(res, 400, null, { error: 'Validation error', details: error.errors })
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    
    Logger.logError(error, 'REGISTRATION_ERROR')
    Logger.logResponse(res, 500, null, 'Internal server error')
    res.status(500).json({ error: 'Internal server error' })
  }
}