import { NodeContext } from '../engine/node-context';

export interface ActionResult {
  triggered: boolean;
  output?: any; // données à propager aux réactions
}

export interface ReactionResult {
  success: boolean;
  output?: any;
}

export interface ActionNode {
  type: 'action';
  service: string; // 'twitch', 'github', 'timer', etc.
  name: string; // 'live_started', 'issue_created', etc.
  execute(ctx: NodeContext, params: Record<string, any>): Promise<ActionResult>;
}

export interface ReactionNode {
  type: 'reaction';
  service: string; // 'discord', 'smtp', etc.
  name: string; // 'send_message', etc.
  execute(ctx: NodeContext, params: Record<string, any>): Promise<ReactionResult>;
}

