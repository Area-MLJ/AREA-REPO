import { NextRequest, NextResponse } from 'next/server';
import areaService from '@/core/services/area-service';
import { z } from 'zod';

const createAreaReactionSchema = z.object({
  service_reaction_id: z.string().uuid(),
  user_service_id: z.string().uuid(),
  position: z.number().optional(),
  enabled: z.boolean().optional(),
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
    const validatedData = createAreaReactionSchema.parse(body);

    // Créer l'area_reaction
    const areaReaction = await areaService.createAreaReaction({
      area_id: params.id,
      service_reaction_id: validatedData.service_reaction_id,
      user_service_id: validatedData.user_service_id,
      position: validatedData.position,
      enabled: validatedData.enabled,
    });

    // Définir les paramètres si fournis
    if (validatedData.param_values && validatedData.param_values.length > 0) {
      await areaService.setAreaReactionParamValues(
        areaReaction.id,
        validatedData.param_values
      );
    }

    return NextResponse.json(areaReaction, { status: 201 });
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

