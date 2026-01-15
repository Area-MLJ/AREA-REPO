import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateToken, isRefreshToken } from '@/lib/auth';
import { z } from 'zod';

const refreshSchema = z.object({
  refresh_token: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = refreshSchema.parse(body);

    // Vérifier le refresh token
    const payload = verifyToken(validatedData.refresh_token);

    if (!isRefreshToken(payload)) {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Générer un nouveau access token
    const { accessToken } = generateToken({
      userId: payload.userId,
      email: payload.email,
    });

    return NextResponse.json({
      access_token: accessToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to refresh token' },
      { status: 401 }
    );
  }
}

