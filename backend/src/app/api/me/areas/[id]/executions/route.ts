import { NextRequest, NextResponse } from 'next/server';
import areaService from '@/core/services/area-service';
import executionService from '@/core/services/execution-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'AREA appartient à l'utilisateur
    const area = await areaService.getAreaById(params.id);
    if (!area) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }
    if (area.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const limit = parseInt(
      request.nextUrl.searchParams.get('limit') || '100'
    );

    const executions = await executionService.getExecutionLogsByAreaId(
      params.id,
      limit
    );
    return NextResponse.json(executions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

