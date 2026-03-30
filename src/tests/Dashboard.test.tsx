import { screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { renderWithRouterAndAuth } from './test-utils';
import * as api from '../api/api';

describe('RBAC Dashboard', () => {
    let getMeSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        getMeSpy = vi.spyOn(api.authApi, 'getMe');
    });

    afterEach(() => {
        getMeSpy.mockRestore();
    });

    const testCases = [
        { role: 'user', canSeeAdmin: false },
        { role: 'admin', canSeeAdmin: true },
    ];

    testCases.forEach(({ role, canSeeAdmin }) => {
        it(`${role} ${canSeeAdmin ? 'видит' : 'не видит'} admin меню`, async () => {
            getMeSpy.mockResolvedValue({
                user_id: 1,
                email: 'test@example.com',
                role
            });

            localStorage.setItem('access_token', 'mock-token');

            renderWithRouterAndAuth(<DashboardApp />);

            await waitFor(() => {
                if (canSeeAdmin) {
                    // Замените на точный текст, который отображается в вашем UI для админ-меню
                    expect(screen.getByText(/Админ-панель/i)).toBeInTheDocument();
                } else {
                    expect(screen.queryByText(/Админ-панель/i)).not.toBeInTheDocument();
                }
            });
        });
    });
});