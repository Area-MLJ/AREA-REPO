import { NextApiRequest, NextApiResponse } from 'next'
import { HookEngine } from '../../../src/services/hookEngine'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const hookEngine = HookEngine.getInstance()
    await hookEngine.start()
    
    res.status(200).json({ message: 'Hook engine started successfully' })
  } catch (error) {
    console.error('Error starting hook engine:', error)
    res.status(500).json({ error: 'Failed to start hook engine' })
  }
}