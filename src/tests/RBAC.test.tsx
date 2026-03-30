// RBAC.test.tsx
import { screen } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { renderWithRouterAndAuth } from './test-utils';

const roles = [
    { role: 'user', canSeeAdmin: false },
    { role: 'admin', canSeeAdmin: true },
];

// Мокаем useAuth на уровне модуля
const useAuthMock = vi.fn();

vi.mock('../Context/AuthContext', () => ({
    useAuth: () => useAuthMock(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('RBAC', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    roles.forEach(({ role, canSeeAdmin }) => {
        it(`${role} ${canSeeAdmin ? 'видит' : 'не видит'} admin меню`, () => {
            // Меняем поведение useAuth для текущего теста
            useAuthMock.mockReturnValue({
                user: { id: 1, email: `${role}@example.com`, role, token: 'token' },
                login: vi.fn(),
                logout: vi.fn(),
                isAuthenticated: true,
                hasRole: (r: 'user' | 'admin') => r === role,
            });

            renderWithRouterAndAuth(<DashboardApp />);

            if (canSeeAdmin) {
                expect(screen.getByText(/admin/i)).toBeInTheDocument();
            } else {
                expect(screen.queryByText(/admin/i)).toBeNull();
            }
        });
    });
});