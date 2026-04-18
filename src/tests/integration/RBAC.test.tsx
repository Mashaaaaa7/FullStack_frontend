import {render, screen, waitFor} from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../../components/Dashboard/DashboardApp.tsx';
import { authApi } from '../../api/api';

vi.mock('../../api/api', () => ({
    authApi: {
        getMe: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
    },
    pdfApi: {
        listPDFs: vi.fn().mockResolvedValue({items: [], total: 0}),
        getHistory: vi.fn().mockResolvedValue({history: [], total: 0}),
        getCards: vi.fn().mockResolvedValue({cards: [], total: 0}),
    }
}));

describe('RBAC', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const testCases = [
        { role: 'user' as const, canSeeAdmin: false },
        { role: 'admin' as const, canSeeAdmin: true },
    ];

    testCases.forEach(({ role, canSeeAdmin }) => {
        it(`${role} ${canSeeAdmin ? 'видит' : 'не видит'} admin меню`, async () => {
            vi.mocked(authApi.getMe).mockResolvedValue({
                user_id: 1,
                email: 'test@example.com',
                role,
            });

            localStorage.setItem('access_token', 'mock-token');
            render(<DashboardApp />);

            await waitFor(() => {
                if (canSeeAdmin) {
                    expect(screen.getByText('Админ')).toBeInTheDocument();
                } else {
                    expect(screen.queryByText('Админ')).not.toBeInTheDocument();
                }
            });
        });
    });
});