import { screen } from '@testing-library/react';
import { it } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { mockAuth, renderWithRouterAndAuth } from './test-utils';

const roles: { role: 'user' | 'admin'; canSeeAdmin: boolean }[] = [
    { role: 'user', canSeeAdmin: false },
    { role: 'admin', canSeeAdmin: true },
];

roles.forEach(({ role, canSeeAdmin }) => {
    it(`${role} ${canSeeAdmin ? 'видит' : 'не видит'} admin меню`, () => {
        mockAuth({
            user: { id: 1, email: `${role}@example.com`, role, token: 'token' },
        });
        renderWithRouterAndAuth(<DashboardApp />);
        if (canSeeAdmin) expect(screen.getByText(/admin/i)).toBeInTheDocument();
        else expect(screen.queryByText(/admin/i)).toBeNull();
    });
});