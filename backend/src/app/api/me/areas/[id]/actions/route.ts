import { NextRequest, NextResponse } from 'next/server';
import areaService from '@/core/services/area-service';
import hookService from '@/core/services/hook-service';
import { getSupabaseClient } from '@/core/services/db/client';
import { z } from 'zod';

const createAreaActionSchema = z.object({
  service_action_id: z.string().uuid(),
  user_service_id: z.string().uuid(),
  enabled: z.boolean().optional(),
  param_values: z
    .array(
      z.object({
        service_action_param_id: z.string().uuid(),
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
    const validatedData = createAreaActionSchema.parse(body);

    const supabase = getSupabaseClient();
    const { data: serviceAction, error: serviceActionError } = await supabase
      .from('service_actions')
      .select('id, polling_supported, webhook_supported')
      .eq('id', validatedData.service_action_id)
      .single();

    if (serviceActionError || !serviceAction) {
      return NextResponse.json(
        { error: 'Service action not found' },
        { status: 400 }
      );
    }

    // Créer l'area_action
    const areaAction = await areaService.createAreaAction({
      area_id: params.id,
      service_action_id: validatedData.service_action_id,
      user_service_id: validatedData.user_service_id,
      enabled: validatedData.enabled,
    });

    if (serviceAction.polling_supported) {
      await hookService.createHookJob({
        area_action_id: areaAction.id,
        type: 'polling',
        polling_interval_seconds: 60,
        status: areaAction.enabled ? 'active' : 'paused',
      });
    }

    // Définir les paramètres si fournis
    if (validatedData.param_values && validatedData.param_values.length > 0) {
      await areaService.setAreaActionParamValues(
        areaAction.id,
        validatedData.param_values
      );
    }

    return NextResponse.json(areaAction, { status: 201 });
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

