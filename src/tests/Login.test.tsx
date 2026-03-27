//Проверяет только рендер компонентов

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from "../components/Auth/Login.tsx";

describe('Login Page', () => {
    it('renders LoginPage', () => {
        render(<Login />);
        expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    vi.mock('../../api/api', () => ({
        authApi: { login: vi.fn((email, password) => {
                if(email === 'mary200438@gmail.com' && password === 'password') {
                    return Promise.resolve({ email, role: 'admin' });
                } else {
                    return Promise.reject(new Error('Invalid credentials'));
                }
            })}
    }));

    it('login success redirects to dashboard', async () => {
        render(<Login />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'mary200438@gmail.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        });
    });

    it('login fail shows error', async () => {
        render(<Login />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'mare@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });
});
