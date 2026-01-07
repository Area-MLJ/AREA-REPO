import { getSupabaseClient } from './db/client';
import { User, UserService as UserServiceType, OAuthIdentity } from '@/types/database';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';

export class UserService {
  private _supabase: ReturnType<typeof getSupabaseClient> | null = null;
  
  private get supabase() {
    if (!this._supabase) {
      this._supabase = getSupabaseClient();
    }
    return this._supabase;
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(data: {
    email: string;
    password: string;
    display_name?: string;
  }): Promise<User> {
    // bcryptjs est synchrone, mais c'est acceptable ici car l'insert DB domine le temps total
    const passwordHash = bcrypt.hashSync(data.password, 10);

    const { data: user, error } = await this.supabase
      .from('users')
      .insert({
        email: data.email,
        password_hash: passwordHash,
        display_name: data.display_name || null,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return user as User;
  }

  /**
   * Récupère un utilisateur par email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      logger.error('Error fetching user by email:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data as User;
  }

  /**
   * Récupère un utilisateur par ID
   */
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching user by id:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data as User;
  }

  /**
   * Vérifie le mot de passe
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password_hash) {
      return false;
    }
    return bcrypt.compareSync(password, user.password_hash);
  }

  /**
   * Crée ou met à jour une identité OAuth
   */
  async upsertOAuthIdentity(data: {
    user_id: string;
    provider: string;
    provider_user_id: string;
    access_token?: string;
    refresh_token?: string;
    scope?: string;
    expires_at?: string;
  }): Promise<OAuthIdentity> {
    const { data: identity, error } = await this.supabase
      .from('oauth_identities')
      .upsert(
        {
          user_id: data.user_id,
          provider: data.provider,
          provider_user_id: data.provider_user_id,
          access_token: data.access_token || null,
          refresh_token: data.refresh_token || null,
          scope: data.scope || null,
          expires_at: data.expires_at || null,
        },
        {
          onConflict: 'provider,provider_user_id',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('Error upserting OAuth identity:', error);
      throw new Error(`Failed to upsert OAuth identity: ${error.message}`);
    }

    return identity as OAuthIdentity;
  }

  /**
   * Récupère une identité OAuth
   */
  async getOAuthIdentity(
    user_id: string,
    provider: string
  ): Promise<OAuthIdentity | null> {
    const { data, error } = await this.supabase
      .from('oauth_identities')
      .select('*')
      .eq('user_id', user_id)
      .eq('provider', provider)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching OAuth identity:', error);
      throw new Error(`Failed to fetch OAuth identity: ${error.message}`);
    }

    return data as OAuthIdentity;
  }

  /**
   * Crée un user_service (connexion utilisateur à un service)
   */
  async createUserService(data: {
    user_id: string;
    service_id: string;
    oauth_account_id?: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
    display_name?: string;
  }): Promise<UserServiceType> {
    const { data: userService, error } = await this.supabase
      .from('user_services')
      .insert({
        user_id: data.user_id,
        service_id: data.service_id,
        oauth_account_id: data.oauth_account_id || null,
        access_token: data.access_token || null,
        refresh_token: data.refresh_token || null,
        token_expires_at: data.token_expires_at || null,
        display_name: data.display_name || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating user service:', error);
      throw new Error(`Failed to create user service: ${error.message}`);
    }

    return userService as UserServiceType;
  }

  /**
   * Récupère les user_services d'un utilisateur
   */
  async getUserServices(user_id: string): Promise<UserServiceType[]> {
    const { data, error } = await this.supabase
      .from('user_services')
      .select('*')
      .eq('user_id', user_id);

    if (error) {
      logger.error('Error fetching user services:', error);
      throw new Error(`Failed to fetch user services: ${error.message}`);
    }

    return (data || []) as UserServiceType[];
  }

  /**
   * Récupère un user_service par ID
   */
  async getUserServiceById(id: string): Promise<UserServiceType | null> {
    const { data, error } = await this.supabase
      .from('user_services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      logger.error('Error fetching user service by id:', error);
      throw new Error(`Failed to fetch user service: ${error.message}`);
    }

    return data as UserServiceType;
  }
}

export default new UserService();

