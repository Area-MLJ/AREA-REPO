import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getUserId } from '@/src/middleware';
import { db } from '@/src/lib/db/client';
import { updateUserSchema } from '@/src/lib/validators/users';
import { ApiResponse, UserResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const { data: users, error } = await db.from('users')
      .select('id, email, display_name, is_verified, created_at')
      .eq('id', userId)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];
    const response: UserResponse = {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isVerified: user.is_verified,
      createdAt: new Date(user.created_at).toISOString(),
    };

    return NextResponse.json<ApiResponse<UserResponse>>({
      success: true,
      data: response,
    });
  } catch (error: any) {
    logger.error('Get user error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const updateData: any = { updated_at: new Date().toISOString() };

    if (validatedData.displayName !== undefined) {
      updateData.display_name = validatedData.displayName;
    }

    if (validatedData.email !== undefined) {
      const { data: existingUsers } = await db.from('users')
        .select('id')
        .eq('email', validatedData.email)
        .neq('id', userId)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Cet email est déjà utilisé' },
          { status: 409 }
        );
      }

      updateData.email = validatedData.email;
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    const { data: updatedUsers, error: updateError } = await db.from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, display_name, is_verified, created_at')
      .single();

    if (updateError || !updatedUsers) {
      logger.error('Update user error', { error: updateError });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
        { status: 500 }
      );
    }

    const response: UserResponse = {
      id: updatedUsers.id,
      email: updatedUsers.email,
      displayName: updatedUsers.display_name,
      isVerified: updatedUsers.is_verified,
      createdAt: new Date(updatedUsers.created_at).toISOString(),
    };

    return NextResponse.json<ApiResponse<UserResponse>>({
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

    logger.error('Update user error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}
