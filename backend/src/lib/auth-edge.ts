/**
 * Auth functions compatible with Edge Runtime
 * Uses 'jose' instead of 'jsonwebtoken' for Edge compatibility
 */
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

// Convertir la clé secrète en format Uint8Array pour jose
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

// Convertir une durée (ex: "7d") en secondes
function parseExpiresIn(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 7 * 86400; // 7 jours par défaut
  }
}

/**
 * Génère un token JWT (compatible Edge Runtime)
 */
export async function generateTokenEdge(payload: Omit<JWTPayload, 'type'>): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const secretKey = getSecretKey();
  const now = Math.floor(Date.now() / 1000);

  const accessToken = await new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + parseExpiresIn(JWT_EXPIRES_IN))
    .sign(secretKey);

  const refreshToken = await new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + parseExpiresIn(JWT_REFRESH_EXPIRES_IN))
    .sign(secretKey);

  return { accessToken, refreshToken };
}

/**
 * Vérifie et décode un token JWT (compatible Edge Runtime)
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      type: payload.type as 'access' | 'refresh',
    };
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[AUTH-EDGE] Token verification failed:', error.message);
    }
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extrait le token depuis le header Authorization
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Vérifie si un token est un refresh token
 */
export function isRefreshToken(payload: JWTPayload): boolean {
  return payload.type === 'refresh';
}

