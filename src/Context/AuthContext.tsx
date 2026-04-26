import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api, { authApi } from "../api/api";
import { CurrentUser } from "../types";

interface AuthContextType {
    user: CurrentUser | null;
    setUser: (user: CurrentUser | null) => void;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    hasRole: (role: "user" | "admin") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            authApi.getMe()
                .then(data => setUser(data))
                .catch(() => localStorage.removeItem('access_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        localStorage.setItem('access_token', response.access_token);
        const userData = await authApi.getMe();
        setUser(userData);
    };

    const logout = async () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        try {
            await api.post('/api/auth/logout');
        } catch {
            // intentionally ignored
        }
    };

    const isAuthenticated = !!user;
    const hasRole = (role: "user" | "admin") => user?.role === role;

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAuthenticated, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export const useUser = useAuth;