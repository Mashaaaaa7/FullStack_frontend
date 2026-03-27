import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { Login } from '../components/Auth/Login.tsx';

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('LoginPage loading state', () => {
    it('показывает loading пока API отвечает', async () => {
        const mockLogin = vi.fn(() => new Promise(resolve => setTimeout(() => resolve({ email: 'user@example.com', role: 'user' }), 200)));
        vi.mock('../api/api', () => ({ authApi: { login: mockLogin } }));

        render(<Login />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // Индикатор загрузки должен быть виден
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Ждём окончания загрузки
        await waitFor(() => expect(screen.queryByText(/Загрузка/i)).not.toBeInTheDocument());

        // После загрузки появляется Dashboard
        await waitFor(() => expect(screen.getByText(/Учебные карточки/i)).toBeInTheDocument());
    });
});