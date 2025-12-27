import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: reactions, error } = await db.from('service_reactions')
      .select('id, name, display_name, description, created_at')
      .eq('service_id', params.id)
      .order('name');

    if (error) {
      logger.error('Get service reactions error', { error });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la récupération des réactions' },
        { status: 500 }
      );
    }

    const reactionsResponse = (reactions || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description,
      createdAt: new Date(row.created_at).toISOString(),
    }));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reactionsResponse,
    });
  } catch (error: any) {
    logger.error('Get service reactions error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des réactions' },
      { status: 500 }
    );
  }
}
