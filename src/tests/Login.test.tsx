import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { Login } from '../components/Auth/Login';
import { renderWithRouterAndAuth } from './test-utils';

const mockLogin = vi.fn();

vi.mock('../api/api', () => ({
    authApi: { login: (...args: any) => mockLogin(...args) },
}));

beforeEach(() => vi.clearAllMocks());

describe('Login Page', () => {
    it('рендерит форму', () => {
        renderWithRouterAndAuth(<Login />);
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('успешный логин', async () => {
        mockLogin.mockResolvedValue({ email: 'user@example.com', role: 'user' });
        renderWithRouterAndAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    });

    it('неуспешный логин показывает ошибку', async () => {
        mockLogin.mockRejectedValue(new Error('Invalid credentials'));
        renderWithRouterAndAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
    });
});