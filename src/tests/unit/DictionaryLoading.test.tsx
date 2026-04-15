import { screen, fireEvent, waitFor } from '@testing-library/react';
import {renderWithRouterAndAuth} from "../test-utils.tsx";
import DictionaryWidget from "../../components/Dashboard/DictionaryWidget.tsx";


const mockFetch = vi.fn();

describe('Dictionary loading state', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('access_token', 'mock-token');
        global.fetch = mockFetch;
    });

    it('показывает загрузку и затем данные', async () => {
        mockFetch.mockImplementation(() =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: async () => ({
                            word: 'apple',
                            definitions: [{ partOfSpeech: 'noun', definition: 'яблоко' }]
                        })
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
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ detail: 'Unauthorized' })
        });

        renderWithRouterAndAuth(<DictionaryWidget />);

        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(/Не удалось загрузить определение/i)).toBeInTheDocument();
        });
    });
});