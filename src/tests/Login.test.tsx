import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from "../components/Auth/Login.tsx";

beforeEach(() => {
    vi.resetModules();
});

// Мокаем API
vi.mock('../../api/api', () => ({
    authApi: {
        login: vi.fn((email: string, password: string) => {
            if(email === 'mary200438@gmail.com' && password === 'password') {
                return Promise.resolve({ email, role: 'admin' });
            } else {
                return Promise.reject(new Error('Invalid credentials'));
            }
        })
    }
}));

describe('Login Page', () => {
    it('renders LoginPage', () => {
        render(<Login />);
        expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    it('login success redirects to dashboard', async () => {
        render(<Login />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'mary200438@gmail.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/Учебные карточки/i)).toBeInTheDocument();
        });
    });

    it('login fail shows error', async () => {
        render(<Login />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });
});