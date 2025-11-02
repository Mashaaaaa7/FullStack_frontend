import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, email: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedEmail = localStorage.getItem('userEmail');

        if (token && savedEmail) {
            setUser({ email: savedEmail });
        }
        setLoading(false);
    }, []);

    const login = (token: string, email: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        setUser({ email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};