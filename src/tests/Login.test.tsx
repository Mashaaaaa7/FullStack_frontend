import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { Login } from '../components/Auth/Login';
import { renderWithRouterAndAuth } from './test-utils';

const loginMock = vi.fn();

// Мокаем AuthContext
const useAuthMock = vi.fn();
vi.mock('../Context/AuthContext', () => ({
    useAuth: () => useAuthMock(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('рендерит форму', () => {
        useAuthMock.mockReturnValue({
            login: loginMock,
        });

        renderWithRouterAndAuth(<Login />);

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/пароль/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('успешный логин вызывает login', async () => {
        loginMock.mockResolvedValue({});
        useAuthMock.mockReturnValue({ login: loginMock });

        renderWithRouterAndAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/пароль/i), {
            target: { value: 'password' },
        });
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        await waitFor(() => expect(loginMock).toHaveBeenCalledWith('user@example.com', 'password'));
    });

    it('неуспешный логин показывает ошибку', async () => {
        loginMock.mockRejectedValue(new Error('API Error'));
        useAuthMock.mockReturnValue({ login: loginMock });

        renderWithRouterAndAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: 'wrong@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/пароль/i), {
            target: { value: 'wrongpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        await waitFor(() => expect(screen.getByText(/ошибка при входе/i)).toBeInTheDocument());
    });
});