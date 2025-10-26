// context/AuthContext.tsx - добавляем навигацию в logout
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');
        return token && email ? { email } : null;
    });

    const login = (token: string, email: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        setUser({ email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setUser(null);
        // Навигация будет обработана в компонентах через useNavigate
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);