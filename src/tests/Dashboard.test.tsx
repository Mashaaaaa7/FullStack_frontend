import { screen } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { DashboardApp } from '../components/Dashboard/DashboardApp';
import { Login } from '../components/Auth/Login';
import { mockAuth, renderWithRouterAndAuth } from './test-utils';

// Мок API на верхнем уровне
const mockGetCards = vi.fn();

vi.mock('../api/api', () => ({
    pdfApi: { getCards: mockGetCards },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('DashboardApp', () => {

    it('показывает карточки после успешного API', async () => {
        // 1️⃣ Настраиваем замоканный AuthContext
        mockAuth({
            user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' },
        });

        // 2️⃣ Мокируем ответ API
        mockGetCards.mockResolvedValue({
            cards: [{ id: 1, question: 'Q', answer: 'A' }],
            total: 1,
        });

        // 3️⃣ Рендерим компонент внутри теста
        renderWithRouterAndAuth(<DashboardApp />);

        // 4️⃣ Проверяем индикатор загрузки
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // 5️⃣ Ждем появления карточек
        expect(await screen.findByText('Q')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();

        // 6️⃣ Загрузка пропала
        expect(screen.queryByText(/Загрузка/i)).toBeNull();
    });

    it('показывает loading перед рендером карточек', async () => {
        mockAuth({
            user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' },
        });

        // Имитация задержки API
        mockGetCards.mockImplementation(
            () =>
                new Promise(resolve =>
                    setTimeout(() => resolve({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }), 100)
                )
        );

        renderWithRouterAndAuth(<DashboardApp />);

        // Loading виден сразу
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Ждем окончания загрузки
        expect(await screen.findByText('Q')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.queryByText(/Загрузка/i)).toBeNull();
    });

    it('показывает ошибку при API fail', async () => {
        mockAuth({
            user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' },
        });

        mockGetCards.mockRejectedValue(new Error('API Error'));

        renderWithRouterAndAuth(<DashboardApp />);

        // Проверяем появление ошибки
        expect(await screen.findByText(/ошибка/i)).toBeInTheDocument();
    });
});

describe('Login Page', () => {
    it('рендерит форму логина', () => {
        renderWithRouterAndAuth(<Login />);
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
});