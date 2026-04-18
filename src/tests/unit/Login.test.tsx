import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { Login } from '../../components/Auth/Login';
import * as AuthContext from '../../Context/AuthContext';

const mockLogin = vi.fn();

vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: null,
    setUser: vi.fn(),
    loading: false,
    login: mockLogin,
    logout: vi.fn(),
    isAuthenticated: false,
    hasRole: vi.fn(() => false),
});

const renderLogin = () =>
    render(
        <MemoryRouter>
            <Login />
        </MemoryRouter>
    );

describe('LoginPage', () => {
    beforeEach(() => vi.clearAllMocks());

    it('рендерится корректно', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
    });

    it('успешный login', async () => {
        mockLogin.mockResolvedValueOnce(undefined);
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123'));
    });

    it('неуспешный login показывает ошибку', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Неверный пароль'));
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /войти/i }));

        await waitFor(() =>
            expect(screen.getByRole('alert')).toBeInTheDocument()
        );
    });
});