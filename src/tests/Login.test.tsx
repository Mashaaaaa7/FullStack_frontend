import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { Login } from '../components/Auth/Login';
import { renderWithRouterAndAuth } from './test-utils';

// Мокаем API до импорта компонентов
vi.mock('../api/api', () => {
    const mockGetMe = vi.fn();
    const mockLogin = vi.fn();
    const mockLogout = vi.fn();
    const mockRefresh = vi.fn();

    const mockGetCards = vi.fn();
    const mockList = vi.fn();
    const mockUpload = vi.fn();
    const mockProcessCards = vi.fn();
    const mockDelete = vi.fn();
    const mockDownload = vi.fn();
    const mockGetHistory = vi.fn();

    return {
        authApi: {
            getMe: mockGetMe,
            login: mockLogin,
            logout: mockLogout,
            refresh: mockRefresh,
        },
        pdfApi: {
            getCards: mockGetCards,
            list: mockList,
            upload: mockUpload,
            processCards: mockProcessCards,
            delete: mockDelete,
            download: mockDownload,
            getHistory: mockGetHistory,
        },
    };
});

import { authApi } from '../api/api';

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('рендерит форму', async () => {
        await act(async () => {
            renderWithRouterAndAuth(<Login />);
        });

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Пароль/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('успешный login', async () => {
        (authApi.login as any).mockReturnValue(Promise.resolve({
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
        }));

        await act(async () => {
            renderWithRouterAndAuth(<Login />);
        });

        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /войти/i });

        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
            fireEvent.change(passwordInput, { target: { value: 'password' } });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalled();
        });
    });

    it('неуспешный login показывает ошибку', async () => {
        (authApi.login as any).mockReturnValue(Promise.reject({
            response: { data: { detail: 'Invalid credentials' } }
        }));

        await act(async () => {
            renderWithRouterAndAuth(<Login />);
        });

        const emailInput = screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByPlaceholderText(/Пароль/i);
        const submitButton = screen.getByRole('button', { name: /войти/i });

        await act(async () => {
            fireEvent.change(emailInput, { target: { value: 'bad@test.com' } });
            fireEvent.change(passwordInput, { target: { value: 'wrong' } });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByText(/неверный логин или пароль/i)).toBeInTheDocument();
        });
    });
});