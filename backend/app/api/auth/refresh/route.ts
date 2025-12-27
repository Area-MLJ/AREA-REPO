import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { refreshTokenSchema } from '@/src/lib/validators/auth';
import { verifyRefreshToken, generateAccessToken } from '@/src/lib/auth/jwt';
import { ApiResponse, AuthResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = refreshTokenSchema.parse(body);

    const payload = verifyRefreshToken(refreshToken);

    const { data: sessions, error: sessionError } = await db.from('user_sessions')
      .select('user_id, expires_at')
      .eq('refresh_token', refreshToken)
      .limit(1);

    if (sessionError || !sessions || sessions.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session invalide' },
        { status: 401 }
      );
    }

    const session = sessions[0];

    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Session expirée' },
        { status: 401 }
      );
    }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    await db.from('user_sessions')
      .update({ jwt_token: newAccessToken })
      .eq('refresh_token', refreshToken);

    const { data: users, error: userError } = await db.from('users')
      .select('id, email, display_name, is_verified')
      .eq('id', payload.userId)
      .limit(1);

    if (userError || !users || users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isVerified: user.is_verified,
      },
      token: newAccessToken,
      refreshToken,
    };

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    if (error.message?.includes('Token')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    logger.error('Refresh token error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors du rafraîchissement du token' },
      { status: 500 }
    );
  }
}
