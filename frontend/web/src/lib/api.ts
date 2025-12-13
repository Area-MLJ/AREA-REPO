/**
 * API Client for AREA Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:8080/api';

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
  displayName?: string;
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

interface Service {
  id: string;
  name: string;
  displayName: string;
  description: string;
  iconUrl: string;
}

interface Area {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('area_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP Error: ${response.status}`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('area_token', response.data.token);
      localStorage.setItem('area_user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('area_token', response.data.token);
      localStorage.setItem('area_user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('area_token');
    localStorage.removeItem('area_user');
  }

  // Services
  async getServices(): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>('/services');
  }

  async getUserServices(): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>('/users/services');
  }

  // Areas
  async getAreas(): Promise<ApiResponse<Area[]>> {
    return this.request<Area[]>('/areas');
  }

  async createArea(area: Partial<Area>): Promise<ApiResponse<Area>> {
    return this.request<Area>('/areas', {
      method: 'POST',
      body: JSON.stringify(area)
    });
  }

  async updateArea(id: string, area: Partial<Area>): Promise<ApiResponse<Area>> {
    return this.request<Area>(`/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(area)
    });
  }

  async deleteArea(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/areas/${id}`, {
      method: 'DELETE'
    });
  }

  // Server info
  async getServerInfo(): Promise<ApiResponse<any>> {
    return this.request<any>('/about.json');
  }

  // Utility methods
  getStoredUser() {
    const userStr = localStorage.getItem('area_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredToken() {
    return localStorage.getItem('area_token');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, AuthResponse, Service, Area, LoginRequest, RegisterRequest };