/**
 * API Client for AREA Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    isVerified: boolean;
  };
  token: string;
}

// Backend response format
interface BackendAuthResponse {
  user: {
    id: string;
    email: string;
    display_name: string | null;
  };
  access_token: string;
  refresh_token: string;
}

interface Service {
  id: string;
  name: string;
  displayName: string;
  description: string;
  iconUrl: string;
}

interface ServiceActionParam {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  type: string | null;
  required: boolean | null;
}

interface ServiceAction {
  id: string;
  service_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  polling_supported?: boolean | null;
  webhook_supported?: boolean | null;
  service_action_params?: ServiceActionParam[];
}

interface ServiceReactionParam {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  type: string | null;
  required: boolean | null;
}

interface ServiceReaction {
  id: string;
  service_id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  service_reaction_params?: ServiceReactionParam[];
}

interface UserService {
  id: string;
  user_id: string;
  service_id: string;
  display_name: string | null;
  oauth_account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  created_at: string;
}

interface Area {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
}

interface CreateUserServiceRequest {
  service_id: string;
  oauth_account_id?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  display_name?: string | null;
}

interface CreateAreaActionRequest {
  service_action_id: string;
  user_service_id: string;
  enabled?: boolean;
  param_values?: Array<{
    service_action_param_id: string;
    value_text?: string;
    value_json?: string;
  }>;
}

interface CreateAreaReactionRequest {
  service_reaction_id: string;
  user_service_id: string;
  position?: number;
  enabled?: boolean;
  param_values?: Array<{
    service_reaction_param_id: string;
    value_text?: string;
    value_json?: string;
  }>;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('area_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers
          }
        });

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          if (!response.ok) {
            // Ne pas retry pour les erreurs 4xx
            if (response.status >= 400 && response.status < 500) {
              return {
                success: false,
                error: `HTTP Error: ${response.status} ${response.statusText}`
              };
            }
            // Retry pour les erreurs 5xx
            if (response.status >= 500 && attempt < maxRetries) {
              lastError = new Error(`HTTP ${response.status}`);
              await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
              continue;
            }
            return {
              success: false,
              error: `HTTP Error: ${response.status} ${response.statusText}`
            };
          }
          return {
            success: true,
            data: undefined as T
          };
        }

        const data = await response.json();

        // Si succès, retourner immédiatement
        if (response.ok) {
          return {
            success: true,
            data: data as T
          };
        }

        // Si erreur 401/403, ne pas retry
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            error: data.error || `HTTP Error: ${response.status}`
          };
        }

        // Si erreur 5xx ou timeout, retry
        if (response.status >= 500 || response.status === 0) {
          lastError = new Error(`HTTP ${response.status}`);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            continue;
          }
        }

        // Autres erreurs, ne pas retry
        return {
          success: false,
          error: data.error || `HTTP Error: ${response.status}`
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Network error');
        
        // Retry seulement pour les erreurs réseau
        if (attempt < maxRetries && (error instanceof TypeError || error instanceof DOMException)) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        
        // Dernière tentative ou erreur non-réseau
        if (attempt === maxRetries) {
          console.error('API Request failed after retries:', lastError);
          return {
            success: false,
            error: lastError.message
          };
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed after retries'
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>(endpoint, options);
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.data) {
      // Map backend response to frontend format
      const mappedResponse: AuthResponse = {
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          displayName: response.data.user.display_name || '',
          isVerified: false // Backend doesn't return this yet
        },
        token: response.data.access_token
      };

      localStorage.setItem('area_access_token', response.data.access_token);
      localStorage.setItem('area_refresh_token', response.data.refresh_token);
      localStorage.setItem('area_user', JSON.stringify(mappedResponse.user));

      return {
        success: true,
        data: mappedResponse
      };
    }

    return {
      success: false,
      error: response.error || 'Login failed',
    };
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    // Map displayName to display_name for backend
    const backendData = {
      email: userData.email,
      password: userData.password,
      display_name: userData.display_name
    };

    const response = await this.request<BackendAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });

    if (response.success && response.data) {
      // Map backend response to frontend format
      const mappedResponse: AuthResponse = {
        user: {
          id: response.data.user.id,
          email: response.data.user.email,
          displayName: response.data.user.display_name || '',
          isVerified: false
        },
        token: response.data.access_token
      };

      localStorage.setItem('area_access_token', response.data.access_token);
      localStorage.setItem('area_refresh_token', response.data.refresh_token);
      localStorage.setItem('area_user', JSON.stringify(mappedResponse.user));

      return {
        success: true,
        data: mappedResponse
      };
    }

    return {
      success: false,
      error: response.error || 'Registration failed',
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('area_access_token');
    localStorage.removeItem('area_refresh_token');
    localStorage.removeItem('area_user');
  }

  async getServices(): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>('/services');
  }

  async getServiceActions(serviceId: string): Promise<ApiResponse<ServiceAction[]>> {
    return this.request<ServiceAction[]>(`/services/${serviceId}/actions`);
  }

  async getServiceReactions(serviceId: string): Promise<ApiResponse<ServiceReaction[]>> {
    return this.request<ServiceReaction[]>(`/services/${serviceId}/reactions`);
  }

  async getUserServices(): Promise<ApiResponse<UserService[]>> {
    return this.request<UserService[]>('/me/services');
  }

  async createUserService(payload: CreateUserServiceRequest): Promise<ApiResponse<UserService>> {
    return this.request<UserService>('/me/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async spotifyAuthorize(): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>('/oauth/spotify/authorize', {
      method: 'POST',
    });
  }

  async getAreas(): Promise<ApiResponse<Area[]>> {
    return this.request<Area[]>('/me/areas');
  }

  async createArea(area: Partial<Area>): Promise<ApiResponse<Area>> {
    return this.request<Area>('/me/areas', {
      method: 'POST',
      body: JSON.stringify(area)
    });
  }

  async createAreaAction(areaId: string, payload: CreateAreaActionRequest): Promise<ApiResponse<any>> {
    return this.request<any>(`/me/areas/${areaId}/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createAreaReaction(areaId: string, payload: CreateAreaReactionRequest): Promise<ApiResponse<any>> {
    return this.request<any>(`/me/areas/${areaId}/reactions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateArea(id: string, area: Partial<Area>): Promise<ApiResponse<Area>> {
    return this.request<Area>(`/me/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(area)
    });
  }

  async deleteArea(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/me/areas/${id}`, {
      method: 'DELETE'
    });
  }

  async getServerInfo(): Promise<ApiResponse<any>> {
    // /about.json is a public endpoint, not under /api
    const baseUrl = API_BASE_URL.replace('/api', '');
    try {
      const response = await fetch(`${baseUrl}/about.json`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP Error: ${response.status}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  getStoredUser() {
    try {
      const userStr = localStorage.getItem('area_user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('area_user');
      return null;
    }
  }

  getStoredToken() {
    return localStorage.getItem('area_access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const apiClient = new ApiClient();
export type {
  ApiResponse,
  AuthResponse,
  Service,
  ServiceAction,
  ServiceReaction,
  UserService,
  Area,
  LoginRequest,
  RegisterRequest,
};
