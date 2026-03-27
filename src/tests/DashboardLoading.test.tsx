import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { DashboardApp } from "../components/Dashboard/DashboardApp.tsx";

const mockGetPdfCards = vi.fn();

vi.mock('../api/api', () => ({
    getPdfCards: mockGetPdfCards,
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Dashboard loading state', () => {
    it('показывает loading и затем данные', async () => {
        mockGetPdfCards.mockImplementation(() =>
            new Promise(resolve =>
                setTimeout(() =>
                    resolve({
                        cards: [{ id: 1, question: 'Q', answer: 'A' }],
                        total: 1
                    }), 200
                )
            )
        );

        render(<DashboardApp />);

        // 1. loading есть
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // 2. loading исчезает
        await waitFor(() =>
            expect(screen.queryByText(/Загрузка/i)).not.toBeInTheDocument()
        );

        // 3. данные появились
        expect(screen.getByText(/Q/i)).toBeInTheDocument();
        expect(screen.getByText(/A/i)).toBeInTheDocument();
    });
});