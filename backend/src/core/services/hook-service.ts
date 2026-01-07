import { getSupabaseClient } from './db/client';
import { HookJob, HookLog } from '@/types/database';
import { logger } from '@/lib/logger';

export class HookService {
  private _supabase: ReturnType<typeof getSupabaseClient> | null = null;
  
  private get supabase() {
    if (!this._supabase) {
      this._supabase = getSupabaseClient();
    }
    return this._supabase;
  }

  /**
   * Crée un hook_job
   */
  async createHookJob(data: {
    area_action_id: string;
    type: 'polling' | 'webhook';
    polling_interval_seconds?: number;
    webhook_endpoint?: string;
    status?: 'active' | 'inactive' | 'paused';
  }): Promise<HookJob> {
    const { data: hookJob, error } = await this.supabase
      .from('hook_jobs')
      .insert({
        area_action_id: data.area_action_id,
        type: data.type,
        polling_interval_seconds:
          data.type === 'polling' ? data.polling_interval_seconds || 60 : null,
        webhook_endpoint:
          data.type === 'webhook' ? data.webhook_endpoint || null : null,
        status: data.status || 'active',
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating hook job:', error);
      throw new Error(`Failed to create hook job: ${error.message}`);
    }

    return hookJob as HookJob;
  }

  /**
   * Récupère les hook_jobs d'une AREA (via area_action)
   */
  async getHookJobsByAreaId(area_id: string): Promise<HookJob[]> {
    const { data, error } = await this.supabase
      .from('hook_jobs')
      .select('*, area_actions!inner(area_id)')
      .eq('area_actions.area_id', area_id);

    if (error) {
      logger.error('Error fetching hook jobs:', error);
      throw new Error(`Failed to fetch hook jobs: ${error.message}`);
    }

    return (data || []) as HookJob[];
  }

  /**
   * Récupère un hook_job par ID
   */
  async getHookJobById(id: string): Promise<HookJob | null> {
    const { data, error } = await this.supabase
      .from('hook_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching hook job by id:', error);
      throw new Error(`Failed to fetch hook job: ${error.message}`);
    }

    return data as HookJob;
  }

  /**
   * Récupère un hook_job par webhook_endpoint
   */
  async getHookJobByWebhookEndpoint(
    endpoint: string
  ): Promise<HookJob | null> {
    const { data, error } = await this.supabase
      .from('hook_jobs')
      .select('*')
      .eq('webhook_endpoint', endpoint)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching hook job by endpoint:', error);
      throw new Error(`Failed to fetch hook job: ${error.message}`);
    }

    return data as HookJob;
  }

  /**
   * Récupère tous les hook_jobs actifs de type polling
   */
  async getActivePollingJobs(): Promise<HookJob[]> {
    const { data, error } = await this.supabase
      .from('hook_jobs')
      .select('*')
      .eq('type', 'polling')
      .eq('status', 'active');

    if (error) {
      logger.error('Error fetching active polling jobs:', error);
      throw new Error(`Failed to fetch active polling jobs: ${error.message}`);
    }

    return (data || []) as HookJob[];
  }

  /**
   * Met à jour last_run_at d'un hook_job
   */
  async updateHookJobLastRun(id: string, last_run_at: string): Promise<void> {
    const { error } = await this.supabase
      .from('hook_jobs')
      .update({ last_run_at })
      .eq('id', id);

    if (error) {
      logger.error('Error updating hook job last_run_at:', error);
      throw new Error(`Failed to update hook job: ${error.message}`);
    }
  }

  /**
   * Crée un hook_log
   */
  async createHookLog(data: {
    hook_job_id: string;
    event_payload?: string;
  }): Promise<HookLog> {
    const { data: hookLog, error } = await this.supabase
      .from('hook_logs')
      .insert({
        hook_job_id: data.hook_job_id,
        event_payload: data.event_payload || null,
        processed: false,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating hook log:', error);
      throw new Error(`Failed to create hook log: ${error.message}`);
    }

    return hookLog as HookLog;
  }

  /**
   * Marque un hook_log comme traité
   */
  async markHookLogProcessed(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('hook_logs')
      .update({ processed: true })
      .eq('id', id);

    if (error) {
      logger.error('Error marking hook log as processed:', error);
      throw new Error(`Failed to mark hook log as processed: ${error.message}`);
    }
  }

  /**
   * Récupère un hook_log par ID
   */
  async getHookLogById(id: string): Promise<HookLog | null> {
    const { data, error } = await this.supabase
      .from('hook_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching hook log by id:', error);
      throw new Error(`Failed to fetch hook log: ${error.message}`);
    }

    return data as HookLog;
  }
}

const hookService = new HookService();
export default hookService;

