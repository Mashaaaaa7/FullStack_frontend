import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const authModule = '../../Context/AuthContext';

const roles = [
    { role: 'user', email: 'mashavacylieva@gmail.com', canSeeAdmin: false },
    { role: 'admin', email: 'mary200438@gmail.com', canSeeAdmin: true },
];

describe('RBAC UI - DashboardApp', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    roles.forEach(({ role, email, canSeeAdmin }) => {
        it(`${role} should ${canSeeAdmin ? '' : 'not '}see admin menu`, async () => {
            vi.doMock(authModule, () => ({
                useAuth: () => ({ user: { email, role } })
            }));

            const { DashboardApp } = await import('../components/Dashboard/DashboardApp.tsx');
            render(<DashboardApp />);

            if(canSeeAdmin) {
                expect(screen.getByText(/admin/i)).toBeInTheDocument();
            } else {
                expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
            }
        });
    });
});