import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/api';
import { GetMe } from "../types";

interface AuthContextType {
    user: GetMe | null;
    loading: boolean;
    login: (user: GetMe) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    hasRole: (role: 'user' | 'admin') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<GetMe | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const userData = await authApi.getMe();
                    setUser({
                        id: userData.user_id,
                        email: userData.email,
                        role: userData.role,
                        token: token,
                    });
                } catch {
                    localStorage.removeItem('access_token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (newUser: GetMe) => {
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
        }
    };

    const isAuthenticated = !!user;
    const hasRole = (role: 'user' | 'admin') => user?.role === role;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};