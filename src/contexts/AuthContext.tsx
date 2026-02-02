import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';
import { authApi } from '@/api/services';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pharma_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await authApi.login(email, password);

      // Transform backend user data to frontend format
      const transformedUser: User = {
        id: userData.id.toString(),
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        password: '', // Don't store password
        role: userData.role,
        badgeId: userData.badge_id,
      };

      setUser(transformedUser);
      localStorage.setItem('pharma_user', JSON.stringify(transformedUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pharma_user');
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
