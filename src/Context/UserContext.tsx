import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, LoginData, RegisterData } from '../types';
import { api } from '../api';

interface UserContextType {
    user: User | null;
    login: (data: LoginData) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Начинаем с true для проверки токена

    const login = async (data: LoginData): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await api.login(data);
            if (response.success && response.user && response.token) {
                setUser(response.user);
                localStorage.setItem('token', response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        setLoading(true);
        try {
            const response = await api.register(data);
            if (response.success && response.user && response.token) {
                setUser(response.user);
                localStorage.setItem('token', response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await api.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Проверка авторизации при загрузке
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.verifyToken();
                if (response.success && response.user) {
                    setUser(response.user);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <UserContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};