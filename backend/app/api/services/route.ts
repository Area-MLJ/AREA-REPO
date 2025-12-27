import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { ApiResponse, ServiceResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { data: services, error } = await db.from('services')
      .select('id, name, display_name, description, icon_url')
      .order('name');

    if (error) {
      logger.error('Get services error', { error });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la récupération des services' },
        { status: 500 }
      );
    }

    const servicesResponse: ServiceResponse[] = (services || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      iconUrl: row.icon_url,
    }));

    return NextResponse.json<ApiResponse<ServiceResponse[]>>({
      success: true,
      data: servicesResponse,
    });
  } catch (error: any) {
    logger.error('Get services error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des services' },
      { status: 500 }
    );
  }
}
