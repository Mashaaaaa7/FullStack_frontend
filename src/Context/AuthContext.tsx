// Context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
    id: number;
    email: string;
    role: 'user' | 'admin';
    token: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    const login = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);