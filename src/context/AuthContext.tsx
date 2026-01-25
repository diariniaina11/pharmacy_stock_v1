import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../data/mock';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, badgeId: string) => Promise<boolean>;
    logout: () => void;
    hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Check localStorage for persisting session
        const storedUser = localStorage.getItem('pharmacy_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, badgeId: string): Promise<boolean> => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = MOCK_USERS.find(u => u.email === email && u.badgeId === badgeId);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('pharmacy_user', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pharmacy_user');
    };

    const hasRole = (role: Role): boolean => {
        return user?.role === role;
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole }}>
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
