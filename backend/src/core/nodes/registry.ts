import { ActionNode, ReactionNode } from './base';
import { logger } from '@/lib/logger';

export type NodeRegistry = {
  actions: Record<string, ActionNode>;
  reactions: Record<string, ReactionNode>;
};

// Registry global
const registry: NodeRegistry = {
  actions: {},
  reactions: {},
};

/**
 * Enregistre un module Action
 * Clé format: 'service.name' (ex: 'twitch.live_started')
 */
export function registerAction(node: ActionNode): void {
  const key = `${node.service}.${node.name}`;
  if (registry.actions[key]) {
    logger.warn(`Action ${key} is already registered, overwriting...`);
  }
  registry.actions[key] = node;
  logger.debug(`Registered action: ${key}`);
}

/**
 * Enregistre un module Reaction
 * Clé format: 'service.name' (ex: 'discord.send_message')
 */
export function registerReaction(node: ReactionNode): void {
  const key = `${node.service}.${node.name}`;
  if (registry.reactions[key]) {
    logger.warn(`Reaction ${key} is already registered, overwriting...`);
  }
  registry.reactions[key] = node;
  logger.debug(`Registered reaction: ${key}`);
}

/**
 * Récupère un ActionNode par sa clé
 */
export function getAction(key: string): ActionNode | undefined {
  return registry.actions[key];
}

/**
 * Récupère un ReactionNode par sa clé
 */
export function getReaction(key: string): ReactionNode | undefined {
  return registry.reactions[key];
}

/**
 * Liste toutes les actions enregistrées
 */
export function listActions(): ActionNode[] {
  return Object.values(registry.actions);
}

/**
 * Liste toutes les réactions enregistrées
 */
export function listReactions(): ReactionNode[] {
  return Object.values(registry.reactions);
}

export default registry;

