import {screen, fireEvent, waitFor, render} from '@testing-library/react';
import {Login} from "../../components/Auth/Login.tsx";
import {authApi} from "../../api/api.ts";
import { describe, it, beforeEach, afterEach, vi } from 'vitest';

describe('LoginPage', () => {
    let loginSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        loginSpy = vi.spyOn(authApi, 'login');
    });

    afterEach(() => {
        loginSpy.mockRestore();
    });

    it('рендерится корректно', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Пароль/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('успешный login', async () => {
        loginSpy.mockResolvedValue({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
        });

        render(<Login />);

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

        render(<Login />);

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