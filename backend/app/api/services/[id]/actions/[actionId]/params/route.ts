import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/lib/db/client';
import { ApiResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; actionId: string } }
) {
  try {
    const { data: paramsData, error } = await db.from('service_action_params')
      .select('id, name, display_name, data_type, required, position, enum_values, default_value, description')
      .eq('service_action_id', params.actionId)
      .order('position')
      .order('name');

    if (error) {
      logger.error('Get action params error', { error });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la récupération des paramètres' },
        { status: 500 }
      );
    }

    const paramsResponse = (paramsData || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      dataType: row.data_type,
      required: row.required,
      position: row.position,
      enumValues: row.enum_values ? JSON.parse(row.enum_values) : null,
      defaultValue: row.default_value,
      description: row.description,
    }));

    return NextResponse.json<ApiResponse>({
      success: true,
      data: paramsResponse,
    });
  } catch (error: any) {
    logger.error('Get action params error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}
