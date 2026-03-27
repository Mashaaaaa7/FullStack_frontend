import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import DictionaryWidget from "../components/DictionaryWidget.tsx";

// Мокаем API заранее
vi.mock('../api/api', () => ({
    getDictionary: vi.fn(() =>
        new Promise(resolve =>
            setTimeout(() => resolve({ entries: [{ id: 1, question: 'Q', answer: 'A' }], total: 1 }), 200)
        )
    ),
}));

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('Dictionary loading state', () => {
    it('показывает ошибку при 500', async () => {
        vi.mock('../api/api', () => ({
            getDictionary: vi.fn(() => Promise.reject(new Error('Server error')))
        }));

        render(<DictionaryWidget />);

        await waitFor(() =>
            expect(screen.getByText(/не удалось загрузить/i)).toBeInTheDocument()
        );
    });

    it('показывает ошибку при 401', async () => {
        vi.mock('../api/api', () => ({
            getDictionary: vi.fn(() => Promise.reject(new Error('Unauthorized')))
        }));

        render(<DictionaryWidget />);

        await waitFor(() =>
            expect(screen.getByText(/unauthorized/i)).toBeInTheDocument()
        );
    });

    it('показывает индикатор загрузки пока API отвечает и потом отображает данные', async () => {
        render(<DictionaryWidget />);

        // Индикатор загрузки должен быть виден
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Ждём окончания загрузки
        await waitFor(() => expect(screen.queryByText(/Загрузка/i)).not.toBeInTheDocument());

        // После загрузки отображаются словарные карточки
        await waitFor(() => expect(screen.getByText(/Q/i)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/A/i)).toBeInTheDocument());
    });
});