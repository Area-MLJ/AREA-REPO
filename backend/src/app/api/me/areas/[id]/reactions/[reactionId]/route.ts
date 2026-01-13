import { NextRequest, NextResponse } from 'next/server';
import areaService from '@/core/services/area-service';
import { z } from 'zod';

const updateAreaReactionSchema = z.object({
  enabled: z.boolean().optional(),
  position: z.number().optional(),
  param_values: z
    .array(
      z.object({
        service_reaction_param_id: z.string().uuid(),
        value_text: z.string().optional(),
        value_json: z.string().optional(),
      })
    )
    .optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; reactionId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const area = await areaService.getAreaById(params.id);
    if (!area) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 });
    }
    if (area.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const areaReaction = await areaService.getAreaReactionById(params.reactionId);
    if (!areaReaction || areaReaction.area_id !== params.id) {
      return NextResponse.json(
        { error: 'Area reaction not found or does not belong to this area' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateAreaReactionSchema.parse(body);

    if (validatedData.param_values) {
      await areaService.setAreaReactionParamValues(
        areaReaction.id,
        validatedData.param_values
      );
    }

    return NextResponse.json({ success: true });
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
