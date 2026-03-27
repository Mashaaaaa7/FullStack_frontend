import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
const authModule = '../../Context/AuthContext';

describe('RBAC UI', () => {
    beforeEach(() => {
        vi.resetModules(); // сброс всех моков перед каждым тестом
    });

    it('user cannot see admin menu', async () => {
        vi.doMock(authModule, () => ({
            useAuth: () => ({
                user: { email: 'mashavacylieva@gmail.com', role: 'user' }
            })
        }));
        const { DashboardApp: DashboardUser } = await import('../components/Dashboard/DashboardApp.tsx');
        render(<DashboardUser />);
        expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    });

    it('admin sees admin menu', async () => {
        vi.doMock(authModule, () => ({
            useAuth: () => ({
                user: { email: 'mary200438@gmail.com', role: 'admin' }
            })
        }));
        const { DashboardApp: DashboardAdmin } = await import('../components/Dashboard/DashboardApp.tsx');
        render(<DashboardAdmin />);
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
    });
});