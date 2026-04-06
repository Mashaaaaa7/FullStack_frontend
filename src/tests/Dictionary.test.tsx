import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { renderWithRouterAndAuth } from './test-utils';
import DictionaryWidget from "../components/Dashboard/DictionaryWidget.tsx";

const mockFetch = vi.fn();

describe('DictionaryWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('access_token', 'mock-token');
        global.fetch = mockFetch;
    });

    it('загружает данные после запроса', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                word: 'apple',
                phonetic: '/ˈæp.əl/',
                definitions: [
                    { partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }
                ]
            })
        });

        renderWithRouterAndAuth(<DictionaryWidget />);

        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'apple' } });
        fireEvent.click(button);

        // Ждём появления результата
        await waitFor(() => {
            expect(screen.getByText(/яблоко/i)).toBeInTheDocument();
        });
    });

    it('показывает ошибку при 401', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ detail: 'Unauthorized' })
        });

        renderWithRouterAndAuth(<DictionaryWidget />);
//
        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Не удалось загрузить определение/i)).toBeInTheDocument();
        });
    });
});