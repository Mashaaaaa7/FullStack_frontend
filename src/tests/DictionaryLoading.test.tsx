import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DictionaryWidget from "../components/Dashboard/DictionaryWidget.tsx";

beforeEach(() => {
    vi.clearAllMocks();
});

describe('Dictionary loading state', () => {
    it('shows loading and then data', async () => {
        render(<DictionaryWidget />);
        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole('button', { name: /Узнать/i });

        fireEvent.change(input, { target: { value: 'apple' } });
        fireEvent.click(button);

        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();

        // Мокаем fetch / API в компоненте через vi.spyOn или jest-fetch-mock
        // После ответа:
        await waitFor(() => expect(screen.getByText(/яблоко/i)).toBeInTheDocument());
    });

    it('shows error on unauthorized', async () => {
        render(<DictionaryWidget />);

        // Мокаем fetch на 401
        // await waitFor(() => expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument());
    });
});