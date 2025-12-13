import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    routes: {
      authorize: '/api/services/spotify/authorize',
      callback: '/api/services/spotify/callback',
      refresh: '/api/services/spotify/refresh',
      me: '/api/services/spotify/me'
    }
  })
}
