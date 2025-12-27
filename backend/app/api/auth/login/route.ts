import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { loginSchema } from '@/src/lib/validators/auth';
import { comparePassword, createSession } from '@/src/lib/auth/session';
import { ApiResponse, AuthResponse } from '@/src/types/api';
import { corsHeaders } from '@/src/lib/cors';
import logger from '@/src/lib/logger';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const { data: users, error } = await db.from('users')
      .select('id, email, password_hash, display_name, is_verified')
      .eq('email', validatedData.email)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = users[0];

    if (!user.password_hash) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Compte OAuth uniquement. Utilisez la connexion OAuth.' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const isValidPassword = await comparePassword(validatedData.password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const { accessToken, refreshToken } = await createSession(user.id, ipAddress, userAgent);

    const response: AuthResponse = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isVerified: user.is_verified,
      },
      token: accessToken,
      refreshToken,
    };

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response,
    }, { headers: corsHeaders() });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400, headers: corsHeaders() }
      );
    }

    logger.error('Login error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la connexion' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
