import { screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { renderWithRouterAndAuth } from './test-utils';
import * as AuthContext from '../Context/AuthContext';

vi.mock('../Context/AuthContext', async () => {
    const actual = await vi.importActual('../Context/AuthContext');
    return {
        ...actual, // сохраняем реальный AuthProvider и другие экспорты
        useAuth: vi.fn(),
    };
});

describe('RBAC Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const testCases = [
        { role: 'user', expectedRoleText: /Роль:\s*user/i },
        { role: 'admin', expectedRoleText: /Роль:\s*admin/i },
    ];

    testCases.forEach(({ role, expectedRoleText }) => {
        it(`отображает роль "${role}" в интерфейсе`, async () => {
            // Настраиваем мок useAuth
            (AuthContext.useAuth as any).mockReturnValue({
                user: { user_id: 1, email: 'test@example.com', role },
                loading: false,
            });

            localStorage.setItem('access_token', 'mock-token');

            renderWithRouterAndAuth(<DashboardApp />);

            await waitFor(() => {
                expect(screen.getByText(expectedRoleText)).toBeInTheDocument();
            });
        });
    });
});