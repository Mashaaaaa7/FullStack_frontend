import { screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../../components/Dashboard/DashboardApp.tsx';
import { authApi } from '../../api/api';
import {renderWithRouterAndAuth} from "../test-utils.tsx";

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

const renderDashboard = () => renderWithRouterAndAuth(<DashboardApp />);

describe('Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('отображает email и роль пользователя user', async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 1,
            email: 'user@test.com',
            role: 'user',
        });

        localStorage.setItem('access_token', 'mock-token');
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/user@test\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/роль: user/i)).toBeInTheDocument();
        });
    });

    it('отображает email и роль пользователя admin', async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 2,
            email: 'admin@test.com',
            role: 'admin',
        });

        localStorage.setItem('access_token', 'mock-token');
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/admin@test\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/роль: admin/i)).toBeInTheDocument();
        });
    });
});