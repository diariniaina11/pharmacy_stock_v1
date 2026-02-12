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
      const response = await authApi.login(email, password);
      const apiUser = response.user;
      const token = response.token;

      // Transform backend user data to frontend format
      const transformedUser: User = {
        id: apiUser.id.toString(),
        nom: apiUser.nom,
        prenom: apiUser.prenom,
        email: apiUser.email,
        password: '', // Don't store password
        role: apiUser.role,
        badgeId: apiUser.badge_id,
      };

      setUser(transformedUser);
      localStorage.setItem('pharma_user', JSON.stringify(transformedUser));
      localStorage.setItem('pharma_token', token);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pharma_user');
    localStorage.removeItem('pharma_token');
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
