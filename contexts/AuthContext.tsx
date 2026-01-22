import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock "Google Database" sync
const mockSyncUserWithDB = async (user: User) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`[DB SYNC] Synced user ${user.id} to Google Database (simulated).`);
      resolve();
    }, 800);
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('omni_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      // Simulate Google Login Popup flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: 'google-uid-12345',
        name: 'Demo User',
        email: 'user@example.com',
        avatarUrl: 'https://picsum.photos/100/100'
      };

      await mockSyncUserWithDB(mockUser);
      
      setUser(mockUser);
      localStorage.setItem('omni_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('omni_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};