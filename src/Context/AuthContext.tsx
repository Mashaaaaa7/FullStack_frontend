import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../api/api";

export type User = {
    id: number;
    email: string;
    role: "user" | "admin";
    token: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    hasRole: (role: "user" | "admin") => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Инициализация при старте приложения
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
                        token,
                    });
                } catch {
                    localStorage.removeItem('access_token');
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    // Функция входа
    const login = async (email: string, password: string) => {
        try {
            const token = await authApi.login(email, password); // допустим API возвращает токен
            localStorage.setItem('access_token', token);

            const userData = await authApi.getMe(); // получаем данные пользователя
            setUser({
                id: userData.user_id,
                email: userData.email,
                role: userData.role,
                token,
            });
        } catch (err) {
            throw err;
        }
    };

    // Функция выхода
    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
        }
    };

    const isAuthenticated = !!user;
    const hasRole = (role: "user" | "admin") => user?.role === role;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для использования контекста
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};