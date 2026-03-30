import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Импортируем оригинальный AuthContext
import * as AuthContextModule from '../Context/AuthContext';

// Рендер с Router и AuthProvider
export const renderWithRouterAndAuth = (ui: ReactNode) =>
    render(
        <BrowserRouter>
            <AuthContextModule.AuthProvider>{ui}</AuthContextModule.AuthProvider>
        </BrowserRouter>
    );

// Мокаем AuthContext частично
export const mockAuth = (opts: {
    user?: { id: number; email: string; role: 'user' | 'admin'; token: string } | null;
    loading?: boolean;
}) => {
    vi.mock('../Context/AuthContext', async (importOriginal) => {
        const actual = await importOriginal<typeof AuthContextModule>();
        return {
            ...actual, // возвращаем оригинальные экспорты, чтобы AuthProvider был
            useAuth: () => ({
                user: opts.user ?? null,
                loading: opts.loading ?? false,
                login: vi.fn(),
                logout: vi.fn(),
                isAuthenticated: !!opts.user,
                hasRole: (role: 'user' | 'admin') => opts.user?.role === role,
            }),
        };
    });
};