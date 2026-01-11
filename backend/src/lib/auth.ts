<<<<<<< HEAD
import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

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
    expiresIn: JWT_EXPIRES_IN as StringValue,
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as StringValue,
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

=======
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import fs from 'fs'
import path from 'path'

function loadEnvFromParentDotenv() {
  if (process.env.JWT_SECRET) return

  try {
    const dotenvPath = path.resolve(process.cwd(), '..', '.env')
    if (!fs.existsSync(dotenvPath)) return

    const raw = fs.readFileSync(dotenvPath, 'utf-8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eq = trimmed.indexOf('=')
      if (eq === -1) continue

      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // no-op (best effort)
  }
}

loadEnvFromParentDotenv()

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is missing. Define it in backend env or in ../.env when running the backend locally.')
  }
  return secret
})()

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    if (typeof decoded !== 'object' || decoded === null) return null
    const userId = decoded.userId
    if (typeof userId !== 'string' || userId.length === 0) return null
    return { userId }
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
>>>>>>> 22-services-api-ready---spotfy
