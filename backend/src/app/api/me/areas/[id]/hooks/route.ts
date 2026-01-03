import { NextRequest, NextResponse } from 'next/server';
import areaService from '@/core/services/area-service';
import hookService from '@/core/services/hook-service';
import { z } from 'zod';

const createHookJobSchema = z.object({
  area_action_id: z.string().uuid(),
  type: z.enum(['polling', 'webhook']),
  polling_interval_seconds: z.number().optional(),
  webhook_endpoint: z.string().optional(),
  status: z.enum(['active', 'inactive', 'paused']).optional(),
});

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

    const hookJobs = await hookService.getHookJobsByAreaId(params.id);
    return NextResponse.json(hookJobs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const validatedData = createHookJobSchema.parse(body);

    // Vérifier que l'area_action appartient à cette AREA
    const areaAction = await areaService.getAreaActionById(
      validatedData.area_action_id
    );
    if (!areaAction || areaAction.area_id !== params.id) {
      return NextResponse.json(
        { error: 'Area action not found or does not belong to this area' },
        { status: 400 }
      );
    }

    const hookJob = await hookService.createHookJob(validatedData);
    return NextResponse.json(hookJob, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

