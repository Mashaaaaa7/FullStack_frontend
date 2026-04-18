import {screen, fireEvent, waitFor, render} from '@testing-library/react';
import DictionaryWidget from "../../components/Dashboard/DictionaryWidget.tsx";
import { describe, it, beforeEach, vi } from 'vitest';
import { dictionaryApi } from '../../api/api';

vi.mock('../../api/api', () => ({
    dictionaryApi: { getDefinition: vi.fn() },
    authApi: { getMe: vi.fn(), logout: vi.fn(), login: vi.fn() },
    pdfApi: { listPDFs: vi.fn(), getHistory: vi.fn() },
}));

describe('Dictionary loading state', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('access_token', 'mock-token');
    });

    it('показывает загрузку и затем данные', async () => {
        vi.mocked(dictionaryApi.getDefinition).mockImplementation(() =>
            new Promise(resolve =>
                setTimeout(() => resolve({
                    word: 'apple',
                    definitions: [{ partOfSpeech: 'noun', definition: 'яблоко' }]
                }), 100)
            )
        );

        render(<DictionaryWidget />);
        fireEvent.change(screen.getByPlaceholderText(/Введите слово/i), { target: { value: 'apple' } });
        fireEvent.click(screen.getByRole('button', { name: /Узнать/i }));

        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/яблоко/i)).toBeInTheDocument();
        });
    });

    it('показывает ошибку при неавторизованном', async () => {
        vi.mocked(dictionaryApi.getDefinition).mockRejectedValueOnce({
            response: { status: 401 }
        });

        render(<DictionaryWidget />);
        fireEvent.change(screen.getByPlaceholderText(/Введите слово/i), { target: { value: 'test' } });
        fireEvent.click(screen.getByRole('button', { name: /Узнать/i }));

        await waitFor(() => {
            expect(screen.getByText(/Не удалось загрузить определение/i)).toBeInTheDocument();
        });
    });
});