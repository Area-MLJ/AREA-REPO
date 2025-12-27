import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getUserId } from '@/src/middleware';
import { db } from '@/src/lib/db/client';
import { updateAreaSchema } from '@/src/lib/validators/areas';
import { ApiResponse, AreaResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
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

    const { data: areas, error } = await db.from('areas')
      .select('id, name, description, enabled, created_at, updated_at')
      .eq('id', params.id)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error || !areas) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Area non trouvée' },
        { status: 404 }
      );
    }

    const response: AreaResponse = {
      id: areas.id,
      name: areas.name,
      description: areas.description,
      enabled: areas.enabled,
      createdAt: new Date(areas.created_at).toISOString(),
      updatedAt: new Date(areas.updated_at).toISOString(),
    };

    return NextResponse.json<ApiResponse<AreaResponse>>({
      success: true,
      data: response,
    });
  } catch (error: any) {
    logger.error('Get area error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération de l\'area' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { data: existingArea, error: checkError } = await db.from('areas')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (checkError || !existingArea) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Area non trouvée' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateAreaSchema.parse(body);

    const updateData: any = { updated_at: new Date().toISOString() };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    if (validatedData.enabled !== undefined) {
      updateData.enabled = validatedData.enabled;
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    const { data: updatedArea, error: updateError } = await db.from('areas')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select('id, name, description, enabled, created_at, updated_at')
      .single();

    if (updateError || !updatedArea) {
      logger.error('Update area error', { error: updateError });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la mise à jour de l\'area' },
        { status: 500 }
      );
    }

    const response: AreaResponse = {
      id: updatedArea.id,
      name: updatedArea.name,
      description: updatedArea.description,
      enabled: updatedArea.enabled,
      createdAt: new Date(updatedArea.created_at).toISOString(),
      updatedAt: new Date(updatedArea.updated_at).toISOString(),
    };

    return NextResponse.json<ApiResponse<AreaResponse>>({
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

    logger.error('Update area error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la mise à jour de l\'area' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { data: existingArea, error: checkError } = await db.from('areas')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (checkError || !existingArea) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Area non trouvée' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await db.from('areas')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (deleteError) {
      logger.error('Delete area error', { error: deleteError });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la suppression de l\'area' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Area supprimée avec succès',
    });
  } catch (error: any) {
    logger.error('Delete area error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la suppression de l\'area' },
      { status: 500 }
    );
  }
}
