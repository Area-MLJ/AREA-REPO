import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { registerSchema } from '@/src/lib/validators/auth';
import { hashPassword, createSession } from '@/src/lib/auth/session';
import { ApiResponse, AuthResponse } from '@/src/types/api';
import { corsHeaders } from '@/src/lib/cors';
import logger from '@/src/lib/logger';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { data: existingUsers } = await db.from('users').select('id').eq('email', validatedData.email).limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 409, headers: corsHeaders() }
      );
    }

    const passwordHash = await hashPassword(validatedData.password);

    const { data: newUser, error: insertError } = await db.from('users').insert({
      email: validatedData.email,
      password_hash: passwordHash,
      display_name: validatedData.displayName || null,
      is_verified: false,
    }).select('id, email, display_name, is_verified').single();

    if (insertError || !newUser) {
      logger.error('Register insert error', { error: insertError });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
        { status: 500, headers: corsHeaders() }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const { accessToken, refreshToken } = await createSession(newUser.id, ipAddress, userAgent);

    const response: AuthResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        isVerified: newUser.is_verified,
      },
      token: accessToken,
      refreshToken,
    };

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response,
    }, { status: 201, headers: corsHeaders() });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400, headers: corsHeaders() }
      );
    }

    logger.error('Register error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
