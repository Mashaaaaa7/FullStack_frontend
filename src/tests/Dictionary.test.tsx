import { screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, beforeEach, vi } from 'vitest';
import DictionaryWidget from '../components/Dashboard/DictionaryWidget';
import {mockAuth, renderWithRouterAndAuth,} from './test-utils';

beforeEach(() => vi.clearAllMocks());

describe('DictionaryWidget', () => {
    it('загружает данные после запроса', async () => {
        mockAuth({ user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' } });
        renderWithRouterAndAuth(<DictionaryWidget />);

        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'apple' } });
        fireEvent.click(button);

        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Мок API здесь можно через vi.spyOn(fetch)
        await waitFor(() => expect(screen.getByText(/яблоко/i)).toBeInTheDocument());
    });

    it('показывает ошибку при 401', async () => {
        mockAuth({ user: { id: 1, email: 'user@example.com', role: 'user', token: 'token' } });
        renderWithRouterAndAuth(<DictionaryWidget />);

        await waitFor(() => expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument());
    });
});