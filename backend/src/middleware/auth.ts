import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../lib/auth'

export interface AuthenticatedRequest extends NextApiRequest {
  userId: string
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' })
      }

      const token = authHeader.substring(7)
      const decoded = verifyToken(token)

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' })
      }

      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.userId = decoded.userId

      return handler(authenticatedReq, res)
    } catch (error) {
      return res.status(500).json({ error: 'Authentication error' })
    }
  }
}