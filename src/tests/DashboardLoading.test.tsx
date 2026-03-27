import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { DashboardApp } from "../components/Dashboard/DashboardApp.tsx";

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('Dashboard loading state', () => {
    it('показывает Dashboard пока API отвечает', async () => {
        // Мокаем API, который Dashboard использует (например getPdfCards)
        const mockGetPdfCards = vi.fn(() =>
            new Promise(resolve =>
                setTimeout(() => resolve({ cards: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }), 200)
            )
        );

        vi.mock('../api/api', () => ({
            getPdfCards: mockGetPdfCards,
        }));

        render(<DashboardApp />);

        // Индикатор загрузки должен быть виден
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Ждём окончания загрузки
        await waitFor(() => expect(screen.queryByText(/Загрузка/i)).not.toBeInTheDocument());

        // После загрузки отображаются PDF карточки
        await waitFor(() =>
            expect(screen.getByText(/Q/i)).toBeInTheDocument()
        );
        await waitFor(() =>
            expect(screen.getByText(/A/i)).toBeInTheDocument()
        );
    });
});