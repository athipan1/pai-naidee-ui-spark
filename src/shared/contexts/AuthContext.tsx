import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '@/shared/services/authService';
import { User, AuthenticationResult } from '@/shared/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthenticationResult>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: any) => boolean; // Using 'any' for now for flexibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.initialize();
        setUser(authService.getCurrentUser());
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Handle error, maybe clear stored user data
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<AuthenticationResult> => {
    const result = await authService.login(username, password);
    if (result.success) {
      setUser(authService.getCurrentUser());
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const hasPermission = useCallback((permission: any): boolean => {
    return authService.hasPermission(permission);
  }, [user]); // Dependency on user ensures it's re-evaluated on login/logout

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};