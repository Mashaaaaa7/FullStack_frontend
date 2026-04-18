import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach } from 'vitest';
import DictionaryWidget from '../../components/Dashboard/DictionaryWidget.tsx';

describe('Dictionary loading state', () => {
    beforeEach(() => vi.unstubAllGlobals());

    it('показывает загрузку и затем данные', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                word: 'apple',
                phonetic: null,
                definitions: [{ partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }],
            }),
        }));

        render(<DictionaryWidget />);

        fireEvent.change(screen.getByPlaceholderText('Введите слово...'), {
            target: { value: 'apple' },
        });
        fireEvent.click(screen.getByRole('button', { name: /узнать/i }));

        // Кнопка сразу становится "Загрузка..."
        expect(screen.getByRole('button', { name: /загрузка/i })).toBeInTheDocument();

        await waitFor(() =>
            expect(screen.getByText(/яблоко/i)).toBeInTheDocument()
        );
    });

    it('показывает ошибку при неавторизованном', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
            ok: false,
            status: 401,
        }));

        render(<DictionaryWidget />);

        fireEvent.change(screen.getByPlaceholderText('Введите слово...'), {
            target: { value: 'apple' },
        });
        fireEvent.click(screen.getByRole('button', { name: /узнать/i }));

        await waitFor(() =>
            expect(screen.getByText(/не удалось загрузить/i)).toBeInTheDocument()
        );
    });
});