// Auth context with real backend integration
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from './lib/api';

interface User {
  id: string;
  email: string;
  displayName: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    try {
      const storedUser = apiClient.getStoredUser();
      const token = apiClient.getStoredToken();
      
      if (storedUser && token) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      localStorage.removeItem('area_user');
      localStorage.removeItem('area_token');
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.register({ email, password, displayName });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export API client and hooks for data fetching
export { apiClient } from './lib/api';

// Hooks for data fetching (using already imported useState/useEffect)
export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.getServices();
        if (response.success && response.data) {
          setServices(response.data);
        } else {
          setError(response.error || 'Failed to fetch services');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};

// Hook for areas
export const useAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await apiClient.getAreas();
        if (response.success && response.data) {
          setAreas(response.data);
        } else {
          setError(response.error || 'Failed to fetch areas');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return { areas, loading, error, refetch: () => {
    setLoading(true);
    setError(null);
    // Re-run effect
  }};
};

// Fallback mock data for development
export const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Gmail',
    displayName: 'Gmail',
    description: 'Service de messagerie électronique de Google',
    iconUrl: '/icons/gmail.svg',
    category: 'communication',
    isConnected: false,
    actions: [
      { id: '1', name: 'Nouveau email reçu' },
      { id: '2', name: 'Email avec pièce jointe' }
    ],
    reactions: [
      { id: '1', name: 'Envoyer un email' },
      { id: '2', name: 'Transférer un email' }
    ]
  },
  {
    id: '2', 
    name: 'GitHub',
    displayName: 'GitHub',
    description: 'Plateforme de développement collaboratif',
    iconUrl: '/icons/github.svg',
    category: 'productivity',
    isConnected: true,
    actions: [
      { id: '3', name: 'Push sur repository' },
      { id: '4', name: 'Nouvelle issue créée' },
      { id: '5', name: 'Pull request mergée' }
    ],
    reactions: [
      { id: '3', name: 'Créer une issue' },
      { id: '4', name: 'Commenter une PR' }
    ]
  },
  {
    id: '3',
    name: 'Discord',
    displayName: 'Discord',
    description: 'Plateforme de communication pour communautés',
    iconUrl: '/icons/discord.svg',
    category: 'social',
    isConnected: false,
    actions: [
      { id: '6', name: 'Message reçu' },
      { id: '7', name: 'Utilisateur rejoint un serveur' }
    ],
    reactions: [
      { id: '5', name: 'Envoyer un message' },
      { id: '6', name: 'Créer un channel' }
    ]
  },
  {
    id: '4',
    name: 'GoogleDrive',
    displayName: 'Google Drive',
    description: 'Service de stockage cloud de Google',
    iconUrl: '/icons/gdrive.svg',
    category: 'storage',
    isConnected: false,
    actions: [
      { id: '8', name: 'Fichier ajouté' },
      { id: '9', name: 'Fichier modifié' }
    ],
    reactions: [
      { id: '7', name: 'Créer un fichier' },
      { id: '8', name: 'Partager un fichier' }
    ]
  }
];

export const MOCK_AREAS = [
  {
    id: '1',
    name: 'Email to GitHub',
    description: 'Create GitHub issue from email',
    enabled: true,
    createdAt: new Date().toISOString()
  }
];