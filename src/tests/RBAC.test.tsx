import { screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { renderWithRouterAndAuth } from './test-utils';
import { authApi } from '../api/api';

vi.mock('../api/api', () => ({
    authApi: {
        getMe: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
    },
    pdfApi: {
        getCards: vi.fn().mockResolvedValue({ cards: [], total: 0 }),
        list: vi.fn().mockResolvedValue({ files: [] }),
    },
    dictionaryApi: {
        getDefinition: vi.fn(),
    },
}));

describe('RBAC', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const testCases = [
        { role: 'user', canSeeAdmin: false },
        { role: 'admin', canSeeAdmin: true },
    ];

    testCases.forEach(({ role, canSeeAdmin }) => {
        it(`${role} ${canSeeAdmin ? 'видит' : 'не видит'} admin меню`, async () => {
            // Мокаем getMe на нужного пользователя
            (authApi.getMe as any).mockResolvedValue({
                user_id: 1,
                email: 'test@example.com',
                role
            });

            localStorage.setItem('access_token', 'mock-token');

            renderWithRouterAndAuth(<DashboardApp />);

            await waitFor(() => {
                if (canSeeAdmin) {
                    expect(screen.getByText(/admin/i)).toBeInTheDocument();
                } else {
                    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
                }
            });
        });
    });
});