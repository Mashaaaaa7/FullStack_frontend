import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { renderWithRouterAndAuth } from './test-utils';
import { dictionaryApi } from '../api/api';
import DictionaryWidget from "../components/Dashboard/DictionaryWidget.tsx";

// Мокаем API
vi.mock('../api/api', () => ({
    dictionaryApi: {
        getDefinition: vi.fn(),
    },
    authApi: {
        getMe: vi.fn().mockResolvedValue({ user_id: 1, email: 'test@example.com', role: 'user' }),
    },
    pdfApi: {
        getCards: vi.fn().mockResolvedValue({ cards: [], total: 0 }),
    },
}));

describe('Dictionary loading state', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('access_token', 'mock-token');
    });

    it('показывает загрузку и затем данные', async () => {
        // Используем mockImplementation для задержки
        (dictionaryApi.getDefinition as any).mockImplementation(() =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        word: 'apple',
                        definitions: [{ partOfSpeech: 'noun', definition: 'яблоко' }]
                    });
                }, 100);
            })
        );

        renderWithRouterAndAuth(<DictionaryWidget />);

        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'apple' } });
        fireEvent.click(button);

        // Проверяем загрузку
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Ждём результат
        await waitFor(() => {
            expect(screen.getByText(/яблоко/i)).toBeInTheDocument();
        });
    });

    it('показывает ошибку при неавторизованном', async () => {
        (dictionaryApi.getDefinition as any).mockRejectedValue({
            response: { status: 401, data: { detail: 'Unauthorized' } }
        });

        renderWithRouterAndAuth(<DictionaryWidget />);

        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/не удалось загрузить/i)).toBeInTheDocument();
        });
    });
});