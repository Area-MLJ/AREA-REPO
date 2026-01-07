import { getSupabaseClient } from './db/client';
import {
  Area,
  AreaAction,
  AreaActionParamValue,
  AreaReaction,
  AreaReactionParamValue,
  ServiceAction,
  ServiceReaction,
  ServiceActionParam,
  ServiceReactionParam,
  UserService,
} from '@/types/database';
import { logger } from '@/lib/logger';

export class AreaService {
  private _supabase: ReturnType<typeof getSupabaseClient> | null = null;
  
  private get supabase() {
    if (!this._supabase) {
      this._supabase = getSupabaseClient();
    }
    return this._supabase;
  }

  /**
   * Crée une nouvelle AREA
   */
  async createArea(data: {
    user_id: string;
    name: string;
    description?: string;
    enabled?: boolean;
  }): Promise<Area> {
    const { data: area, error } = await this.supabase
      .from('areas')
      .insert({
        user_id: data.user_id,
        name: data.name,
        description: data.description || null,
        enabled: data.enabled !== undefined ? data.enabled : true,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating area:', error);
      throw new Error(`Failed to create area: ${error.message}`);
    }

    return area as Area;
  }

  /**
   * Récupère les AREA d'un utilisateur avec leurs détails (actions, réactions)
   */
  async getAreasByUserId(user_id: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('areas')
      .select(`
        *,
        area_actions (
          id,
          enabled,
          service_actions (
            id,
            name,
            display_name,
            services (
              id,
              name,
              display_name
            )
          )
        ),
        area_reactions (
          id,
          enabled,
          position,
          service_reactions (
            id,
            name,
            display_name,
            services (
              id,
              name,
              display_name
            )
          )
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching areas:', error);
      throw new Error(`Failed to fetch areas: ${error.message}`);
    }

    // Enrichir les données avec un flag is_builtin
    const builtinAreaNames = ['News to Email']; // Liste des noms d'AREA built-in
    return (data || []).map((area: any) => ({
      ...area,
      is_builtin: builtinAreaNames.includes(area.name),
    }));
  }

  /**
   * Récupère une AREA par ID
   */
  async getAreaById(id: string): Promise<Area | null> {
    const { data, error } = await this.supabase
      .from('areas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching area by id:', error);
      throw new Error(`Failed to fetch area: ${error.message}`);
    }

    return data as Area;
  }

  /**
   * Met à jour une AREA
   */
  async updateArea(
    id: string,
    updates: Partial<Pick<Area, 'name' | 'description' | 'enabled'>>
  ): Promise<Area> {
    const { data, error } = await this.supabase
      .from('areas')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating area:', error);
      throw new Error(`Failed to update area: ${error.message}`);
    }

    return data as Area;
  }

  /**
   * Supprime une AREA
   */
  async deleteArea(id: string): Promise<void> {
    const { error } = await this.supabase.from('areas').delete().eq('id', id);

    if (error) {
      logger.error('Error deleting area:', error);
      throw new Error(`Failed to delete area: ${error.message}`);
    }
  }

  /**
   * Crée une area_action
   */
  async createAreaAction(data: {
    area_id: string;
    service_action_id: string;
    user_service_id: string;
    enabled?: boolean;
  }): Promise<AreaAction> {
    const { data: areaAction, error } = await this.supabase
      .from('area_actions')
      .insert({
        area_id: data.area_id,
        service_action_id: data.service_action_id,
        user_service_id: data.user_service_id,
        enabled: data.enabled !== undefined ? data.enabled : true,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating area action:', error);
      throw new Error(`Failed to create area action: ${error.message}`);
    }

    return areaAction as AreaAction;
  }

  /**
   * Récupère les area_actions d'une AREA
   */
  async getAreaActionsByAreaId(area_id: string): Promise<AreaAction[]> {
    const { data, error } = await this.supabase
      .from('area_actions')
      .select('*')
      .eq('area_id', area_id);

    if (error) {
      logger.error('Error fetching area actions:', error);
      throw new Error(`Failed to fetch area actions: ${error.message}`);
    }

    return (data || []) as AreaAction[];
  }

  /**
   * Récupère une area_action par ID
   */
  async getAreaActionById(id: string): Promise<AreaAction | null> {
    const { data, error } = await this.supabase
      .from('area_actions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching area action by id:', error);
      throw new Error(`Failed to fetch area action: ${error.message}`);
    }

    return data as AreaAction;
  }

  /**
   * Crée ou met à jour les paramètres d'une area_action
   */
  async setAreaActionParamValues(
    area_action_id: string,
    paramValues: Array<{
      service_action_param_id: string;
      value_text?: string;
      value_json?: string;
    }>
  ): Promise<AreaActionParamValue[]> {
    // Supprime les anciennes valeurs
    await this.supabase
      .from('area_action_param_values')
      .delete()
      .eq('area_action_id', area_action_id);

    // Insère les nouvelles valeurs
    if (paramValues.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('area_action_param_values')
      .insert(
        paramValues.map((pv) => ({
          area_action_id,
          service_action_param_id: pv.service_action_param_id,
          value_text: pv.value_text || null,
          value_json: pv.value_json || null,
        }))
      )
      .select();

    if (error) {
      logger.error('Error setting area action param values:', error);
      throw new Error(
        `Failed to set area action param values: ${error.message}`
      );
    }

    return (data || []) as AreaActionParamValue[];
  }

  /**
   * Récupère les paramètres d'une area_action
   */
  async getAreaActionParamValues(
    area_action_id: string
  ): Promise<AreaActionParamValue[]> {
    const { data, error } = await this.supabase
      .from('area_action_param_values')
      .select('*')
      .eq('area_action_id', area_action_id);

    if (error) {
      logger.error('Error fetching area action param values:', error);
      throw new Error(
        `Failed to fetch area action param values: ${error.message}`
      );
    }

    return (data || []) as AreaActionParamValue[];
  }

  /**
   * Crée une area_reaction
   */
  async createAreaReaction(data: {
    area_id: string;
    service_reaction_id: string;
    user_service_id: string;
    position?: number;
    enabled?: boolean;
  }): Promise<AreaReaction> {
    const { data: areaReaction, error } = await this.supabase
      .from('area_reactions')
      .insert({
        area_id: data.area_id,
        service_reaction_id: data.service_reaction_id,
        user_service_id: data.user_service_id,
        position: data.position || 0,
        enabled: data.enabled !== undefined ? data.enabled : true,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating area reaction:', error);
      throw new Error(`Failed to create area reaction: ${error.message}`);
    }

    return areaReaction as AreaReaction;
  }

  /**
   * Récupère les area_reactions d'une AREA
   */
  async getAreaReactionsByAreaId(area_id: string): Promise<AreaReaction[]> {
    const { data, error } = await this.supabase
      .from('area_reactions')
      .select('*')
      .eq('area_id', area_id)
      .order('position', { ascending: true });

    if (error) {
      logger.error('Error fetching area reactions:', error);
      throw new Error(`Failed to fetch area reactions: ${error.message}`);
    }

    return (data || []) as AreaReaction[];
  }

  /**
   * Récupère une area_reaction par ID
   */
  async getAreaReactionById(id: string): Promise<AreaReaction | null> {
    const { data, error } = await this.supabase
      .from('area_reactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching area reaction by id:', error);
      throw new Error(`Failed to fetch area reaction: ${error.message}`);
    }

    return data as AreaReaction;
  }

  /**
   * Crée ou met à jour les paramètres d'une area_reaction
   */
  async setAreaReactionParamValues(
    area_reaction_id: string,
    paramValues: Array<{
      service_reaction_param_id: string;
      value_text?: string;
      value_json?: string;
    }>
  ): Promise<AreaReactionParamValue[]> {
    // Supprime les anciennes valeurs
    await this.supabase
      .from('area_reaction_param_values')
      .delete()
      .eq('area_reaction_id', area_reaction_id);

    // Insère les nouvelles valeurs
    if (paramValues.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('area_reaction_param_values')
      .insert(
        paramValues.map((pv) => ({
          area_reaction_id,
          service_reaction_param_id: pv.service_reaction_param_id,
          value_text: pv.value_text || null,
          value_json: pv.value_json || null,
        }))
      )
      .select();

    if (error) {
      logger.error('Error setting area reaction param values:', error);
      throw new Error(
        `Failed to set area reaction param values: ${error.message}`
      );
    }

    return (data || []) as AreaReactionParamValue[];
  }

  /**
   * Récupère les paramètres d'une area_reaction
   */
  async getAreaReactionParamValues(
    area_reaction_id: string
  ): Promise<AreaReactionParamValue[]> {
    const { data, error } = await this.supabase
      .from('area_reaction_param_values')
      .select('*')
      .eq('area_reaction_id', area_reaction_id);

    if (error) {
      logger.error('Error fetching area reaction param values:', error);
      throw new Error(
        `Failed to fetch area reaction param values: ${error.message}`
      );
    }

    return (data || []) as AreaReactionParamValue[];
  }

  /**
   * Récupère le service_action associé à une area_action
   */
  async getServiceActionByAreaActionId(
    area_action_id: string
  ): Promise<ServiceAction | null> {
    const { data, error } = await this.supabase
      .from('area_actions')
      .select('service_actions(*)')
      .eq('id', area_action_id)
      .single();

    if (error) {
      logger.error('Error fetching service action:', error);
      return null;
    }

    return (data as any)?.service_actions as ServiceAction | null;
  }

  /**
   * Récupère le service_reaction associé à une area_reaction
   */
  async getServiceReactionByAreaReactionId(
    area_reaction_id: string
  ): Promise<ServiceReaction | null> {
    const { data, error } = await this.supabase
      .from('area_reactions')
      .select('service_reactions(*)')
      .eq('id', area_reaction_id)
      .single();

    if (error) {
      logger.error('Error fetching service reaction:', error);
      return null;
    }

    return (data as any)?.service_reactions as ServiceReaction | null;
  }
}

const areaService = new AreaService();
export default areaService;

