// Temporary shared exports until shared module is fixed
import { createContext, useContext, useState, ReactNode } from 'react';

// Mock AuthContext
export const AuthContext = createContext<any>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: async () => {},
      isLoading: false
    };
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual login with backend
      console.log('Login attempt:', { email });
      setIsLoading(false);
      return { success: false, error: 'Not implemented yet' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual registration with backend
      console.log('Register attempt:', { email, displayName });
      setIsLoading(false);
      return { success: false, error: 'Not implemented yet' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    setUser(null);
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

// Mock data exports
export const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Gmail',
    description: 'Email service',
    connected: false
  },
  {
    id: '2', 
    name: 'GitHub',
    description: 'Code repository',
    connected: false
  }
];

export const MOCK_AREAS = [
  {
    id: '1',
    name: 'Email to GitHub',
    description: 'Create GitHub issue from email',
    enabled: true
  }
];