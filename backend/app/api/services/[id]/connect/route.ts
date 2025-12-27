import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getUserId } from '@/src/middleware';
import { db } from '@/src/lib/db/client';
import { connectServiceSchema } from '@/src/lib/validators/services';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: services, error: serviceError } = await db.from('services')
      .select('id')
      .eq('id', params.id)
      .limit(1);

    if (serviceError || !services || services.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Service non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = connectServiceSchema.parse(body);

    if (!validatedData.accessToken) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Access token requis pour connecter le service' },
        { status: 400 }
      );
    }

    const { data: existingServices } = await db.from('user_services')
      .select('id')
      .eq('user_id', userId)
      .eq('service_id', params.id)
      .limit(1);

    const expiresAt = validatedData.refreshToken 
      ? new Date(Date.now() + 3600000).toISOString()
      : null;

    if (existingServices && existingServices.length > 0) {
      const { error: updateError } = await db.from('user_services')
        .update({
          access_token: validatedData.accessToken,
          refresh_token: validatedData.refreshToken || null,
          token_expires_at: expiresAt,
        })
        .eq('user_id', userId)
        .eq('service_id', params.id);

      if (updateError) {
        logger.error('Update user service error', { error: updateError });
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Erreur lors de la mise à jour du service' },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await db.from('user_services').insert({
        user_id: userId,
        service_id: params.id,
        access_token: validatedData.accessToken,
        refresh_token: validatedData.refreshToken || null,
        token_expires_at: expiresAt,
      });

      if (insertError) {
        logger.error('Insert user service error', { error: insertError });
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Erreur lors de la connexion au service' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Service connecté avec succès',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    logger.error('Connect service error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la connexion au service' },
      { status: 500 }
    );
  }
}
