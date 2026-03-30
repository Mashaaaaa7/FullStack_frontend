import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { Login } from '../components/Auth/Login';
import { renderWithRouterAndAuth } from './test-utils';
import { authApi } from '../api/api';

// Мокаем API
vi.mock('../api/api', () => ({
    authApi: {
        login: vi.fn(),
        getMe: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
    },
    pdfApi: {
        getCards: vi.fn(),
        list: vi.fn(),
    },
    dictionaryApi: {
        getDefinition: vi.fn(),
    },
}));

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('рендерится корректно', async () => {
        renderWithRouterAndAuth(<Login />);

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Пароль/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('успешный login', async () => {
        (authApi.login as any).mockResolvedValue({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
        });

        renderWithRouterAndAuth(<Login />);

        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /войти/i });

        fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({
                email: 'user@test.com',
                password: 'password',
            });
            expect(localStorage.getItem('access_token')).toBe('mock-token');
        });
    });

    it('неуспешный login показывает ошибку', async () => {
        // Правильно мокаем ошибку
        (authApi.login as any).mockRejectedValue({
            response: { data: { detail: 'Invalid credentials' } }
        });

        renderWithRouterAndAuth(<Login />);

        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /войти/i });

        fireEvent.change(emailInput, { target: { value: 'bad@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            // Исправленный текст ошибки — смотрим в компоненте Login.tsx
            // В вашем компоненте выводится "Ошибка при входе"
            expect(screen.getByText(/Ошибка при входе/i)).toBeInTheDocument();
        });
    });
});