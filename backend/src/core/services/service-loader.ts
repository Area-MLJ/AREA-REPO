/**
 * Service Loader
 * Charge les définitions de services depuis les fichiers JSON
 * et synchronise avec la base de données
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import chokidar from 'chokidar';
import { getSupabaseClient } from './db/client';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Schémas de validation Zod
const ServiceSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string().optional(),
  icon_url: z.string().optional().nullable(),
  built_in: z.boolean().optional().default(false),
  oauth_required: z.boolean().optional().default(false),
});

const ParamSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  required: z.boolean().optional().default(false),
  default: z.string().optional(),
});

const ActionSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string().optional(),
  polling_supported: z.boolean().optional().default(true),
  webhook_supported: z.boolean().optional().default(false),
  params: z.array(ParamSchema).optional().default([]),
});

const ReactionSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  description: z.string().optional(),
  params: z.array(ParamSchema).optional().default([]),
});

interface ServiceDefinition {
  service: {
    name: string;
    display_name: string;
    description?: string;
    icon_url?: string | null;
    built_in: boolean;
    oauth_required: boolean;
  };
  actions: Array<{
    name: string;
    display_name: string;
    description?: string;
    polling_supported: boolean;
    webhook_supported: boolean;
    params: Array<{
      name: string;
      display_name: string;
      description?: string;
      type: string;
      required: boolean;
      default?: string;
    }>;
  }>;
  reactions: Array<{
    name: string;
    display_name: string;
    description?: string;
    params: Array<{
      name: string;
      display_name: string;
      description?: string;
      type: string;
      required: boolean;
      default?: string;
    }>;
  }>;
}

// Cache pour détecter les changements
const fileCache = new Map<string, string>(); // path -> hash
let watchMode = false;
let watcher: chokidar.FSWatcher | null = null;
let syncInProgress = false;
let syncDebounceTimer: NodeJS.Timeout | null = null;

/**
 * Calcule le hash MD5 d'un fichier
 */
function getFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return createHash('md5').update(content).digest('hex');
}

/**
 * Lit et parse un fichier JSON
 */
function readJsonFile<T>(filePath: string, schema: z.ZodSchema<T>): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    return schema.parse(json);
  } catch (error: any) {
    logger.error(`Error reading/parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Charge toutes les définitions de services depuis les fichiers JSON
 */
function loadServiceDefinitions(): Map<string, ServiceDefinition> {
  const servicesDir = path.join(process.cwd(), 'services');
  const definitions = new Map<string, ServiceDefinition>();

  if (!fs.existsSync(servicesDir)) {
    logger.warn(`Services directory not found: ${servicesDir}`);
    return definitions;
  }

  const serviceDirs = fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const serviceName of serviceDirs) {
    const servicePath = path.join(servicesDir, serviceName);
    const serviceJsonPath = path.join(servicePath, 'service.json');

    if (!fs.existsSync(serviceJsonPath)) {
      logger.warn(`service.json not found for ${serviceName}, skipping`);
      continue;
    }

    const serviceData = readJsonFile(serviceJsonPath, ServiceSchema);
    if (!serviceData) {
      continue;
    }

    // Normaliser le service avec les valeurs par défaut
    const service = {
      ...serviceData,
      built_in: serviceData.built_in ?? false,
      oauth_required: serviceData.oauth_required ?? false,
    };

    // Charger les actions
    const actionsDir = path.join(servicePath, 'actions');
    const actions: Array<{
      name: string;
      display_name: string;
      description?: string;
      polling_supported: boolean;
      webhook_supported: boolean;
      params: Array<{
        name: string;
        display_name: string;
        description?: string;
        type: string;
        required: boolean;
        default?: string;
      }>;
    }> = [];
    if (fs.existsSync(actionsDir)) {
      const actionFiles = fs.readdirSync(actionsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(actionsDir, file));

      for (const actionFile of actionFiles) {
        const action = readJsonFile(actionFile, ActionSchema);
        if (action) {
          actions.push({
            ...action,
            polling_supported: action.polling_supported ?? true,
            webhook_supported: action.webhook_supported ?? false,
            params: (action.params || []).map(p => ({
              ...p,
              required: p.required ?? false,
            })),
          });
        }
      }
    }

    // Charger les réactions
    const reactionsDir = path.join(servicePath, 'reactions');
    const reactions: Array<{
      name: string;
      display_name: string;
      description?: string;
      params: Array<{
        name: string;
        display_name: string;
        description?: string;
        type: string;
        required: boolean;
        default?: string;
      }>;
    }> = [];
    if (fs.existsSync(reactionsDir)) {
      const reactionFiles = fs.readdirSync(reactionsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(reactionsDir, file));

      for (const reactionFile of reactionFiles) {
        const reaction = readJsonFile(reactionFile, ReactionSchema);
        if (reaction) {
          reactions.push({
            ...reaction,
            params: (reaction.params || []).map(p => ({
              ...p,
              required: p.required ?? false,
            })),
          });
        }
      }
    }

    definitions.set(serviceName, { service, actions, reactions });
    logger.debug(`Loaded service definition: ${serviceName} (${actions.length} actions, ${reactions.length} reactions)`);
  }

  return definitions;
}

/**
 * Synchronise les définitions avec la base de données
 */
async function syncToDatabase(definitions: Map<string, ServiceDefinition>): Promise<{
  servicesCreated: number;
  servicesUpdated: number;
  actionsCreated: number;
  actionsUpdated: number;
  reactionsCreated: number;
  reactionsUpdated: number;
}> {
  const supabase = getSupabaseClient();
  const stats = {
    servicesCreated: 0,
    servicesUpdated: 0,
    actionsCreated: 0,
    actionsUpdated: 0,
    reactionsCreated: 0,
    reactionsUpdated: 0,
  };

  for (const [serviceName, def] of definitions.entries()) {
    try {
      // 1. Créer/mettre à jour le service
      const { data: existingService } = await supabase
        .from('services')
        .select('id')
        .eq('name', def.service.name)
        .single();

      let serviceId: string;

      if (existingService) {
        // Mettre à jour
        const { error } = await supabase
          .from('services')
          .update({
            display_name: def.service.display_name,
            description: def.service.description || null,
            icon_url: def.service.icon_url || null,
          })
          .eq('id', existingService.id);

        if (error) {
          logger.error(`Error updating service ${serviceName}:`, error);
          continue;
        }

        serviceId = existingService.id;
        stats.servicesUpdated++;
        logger.debug(`Updated service: ${serviceName}`);
      } else {
        // Créer
        const { data: newService, error } = await supabase
          .from('services')
          .insert({
            name: def.service.name,
            display_name: def.service.display_name,
            description: def.service.description || null,
            icon_url: def.service.icon_url || null,
          })
          .select('id')
          .single();

        if (error || !newService) {
          logger.error(`Error creating service ${serviceName}:`, error);
          continue;
        }

        serviceId = newService.id;
        stats.servicesCreated++;
        logger.info(`Created service: ${serviceName}`);
      }

      // 2. Synchroniser les actions
      for (const action of def.actions) {
        const { data: existingAction } = await supabase
          .from('service_actions')
          .select('id')
          .eq('service_id', serviceId)
          .eq('name', action.name)
          .single();

        let actionId: string;

        if (existingAction) {
          // Mettre à jour
          const { error } = await supabase
            .from('service_actions')
            .update({
              display_name: action.display_name,
              description: action.description || null,
              polling_supported: action.polling_supported,
              webhook_supported: action.webhook_supported,
            })
            .eq('id', existingAction.id);

          if (error) {
            logger.error(`Error updating action ${action.name}:`, error);
            continue;
          }

          actionId = existingAction.id;
          stats.actionsUpdated++;
        } else {
          // Créer
          const { data: newAction, error } = await supabase
            .from('service_actions')
            .insert({
              service_id: serviceId,
              name: action.name,
              display_name: action.display_name,
              description: action.description || null,
              polling_supported: action.polling_supported,
              webhook_supported: action.webhook_supported,
            })
            .select('id')
            .single();

          if (error || !newAction) {
            logger.error(`Error creating action ${action.name}:`, error);
            continue;
          }

          actionId = newAction.id;
          stats.actionsCreated++;
        }

        // Synchroniser les paramètres de l'action
        for (let i = 0; i < action.params.length; i++) {
          const param = action.params[i];
          const { data: existingParam } = await supabase
            .from('service_action_params')
            .select('id')
            .eq('service_action_id', actionId)
            .eq('name', param.name)
            .single();

          if (existingParam) {
            // Mettre à jour
            await supabase
              .from('service_action_params')
              .update({
                display_name: param.display_name,
                description: param.description || null,
                data_type: param.type,
                required: param.required,
                position: i,
                default_value: param.default || null,
              })
              .eq('id', existingParam.id);
          } else {
            // Créer
            await supabase
              .from('service_action_params')
              .insert({
                service_action_id: actionId,
                name: param.name,
                display_name: param.display_name,
                description: param.description || null,
                data_type: param.type,
                required: param.required,
                position: i,
                default_value: param.default || null,
              });
          }
        }
      }

      // 3. Synchroniser les réactions
      for (const reaction of def.reactions) {
        const { data: existingReaction } = await supabase
          .from('service_reactions')
          .select('id')
          .eq('service_id', serviceId)
          .eq('name', reaction.name)
          .single();

        let reactionId: string;

        if (existingReaction) {
          // Mettre à jour
          const { error } = await supabase
            .from('service_reactions')
            .update({
              display_name: reaction.display_name,
              description: reaction.description || null,
            })
            .eq('id', existingReaction.id);

          if (error) {
            logger.error(`Error updating reaction ${reaction.name}:`, error);
            continue;
          }

          reactionId = existingReaction.id;
          stats.reactionsUpdated++;
        } else {
          // Créer
          const { data: newReaction, error } = await supabase
            .from('service_reactions')
            .insert({
              service_id: serviceId,
              name: reaction.name,
              display_name: reaction.display_name,
              description: reaction.description || null,
            })
            .select('id')
            .single();

          if (error || !newReaction) {
            logger.error(`Error creating reaction ${reaction.name}:`, error);
            continue;
          }

          reactionId = newReaction.id;
          stats.reactionsCreated++;
        }

        // Synchroniser les paramètres de la réaction
        for (let i = 0; i < reaction.params.length; i++) {
          const param = reaction.params[i];
          const { data: existingParam } = await supabase
            .from('service_reaction_params')
            .select('id')
            .eq('service_reaction_id', reactionId)
            .eq('name', param.name)
            .single();

          if (existingParam) {
            // Mettre à jour
            await supabase
              .from('service_reaction_params')
              .update({
                display_name: param.display_name,
                description: param.description || null,
                data_type: param.type,
                required: param.required,
                position: i,
                default_value: param.default || null,
              })
              .eq('id', existingParam.id);
          } else {
            // Créer
            await supabase
              .from('service_reaction_params')
              .insert({
                service_reaction_id: reactionId,
                name: param.name,
                display_name: param.display_name,
                description: param.description || null,
                data_type: param.type,
                required: param.required,
                position: i,
                default_value: param.default || null,
              });
          }
        }
      }
    } catch (error: any) {
      logger.error(`Error syncing service ${serviceName}:`, error);
    }
  }

  return stats;
}

/**
 * Synchronise les services (charge et sync)
 */
export async function syncServices(): Promise<void> {
  if (syncInProgress) {
    logger.debug('Sync already in progress, skipping...');
    return;
  }

  syncInProgress = true;
  try {
    logger.info('Loading service definitions from JSON files...');
    const definitions = loadServiceDefinitions();

    if (definitions.size === 0) {
      logger.warn('No service definitions found');
      return;
    }

    logger.info(`Found ${definitions.size} service definitions, syncing to database...`);
    const stats = await syncToDatabase(definitions);

    logger.info('Service sync completed:', {
      services: `+${stats.servicesCreated} created, ${stats.servicesUpdated} updated`,
      actions: `+${stats.actionsCreated} created, ${stats.actionsUpdated} updated`,
      reactions: `+${stats.reactionsCreated} created, ${stats.reactionsUpdated} updated`,
    });
  } catch (error: any) {
    logger.error('Error syncing services:', error);
    throw error;
  } finally {
    syncInProgress = false;
  }
}

/**
 * Débounce pour éviter les multiples rechargements
 */
function debouncedSync(filePath: string): void {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }

  syncDebounceTimer = setTimeout(() => {
    const currentHash = getFileHash(filePath);
    const cachedHash = fileCache.get(filePath);

    if (currentHash !== cachedHash) {
      logger.info(`Service definition changed: ${filePath}, reloading...`);
      fileCache.set(filePath, currentHash);
      syncServices().catch((error) => {
        logger.error('Error in debounced sync:', error);
      });
    }
  }, 500);
}

/**
 * Active le watch mode pour surveiller les fichiers JSON
 */
export function watchServices(): void {
  if (watchMode || process.env.NODE_ENV === 'production') {
    return; // Déjà actif ou pas en dev
  }

  const servicesDir = path.join(process.cwd(), 'services');
  if (!fs.existsSync(servicesDir)) {
    logger.warn(`Services directory not found: ${servicesDir}, watch mode disabled`);
    return;
  }

  watchMode = true;
  logger.info('Starting watch mode for service definitions...');

  // Initialiser le cache
  const watchPattern = path.join(servicesDir, '**/*.json');
  // Lister récursivement tous les fichiers JSON
  function findJsonFiles(dir: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(dir)) return files;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findJsonFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
    return files;
  }
  
  const files = findJsonFiles(servicesDir);
  for (const file of files) {
    fileCache.set(file, getFileHash(file));
  }

  watcher = chokidar.watch(watchPattern, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on('change', (filePath) => {
      logger.debug(`File changed: ${filePath}`);
      debouncedSync(filePath);
    })
    .on('add', (filePath) => {
      logger.debug(`File added: ${filePath}`);
      fileCache.set(filePath, getFileHash(filePath));
      debouncedSync(filePath);
    })
    .on('unlink', (filePath) => {
      logger.info(`File deleted: ${filePath}`);
      fileCache.delete(filePath);
      // Re-sync pour gérer la suppression
      syncServices().catch((error) => {
        logger.error('Error syncing after file deletion:', error);
      });
    })
    .on('error', (error) => {
      logger.error('Watch error:', error);
    });
}

/**
 * Désactive le watch mode
 */
export function stopWatching(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
    watchMode = false;
    logger.info('Watch mode stopped');
  }
}

/**
 * Démarre la synchronisation périodique (mode production)
 */
export function startPeriodicSync(intervalMinutes: number = 10): void {
  if (process.env.NODE_ENV !== 'production') {
    return; // Seulement en production
  }

  logger.info(`Starting periodic sync every ${intervalMinutes} minutes`);
  setInterval(() => {
    syncServices().catch((error) => {
      logger.error('Error in periodic sync:', error);
    });
  }, intervalMinutes * 60 * 1000);
}

// Si exécuté directement (npm run sync-services)
if (require.main === module) {
  const args = process.argv.slice(2);
  const watch = args.includes('--watch');

  syncServices()
    .then(() => {
      if (watch) {
        watchServices();
        logger.info('Watch mode enabled. Press Ctrl+C to stop.');
        // Garder le processus actif
        process.on('SIGINT', () => {
          stopWatching();
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    })
    .catch((error) => {
      logger.error('Failed to sync services:', error);
      process.exit(1);
    });
}

