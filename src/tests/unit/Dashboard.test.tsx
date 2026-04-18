import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../../components/Dashboard/DashboardApp.tsx';
import { useAuth } from '../../Context/AuthContext.tsx';
import { CurrentUser } from '../../types';
import { renderWithRouterAndAuth } from '../test-utils.tsx';

vi.mock('../../Context/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAuth: vi.fn(),
}));

function mockUseAuth(partial: { user: CurrentUser | null; loading?: boolean }) {
    vi.mocked(useAuth).mockReturnValue({
        user: partial.user,
        loading: partial.loading ?? false,
        isAuthenticated: !!partial.user,
        setUser: vi.fn(),
        login: vi.fn(),
        logout: vi.fn(),
        hasRole: vi.fn(),
    });
}

describe('RBAC Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const testCases = [
        { role: 'user' as const, expectedRoleText: /Роль:\s*user/i },
        { role: 'admin' as const, expectedRoleText: /Роль:\s*admin/i },
    ];

    testCases.forEach(({ role, expectedRoleText }) => {
        it(`отображает роль "${role}" в интерфейсе`, async () => {
            mockUseAuth({ user: { user_id: 1, email: 'test@example.com', role } });

            localStorage.setItem('access_token', 'mock-token');
            renderWithRouterAndAuth(<DashboardApp />); // ← исправлено

            await waitFor(() => {
                expect(screen.getByText(expectedRoleText)).toBeInTheDocument();
            });
        });
    });
});