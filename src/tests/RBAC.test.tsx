vi.mock('../api/api', () => ({
    authApi: {
        login: vi.fn(),
        getMe: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
    },
    pdfApi: {
        getCards: vi.fn(),
        list: vi.fn(),
    },
    dictionaryApi: {
        getDefinition: vi.fn(),
    },
}));

import { screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { renderWithRouterAndAuth } from './test-utils';

describe('RBAC', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const testCases = [
        { role: 'user', canSeeAdmin: false },
        { role: 'admin', canSeeAdmin: true },
    ];

    testCases.forEach(({ role, canSeeAdmin }) => {
        it(`${role} ${canSeeAdmin ? 'видит' : 'не видит'} admin меню`, async () => {
            const { authApi } = require('../api/api');

            // Мокаем getMe на нужного пользователя
            authApi.getMe.mockResolvedValue({ user_id: 1, email: 'test@example.com', role });

            // Ставим токен, чтобы AuthProvider считал пользователя авторизованным
            window.localStorage.setItem('access_token', 'mock-token');

            renderWithRouterAndAuth(<DashboardApp />);

            await waitFor(() => {
                if (canSeeAdmin) {
                    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
                } else {
                    expect(screen.queryByText(/Admin/i)).toBeNull();
                }
            });
        });
    });
});