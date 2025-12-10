/**
 * cors.ts
 * Helper pour gérer les headers CORS dans les fonctions API Vercel
 */

import type { VercelResponse } from '@vercel/node';

export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptionsRequest(res: VercelResponse) {
  setCorsHeaders(res);
  return res.status(200).end();
}

