import { NextRequest, NextResponse } from 'next/server';
import userService from '@/core/services/user-service';
import { generateToken } from '@/lib/auth';
import { createBuiltinAreasForUser } from '@/core/services/builtin-area-service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await userService.getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Créer l'utilisateur
    const user = await userService.createUser({
      email: validatedData.email,
      password: validatedData.password,
      display_name: validatedData.display_name,
    });

    // Créer automatiquement les AREA built-in pour le nouvel utilisateur
    try {
      await createBuiltinAreasForUser(user.id);
      logger.info(`Builtin areas created for new user ${user.id}`);
    } catch (error: any) {
      // Logger l'erreur mais ne pas faire échouer l'inscription
      logger.error(`Failed to create builtin areas for user ${user.id}:`, error);
    }

    // Générer les tokens
    const { accessToken, refreshToken } = generateToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}

