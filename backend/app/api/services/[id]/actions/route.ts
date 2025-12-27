import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: actions, error } = await db.from('service_actions')
      .select('id, name, display_name, description, polling_supported, webhook_supported, created_at')
      .eq('service_id', params.id)
      .order('name');

    if (error) {
      logger.error('Get service actions error', { error });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la récupération des actions' },
        { status: 500 }
      );
    }

    const actionsResponse = (actions || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      pollingSupported: row.polling_supported,
      webhookSupported: row.webhook_supported,
      createdAt: new Date(row.created_at).toISOString(),
    }));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: actionsResponse,
    });
  } catch (error: any) {
    logger.error('Get service actions error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des actions' },
      { status: 500 }
    );
  }
}
