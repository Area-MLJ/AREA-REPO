// Auth context with real backend integration
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient, type Service } from './lib/api';

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
      localStorage.removeItem('area_access_token');
      localStorage.removeItem('area_refresh_token');
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
      // Map displayName to display_name for backend
      const response = await apiClient.register({ 
        email, 
        password, 
        display_name: displayName 
      });
      
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
  const [services, setServices] = useState<Service[]>([]);
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
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const fetchAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.getAreas();
        if (response.success && response.data) {
          // Map backend format to frontend format
          const mappedAreas = response.data.map((area: any) => ({
            ...area,
            isActive: area.enabled,
            isBuiltin: area.is_builtin || false,
            createdAt: area.created_at || area.createdAt,
            // Extract service names from nested structure
            actionService: area.area_actions?.[0]?.service_actions?.services?.display_name || 
                          area.area_actions?.[0]?.service_actions?.service?.display_name || 
                          'N/A',
            reactionService: area.area_reactions?.[0]?.service_reactions?.services?.display_name || 
                            area.area_reactions?.[0]?.service_reactions?.service?.display_name || 
                            'N/A',
            lastTriggered: null // Backend doesn't return this yet
          }));
          setAreas(mappedAreas);
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
  }, [refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { areas, loading, error, refetch };
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
      { id: '1', name: 'Nouveau email reçu', description: 'Déclenche quand un nouvel email est reçu' },
      { id: '2', name: 'Email avec pièce jointe', description: 'Déclenche quand un email avec pièce jointe est reçu' }
    ],
    reactions: [
      { id: '1', name: 'Envoyer un email', description: 'Envoie un email à un destinataire' },
      { id: '2', name: 'Transférer un email', description: 'Transfère un email à un autre destinataire' }
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
      { id: '3', name: 'Push sur repository', description: 'Déclenche lors d\'un push sur un repository' },
      { id: '4', name: 'Nouvelle issue créée', description: 'Déclenche lorsqu\'une issue est créée' },
      { id: '5', name: 'Pull request mergée', description: 'Déclenche lorsqu\'une pull request est mergée' }
    ],
    reactions: [
      { id: '3', name: 'Créer une issue', description: 'Crée une issue sur un repository' },
      { id: '4', name: 'Commenter une PR', description: 'Ajoute un commentaire à une pull request' }
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
      { id: '6', name: 'Message reçu', description: 'Déclenche lorsqu\'un message est reçu' },
      { id: '7', name: 'Utilisateur rejoint un serveur', description: 'Déclenche lorsqu\'un utilisateur rejoint un serveur' }
    ],
    reactions: [
      { id: '5', name: 'Envoyer un message', description: 'Envoie un message dans un channel' },
      { id: '6', name: 'Créer un channel', description: 'Crée un nouveau channel' }
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
      { id: '8', name: 'Fichier ajouté', description: 'Déclenche lorsqu\'un fichier est ajouté' },
      { id: '9', name: 'Fichier modifié', description: 'Déclenche lorsqu\'un fichier est modifié' }
    ],
    reactions: [
      { id: '7', name: 'Créer un fichier', description: 'Crée un nouveau fichier' },
      { id: '8', name: 'Partager un fichier', description: 'Partage un fichier avec un utilisateur' }
    ]
  }
  ,
  {
    id: '5',
    name: 'Twitch',
    displayName: 'Twitch',
    description: 'Détecte quand un streamer passe en live',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/5968/5968819.png',
    category: 'social',
    isConnected: true,
    actions: [
      {
        id: 'twitch_stream_online',
        name: 'Stream en live',
        description: 'Déclenche quand le streamer (user_login) passe en live',
      },
    ],
    reactions: [],
  }
  ,
  {
    id: '6',
    name: 'Spotify',
    displayName: 'Spotify',
    description: 'Lance un morceau sur Spotify',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2111/2111624.png',
    category: 'social',
    isConnected: true,
    actions: [],
    reactions: [
      {
        id: 'spotify_play_track',
        name: 'Lancer un morceau',
        description: 'Lance un morceau Spotify via son URL',
      },
    ],
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