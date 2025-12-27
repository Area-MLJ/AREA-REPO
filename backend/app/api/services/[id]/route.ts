import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { ApiResponse, ServiceResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: services, error } = await db.from('services')
      .select('id, name, display_name, description, icon_url')
      .eq('id', params.id)
      .limit(1)
      .single();

    if (error || !services) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Service non trouvé' },
        { status: 404 }
      );
    }

    const response: ServiceResponse = {
      id: services.id,
      name: services.name,
      displayName: services.display_name,
      description: services.description,
      iconUrl: services.icon_url,
    };

    return NextResponse.json<ApiResponse<ServiceResponse>>({
      success: true,
      data: response,
    });
  } catch (error: any) {
    logger.error('Get service error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération du service' },
      { status: 500 }
    );
  }
}
