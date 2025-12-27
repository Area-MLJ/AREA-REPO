import { z } from 'zod';

export const actionParamValueSchema = z.object({
  serviceActionParamId: z.string().uuid('ID de paramètre invalide'),
  valueText: z.string().optional(),
  valueJson: z.any().optional(),
});

export const reactionParamValueSchema = z.object({
  serviceReactionParamId: z.string().uuid('ID de paramètre invalide'),
  valueText: z.string().optional(),
  valueJson: z.any().optional(),
});

export const areaActionSchema = z.object({
  serviceActionId: z.string().uuid('ID d\'action invalide'),
  userServiceId: z.string().uuid('ID de service utilisateur invalide'),
  enabled: z.boolean().optional().default(true),
  paramValues: z.array(actionParamValueSchema).optional().default([]),
});

export const areaReactionSchema = z.object({
  serviceReactionId: z.string().uuid('ID de réaction invalide'),
  userServiceId: z.string().uuid('ID de service utilisateur invalide'),
  enabled: z.boolean().optional().default(true),
  position: z.number().int().min(0).optional().default(0),
  paramValues: z.array(reactionParamValueSchema).optional().default([]),
});

export const createAreaSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  action: areaActionSchema,
  reactions: z.array(areaReactionSchema).min(1, 'Au moins une réaction est requise'),
});

export const updateAreaSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
export type AreaActionInput = z.infer<typeof areaActionSchema>;
export type AreaReactionInput = z.infer<typeof areaReactionSchema>;

