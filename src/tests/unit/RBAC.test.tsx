import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../../components/Dashboard/DashboardApp.tsx';
import { AuthProvider } from '../../Context/AuthContext.tsx';
import { authApi } from '../../api/api';

vi.mock('../../api/api', () => ({
    authApi: {
        getMe: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
    },
    pdfApi: {
        listPDFs: vi.fn().mockResolvedValue({ items: [], total: 0 }),
        getHistory: vi.fn().mockResolvedValue({ history: [], total: 0 }),
        getCards: vi.fn().mockResolvedValue({ cards: [], total: 0 }),
    },
    default: { post: vi.fn(), get: vi.fn() },
}));

const renderApp = () =>
    render(
        <MemoryRouter>
            <AuthProvider>
                <DashboardApp />
            </AuthProvider>
        </MemoryRouter>
    );

describe('RBAC', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('user видит свою роль в интерфейсе', async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 1, email: 'user@test.com', role: 'user',
        });
        localStorage.setItem('access_token', 'mock-token');
        renderApp();

        await waitFor(() =>
            expect(screen.getByText(/роль: user/i)).toBeInTheDocument()
        );
    });

    it('admin видит свою роль в интерфейсе', async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 2, email: 'admin@test.com', role: 'admin',
        });
        localStorage.setItem('access_token', 'mock-token');
        renderApp();

        await waitFor(() =>
            expect(screen.getByText(/роль: admin/i)).toBeInTheDocument()
        );
    });
});