// Types pour les réponses API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    isVerified: boolean;
  };
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface ServiceResponse {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  iconUrl: string | null;
}

export interface AreaResponse {
  id: string;
  name: string | null;
  description: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string | null;
  isVerified: boolean;
  createdAt: string;
}

