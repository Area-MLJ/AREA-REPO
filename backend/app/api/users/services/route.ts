import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getUserId } from '@/src/middleware';
import { db } from '@/src/lib/db/client';
import { ApiResponse, ServiceResponse } from '@/src/types/api';
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

    const { data: userServices, error } = await db.from('user_services')
      .select(`
        id,
        service_id,
        services!inner(id, name, display_name, description, icon_url)
      `)
      .eq('user_id', userId);

    if (error) {
      logger.error('Get user services error', { error });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la récupération des services' },
        { status: 500 }
      );
    }

    const services: ServiceResponse[] = (userServices || []).map((row: any) => ({
      id: row.services.id,
      name: row.services.name,
      displayName: row.services.display_name,
      description: row.services.description,
      iconUrl: row.services.icon_url,
    }));

    return NextResponse.json<ApiResponse<ServiceResponse[]>>({
      success: true,
      data: services,
    });
  } catch (error: any) {
    logger.error('Get user services error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des services' },
      { status: 500 }
    );
  }
}
