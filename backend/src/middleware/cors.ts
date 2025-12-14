import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

// Configuration CORS pour le développement
const allowedOrigins = [
  'http://localhost:8081', // Frontend Vite
  'http://localhost:3000', // Next.js par défaut
  'http://127.0.0.1:8081',
  'http://127.0.0.1:3000'
];

const cors = Cors({
  origin: (origin, callback) => {
    // Certains contextes (file://, Postman, curl) envoient un Origin null/undefined
    if (!origin || origin === 'null') {
      return callback(null, true);
    }

    // Autoriser les domaines ngrok (utile pour tester les callbacks OAuth)
    try {
      const hostname = new URL(origin).hostname;
      if (hostname.endsWith('ngrok-free.app') || hostname.endsWith('ngrok-free.dev')) {
        return callback(null, true);
      }
    } catch {
      // ignore URL parse errors
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
});

// Helper method pour attendre que le middleware se termine
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function applyCors(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);
}