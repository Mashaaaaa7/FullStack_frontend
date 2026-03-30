import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { Login } from '../components/Auth/Login';
import { renderWithRouterAndAuth } from './test-utils';
import * as api from '../api/api';

describe('LoginPage', () => {
    let loginSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        loginSpy = vi.spyOn(api.authApi, 'login');
    });

    afterEach(() => {
        loginSpy.mockRestore();
    });

    it('рендерится корректно', () => {
        renderWithRouterAndAuth(<Login />);
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Пароль/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('успешный login', async () => {
        loginSpy.mockResolvedValue({
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
            expect(loginSpy).toHaveBeenCalledWith('user@test.com', 'password');
            expect(localStorage.getItem('access_token')).toBe('mock-token');
        });
    });

    it('неуспешный login показывает ошибку', async () => {
        loginSpy.mockRejectedValue({
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
            expect(screen.getByText(/Ошибка при входе/i)).toBeInTheDocument();
        });
    });
});