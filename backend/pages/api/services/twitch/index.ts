import type { NextApiRequest, NextApiResponse } from 'next'
import { applyCors } from '../../../../src/middleware/cors'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await applyCors(req, res)

  res.status(200).json({
    services: {
      spotify: '/api/services/spotify',
      twitch: '/api/services/twitch'
    }
  })
}