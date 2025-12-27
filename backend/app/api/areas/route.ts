import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getUserId } from '@/src/middleware';
import { db } from '@/src/lib/db/client';
import { createAreaSchema, updateAreaSchema } from '@/src/lib/validators/areas';
import { ApiResponse, AreaResponse } from '@/src/types/api';
import logger from '@/src/lib/logger';

export async function GET(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const { data: areas, error } = await db.from('areas')
      .select('id, name, description, enabled, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Get areas error', { error });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la récupération des areas' },
        { status: 500 }
      );
    }

    const areasResponse: AreaResponse[] = (areas || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      enabled: row.enabled,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }));

    return NextResponse.json<ApiResponse<AreaResponse[]>>({
      success: true,
      data: areasResponse,
    });
  } catch (error: any) {
    logger.error('Get areas error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la récupération des areas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResponse = await authMiddleware(request);
  if (authResponse) return authResponse;

  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createAreaSchema.parse(body);

    const userServiceIds = [
      validatedData.action.userServiceId,
      ...validatedData.reactions.map(r => r.userServiceId),
    ];

    const { data: userServices, error: userServicesError } = await db.from('user_services')
      .select('id')
      .eq('user_id', userId)
      .in('id', userServiceIds);

    if (userServicesError || !userServices || userServices.length !== userServiceIds.length) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Un ou plusieurs services utilisateur ne sont pas valides' },
        { status: 400 }
      );
    }

    const { data: newArea, error: areaError } = await db.from('areas').insert({
      user_id: userId,
      name: validatedData.name,
      description: validatedData.description || null,
      enabled: validatedData.enabled ?? true,
    }).select('id, name, description, enabled, created_at, updated_at').single();

    if (areaError || !newArea) {
      logger.error('Create area error', { error: areaError });
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la création de l\'area' },
        { status: 500 }
      );
    }

    const { data: newAction, error: actionError } = await db.from('area_actions').insert({
      area_id: newArea.id,
      service_action_id: validatedData.action.serviceActionId,
      user_service_id: validatedData.action.userServiceId,
      enabled: validatedData.action.enabled ?? true,
    }).select('id').single();

    if (actionError || !newAction) {
      logger.error('Create area action error', { error: actionError });
      await db.from('areas').delete().eq('id', newArea.id);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Erreur lors de la création de l\'action' },
        { status: 500 }
      );
    }

    if (validatedData.action.paramValues && validatedData.action.paramValues.length > 0) {
      const paramValues = validatedData.action.paramValues.map(pv => ({
        area_action_id: newAction.id,
        service_action_param_id: pv.serviceActionParamId,
        value_text: pv.valueText || null,
        value_json: pv.valueJson ? JSON.stringify(pv.valueJson) : null,
      }));

      const { error: paramsError } = await db.from('area_action_param_values').insert(paramValues);
      if (paramsError) {
        logger.error('Create area action params error', { error: paramsError });
      }
    }

    for (let i = 0; i < validatedData.reactions.length; i++) {
      const reaction = validatedData.reactions[i];
      const { data: newReaction, error: reactionError } = await db.from('area_reactions').insert({
        area_id: newArea.id,
        service_reaction_id: reaction.serviceReactionId,
        user_service_id: reaction.userServiceId,
        enabled: reaction.enabled ?? true,
        position: reaction.position ?? i,
      }).select('id').single();

      if (reactionError || !newReaction) {
        logger.error('Create area reaction error', { error: reactionError });
        continue;
      }

      if (reaction.paramValues && reaction.paramValues.length > 0) {
        const paramValues = reaction.paramValues.map(pv => ({
          area_reaction_id: newReaction.id,
          service_reaction_param_id: pv.serviceReactionParamId,
          value_text: pv.valueText || null,
          value_json: pv.valueJson ? JSON.stringify(pv.valueJson) : null,
        }));

        const { error: paramsError } = await db.from('area_reaction_param_values').insert(paramValues);
        if (paramsError) {
          logger.error('Create area reaction params error', { error: paramsError });
        }
      }
    }

    const response: AreaResponse = {
      id: newArea.id,
      name: newArea.name,
      description: newArea.description,
      enabled: newArea.enabled,
      createdAt: new Date(newArea.created_at).toISOString(),
      updatedAt: new Date(newArea.updated_at).toISOString(),
    };

    return NextResponse.json<ApiResponse<AreaResponse>>({
      success: true,
      data: response,
    }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    logger.error('Create area error', { error: error.message, stack: error.stack });
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erreur lors de la création de l\'area' },
      { status: 500 }
    );
  }
}
