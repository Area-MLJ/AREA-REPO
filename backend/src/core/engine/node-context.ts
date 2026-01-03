import { SupabaseClient } from '@supabase/supabase-js';
import { Logger } from 'winston';

export interface HttpClient {
  get(url: string, headers?: Record<string, string>): Promise<any>;
  post(url: string, body?: any, headers?: Record<string, string>): Promise<any>;
  put(url: string, body?: any, headers?: Record<string, string>): Promise<any>;
  delete(url: string, headers?: Record<string, string>): Promise<any>;
}

export interface NodeContext {
  areaId: string;
  areaActionId?: string;
  areaReactionId?: string;
  userId: string;
  userServiceId: string;
  input: any; // données provenant de l'Action ou de la Reaction précédente
  logger: Logger;
  httpClient: HttpClient;
  supabaseClient: SupabaseClient;
}

