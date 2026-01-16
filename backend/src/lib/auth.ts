import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Génère un token JWT
 */
export function generateToken(payload: Omit<JWTPayload, 'type'>): {
  accessToken: string;
  refreshToken: string;
} {
  const accessTokenOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  };

  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
}

/**
 * Vérifie et décode un token JWT
 * Compatible avec Edge Runtime (pas de dépendance au logger Winston)
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    // Utiliser console.error pour compatibilité Edge Runtime
    // Le logger Winston sera utilisé dans les routes API (Node.js runtime)
    if (process.env.NODE_ENV === 'development') {
      console.error('[AUTH] Token verification failed:', error.message);
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

