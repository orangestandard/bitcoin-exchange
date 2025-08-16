import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Wallet, AuthState } from '@/types';
import apiClient from '@/utils/api';
import { storage } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (firstName?: string, lastName?: string) => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get('token');
      if (token) {
        try {
          await refreshAuth();
        } catch (error) {
          // Token is invalid, clear storage
          storage.remove('token');
          storage.remove('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const { token, refreshToken, user: userData, wallet: walletData } = response.data;
        
        // Store tokens
        storage.set('token', token);
        storage.set('refreshToken', refreshToken);
        
        // Update state
        setUser(userData);
        setWallet(walletData || null);
        
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      toast.error('Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(email, password, firstName, lastName);
      
      if (response.success && response.data) {
        const { token, refreshToken, user: userData, wallet: walletData } = response.data;
        
        // Store tokens
        storage.set('token', token);
        storage.set('refreshToken', refreshToken);
        
        // Update state
        setUser(userData);
        setWallet(walletData || null);
        
        toast.success('Registration successful!');
        return true;
      } else {
        toast.error(response.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      toast.error('Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Logout can fail, but we should still clear local state
    } finally {
      // Clear storage and state
      storage.remove('token');
      storage.remove('refreshToken');
      setUser(null);
      setWallet(null);
      
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (firstName?: string, lastName?: string): Promise<boolean> => {
    try {
      const response = await apiClient.updateProfile(firstName, lastName);
      
      if (response.success && response.data) {
        setUser(response.data);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Profile update failed');
        return false;
      }
    } catch (error) {
      toast.error('Profile update failed');
      return false;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      const response = await apiClient.getProfile();
      
      if (response.success && response.data) {
        const { user: userData, wallet: walletData } = response.data;
        setUser(userData);
        setWallet(walletData || null);
      } else {
        throw new Error('Failed to refresh auth');
      }
    } catch (error) {
      // Clear invalid auth state
      storage.remove('token');
      storage.remove('refreshToken');
      setUser(null);
      setWallet(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    wallet,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};