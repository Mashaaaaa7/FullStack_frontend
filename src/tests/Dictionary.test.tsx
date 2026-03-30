import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import { renderWithRouterAndAuth } from './test-utils';
import { dictionaryApi } from '../api/api';
import DictionaryWidget from "../components/Dashboard/DictionaryWidget.tsx";

// Мокаем API
vi.mock('../api/api', async () => {
    const actual = await vi.importActual('../api/api');
    return {
        ...actual,
        dictionaryApi: {
            getDefinition: vi.fn(),
        },
        authApi: {
            getMe: vi.fn().mockResolvedValue({ user_id: 1, email: 'test@example.com', role: 'user' }),
        },
    };
});

describe('DictionaryWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('access_token', 'mock-token');
    });

    it('загружает данные после запроса', async () => {
        // Мокаем успешный ответ
        (dictionaryApi.getDefinition as any).mockResolvedValue({
            word: 'apple',
            phonetic: '/ˈæp.əl/',
            definitions: [
                { partOfSpeech: 'noun', definition: 'яблоко', example: 'I eat an apple.' }
            ]
        });

        renderWithRouterAndAuth(<DictionaryWidget />);

        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'apple' } });
        fireEvent.click(button);

        // Проверяем что появилась загрузка
        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Ждём появления результата
        await waitFor(() => {
            expect(screen.getByText(/яблоко/i)).toBeInTheDocument();
        });
    });

    it('показывает ошибку при 401', async () => {
        // Мокаем ошибку авторизации
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