/**
 * Service pour créer automatiquement les AREA built-in pour les utilisateurs
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseClient } from './db/client';
import { logger } from '@/lib/logger';
import areaService from './area-service';
import userService from './user-service';
import { z } from 'zod';

// Schéma de validation pour les AREA built-in
const BuiltinAreaSchema = z.object({
  name: z.string(),
  description: z.string(),
  enabled: z.boolean().optional().default(true),
  action: z.object({
    service: z.string(),
    name: z.string(),
    params: z.record(z.any()).optional(),
  }),
  reactions: z.array(
    z.object({
      service: z.string(),
      name: z.string(),
      params: z.record(z.any()).optional(),
    })
  ),
});

type BuiltinArea = z.infer<typeof BuiltinAreaSchema>;

/**
 * Charge les définitions d'AREA built-in depuis le fichier JSON
 */
function loadBuiltinAreas(): BuiltinArea[] {
  const builtinAreasPath = path.join(process.cwd(), 'services', 'builtin-areas.json');
  
  if (!fs.existsSync(builtinAreasPath)) {
    logger.warn(`Builtin areas file not found: ${builtinAreasPath}`);
    return [];
  }

  try {
    const content = fs.readFileSync(builtinAreasPath, 'utf-8');
    const json = JSON.parse(content);
    const areas = z.array(BuiltinAreaSchema).parse(json);
    return areas;
  } catch (error: any) {
    logger.error(`Error loading builtin areas: ${error.message}`);
    return [];
  }
}

/**
 * Récupère ou crée un user_service pour un service built-in
 * Pour les services built-in, on crée un user_service factice si nécessaire
 */
async function getOrCreateBuiltinUserService(
  userId: string,
  serviceName: string
): Promise<string> {
  const supabase = getSupabaseClient();

  // Récupérer le service
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('name', serviceName)
    .single();

  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  // Vérifier si un user_service existe déjà
  const { data: existingUserService } = await supabase
    .from('user_services')
    .select('id')
    .eq('user_id', userId)
    .eq('service_id', service.id)
    .single();

  if (existingUserService) {
    return existingUserService.id;
  }

  // Créer un user_service factice pour les services built-in
  const { data: newUserService, error } = await supabase
    .from('user_services')
    .insert({
      user_id: userId,
      service_id: service.id,
      display_name: `Built-in ${serviceName}`,
    })
    .select('id')
    .single();

  if (error || !newUserService) {
    logger.error(`Error creating builtin user service: ${error}`);
    throw new Error(`Failed to create builtin user service: ${error?.message}`);
  }

  return newUserService.id;
}

/**
 * Récupère l'ID d'une service_action par service et nom
 */
async function getServiceActionId(serviceName: string, actionName: string): Promise<string> {
  const supabase = getSupabaseClient();

  // Récupérer d'abord le service
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('name', serviceName)
    .single();

  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  // Récupérer l'action
  const { data: action } = await supabase
    .from('service_actions')
    .select('id')
    .eq('service_id', service.id)
    .eq('name', actionName)
    .single();

  if (!action) {
    throw new Error(`Action ${actionName} not found for service ${serviceName}`);
  }

  return action.id;
}

/**
 * Récupère l'ID d'une service_reaction par service et nom
 */
async function getServiceReactionId(serviceName: string, reactionName: string): Promise<string> {
  const supabase = getSupabaseClient();

  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('name', serviceName)
    .single();

  if (!service) {
    throw new Error(`Service ${serviceName} not found`);
  }

  const { data: reaction } = await supabase
    .from('service_reactions')
    .select('id')
    .eq('service_id', service.id)
    .eq('name', reactionName)
    .single();

  if (!reaction) {
    throw new Error(`Reaction ${reactionName} not found for service ${serviceName}`);
  }

  return reaction.id;
}

/**
 * Crée toutes les AREA built-in pour un utilisateur
 */
export async function createBuiltinAreasForUser(userId: string): Promise<void> {
  const builtinAreas = loadBuiltinAreas();

  if (builtinAreas.length === 0) {
    logger.warn(`No builtin areas to create for user ${userId} - file may be missing or empty`);
    return;
  }

  logger.info(`Creating ${builtinAreas.length} builtin areas for user ${userId}`);

  for (const areaDef of builtinAreas) {
    try {
      // Vérifier si l'AREA existe déjà pour cet utilisateur
      const existingAreas = await areaService.getAreasByUserId(userId);
      const existingArea = existingAreas.find(a => a.name === areaDef.name);
      
      if (existingArea) {
        logger.debug(`Builtin area "${areaDef.name}" already exists for user ${userId}, skipping`);
        continue;
      }

      // Créer l'AREA
      const area = await areaService.createArea({
        user_id: userId,
        name: areaDef.name,
        description: areaDef.description,
        enabled: areaDef.enabled,
      });

      // Créer l'action
      const serviceActionId = await getServiceActionId(
        areaDef.action.service,
        areaDef.action.name
      );
      const actionUserServiceId = await getOrCreateBuiltinUserService(
        userId,
        areaDef.action.service
      );

      const areaAction = await areaService.createAreaAction({
        area_id: area.id,
        service_action_id: serviceActionId,
        user_service_id: actionUserServiceId,
        enabled: true,
      });

      // Définir les paramètres de l'action
      if (areaDef.action.params && Object.keys(areaDef.action.params).length > 0) {
        const supabase = getSupabaseClient();
        const { data: params } = await supabase
          .from('service_action_params')
          .select('id, name')
          .eq('service_action_id', serviceActionId);

        if (params) {
          const paramValues = params
            .filter((p) => 
              areaDef.action.params![p.name] !== undefined && 
              areaDef.action.params![p.name] !== null &&
              areaDef.action.params![p.name] !== ''
            )
            .map((p) => ({
              service_action_param_id: p.id,
              value_text: String(areaDef.action.params![p.name]),
            }));

          if (paramValues.length > 0) {
            await areaService.setAreaActionParamValues(areaAction.id, paramValues);
          }
        }
      }

      // Créer les réactions
      for (let i = 0; i < areaDef.reactions.length; i++) {
        const reactionDef = areaDef.reactions[i];
        const serviceReactionId = await getServiceReactionId(
          reactionDef.service,
          reactionDef.name
        );
        const reactionUserServiceId = await getOrCreateBuiltinUserService(
          userId,
          reactionDef.service
        );

        const areaReaction = await areaService.createAreaReaction({
          area_id: area.id,
          service_reaction_id: serviceReactionId,
          user_service_id: reactionUserServiceId,
          position: i,
          enabled: true,
        });

        // Définir les paramètres de la réaction
        if (reactionDef.params && Object.keys(reactionDef.params).length > 0) {
          const supabase = getSupabaseClient();
          const { data: params } = await supabase
            .from('service_reaction_params')
            .select('id, name')
            .eq('service_reaction_id', serviceReactionId);

          if (params) {
            const paramValues = params
              .filter((p) => 
                reactionDef.params![p.name] !== undefined && 
                reactionDef.params![p.name] !== null &&
                reactionDef.params![p.name] !== ''
              )
              .map((p) => ({
                service_reaction_param_id: p.id,
                value_text: String(reactionDef.params![p.name]),
              }));

            if (paramValues.length > 0) {
              await areaService.setAreaReactionParamValues(areaReaction.id, paramValues);
            }
          }
        }
      }

      logger.info(`Created builtin area "${areaDef.name}" (id: ${area.id}) for user ${userId}`);
    } catch (error: any) {
      logger.error(`Error creating builtin area "${areaDef.name}" for user ${userId}: ${error.message}`, error);
      logger.error(`Stack trace: ${error.stack}`);
      // Continuer avec les autres AREA même si une échoue
    }
  }
  
  logger.info(`Finished creating builtin areas for user ${userId}`);
}

