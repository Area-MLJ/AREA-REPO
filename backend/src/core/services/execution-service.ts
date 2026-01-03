import { getSupabaseClient } from './db/client';
import { ExecutionLog } from '@/types/database';
import { logger } from '@/lib/logger';

export class ExecutionService {
  private supabase = getSupabaseClient();

  /**
   * Crée un execution_log
   */
  async createExecutionLog(data: {
    area_id: string;
    area_action_id?: string;
    area_reaction_id?: string;
    status: 'running' | 'success' | 'failed' | 'skipped' | 'partial_success';
    request_payload?: string;
  }): Promise<ExecutionLog> {
    const { data: executionLog, error } = await this.supabase
      .from('execution_logs')
      .insert({
        area_id: data.area_id,
        area_action_id: data.area_action_id || null,
        area_reaction_id: data.area_reaction_id || null,
        status: data.status,
        request_payload: data.request_payload || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating execution log:', error);
      throw new Error(`Failed to create execution log: ${error.message}`);
    }

    return executionLog as ExecutionLog;
  }

  /**
   * Met à jour un execution_log
   */
  async updateExecutionLog(
    id: string,
    updates: {
      status?: 'running' | 'success' | 'failed' | 'skipped' | 'partial_success';
      response_payload?: string;
      error_text?: string | null;
    }
  ): Promise<ExecutionLog> {
    const updateData: any = {
      ...updates,
      // Convertir null en undefined pour Supabase
      error_text: updates.error_text === null ? undefined : updates.error_text,
    };

    if (updates.status && updates.status !== 'running') {
      updateData.finished_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('execution_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating execution log:', error);
      throw new Error(`Failed to update execution log: ${error.message}`);
    }

    return data as ExecutionLog;
  }

  /**
   * Récupère les execution_logs d'une AREA
   */
  async getExecutionLogsByAreaId(
    area_id: string,
    limit: number = 100
  ): Promise<ExecutionLog[]> {
    const { data, error } = await this.supabase
      .from('execution_logs')
      .select('*')
      .eq('area_id', area_id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching execution logs:', error);
      throw new Error(`Failed to fetch execution logs: ${error.message}`);
    }

    return (data || []) as ExecutionLog[];
  }

  /**
   * Récupère un execution_log par ID
   */
  async getExecutionLogById(id: string): Promise<ExecutionLog | null> {
    const { data, error } = await this.supabase
      .from('execution_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching execution log by id:', error);
      throw new Error(`Failed to fetch execution log: ${error.message}`);
    }

    return data as ExecutionLog;
  }
}

export default new ExecutionService();

