import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { generateAccessToken, generateRefreshToken, JWTPayload } from './jwt';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const createSession = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const { data: user, error } = await db.from('users').select('id, email').eq('id', userId).single();

  if (error || !user) {
    throw new Error('Utilisateur non trouvé');
  }

  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await db.from('user_sessions').insert({
    user_id: userId,
    refresh_token: refreshToken,
    jwt_token: accessToken,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return { accessToken, refreshToken };
};

export const deleteSession = async (refreshToken: string): Promise<void> => {
  await db.from('user_sessions').delete().eq('refresh_token', refreshToken);
};
