import { screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { renderWithRouterAndAuth } from './test-utils';

// Мок API
const getCardsMock = vi.fn();

// Мокаем AuthContext
const useAuthMock = vi.fn();
vi.mock('../Context/AuthContext', () => ({
    useAuth: () => useAuthMock(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../api/api', () => ({
    pdfApi: {
        getCards: getCardsMock,
    },
}));

describe('DashboardApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('показывает карточки после успешного API', async () => {
        useAuthMock.mockReturnValue({ user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' } });
        getCardsMock.mockResolvedValue({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 });

        renderWithRouterAndAuth(<DashboardApp />);

        await waitFor(() => expect(screen.getByText('Q')).toBeInTheDocument());
        expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('показывает loading перед рендером карточек', async () => {
        useAuthMock.mockReturnValue({ user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' } });
        getCardsMock.mockImplementation(
            () =>
                new Promise(resolve =>
                    setTimeout(() => resolve({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }), 50)
                )
        );

        renderWithRouterAndAuth(<DashboardApp />);
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        await waitFor(() => expect(screen.queryByText(/Загрузка/i)).not.toBeInTheDocument());
        expect(screen.getByText('Q')).toBeInTheDocument();
    });

    it('показывает ошибку при API fail', async () => {
        useAuthMock.mockReturnValue({ user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' } });
        getCardsMock.mockRejectedValue(new Error('API Error'));

        renderWithRouterAndAuth(<DashboardApp />);
        await waitFor(() => expect(screen.getByText(/ошибка/i)).toBeInTheDocument());
    });
});