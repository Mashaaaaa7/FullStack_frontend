import { describe, it, expect } from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import { DashboardApp } from "../components/Dashboard/DashboardApp.tsx";

describe('Dashboard', () => {
    it('shows error when API fails', async () => {
        vi.mock('../api/api', () => ({
            getPdfCards: vi.fn(() => Promise.reject(new Error('fail')))
        }));

        render(<DashboardApp />);

        await waitFor(() =>
            expect(screen.getByText(/не удалось загрузить pdf/i)).toBeInTheDocument()
        );
    });
    it('renders Dashboard page', () => {
        render(<DashboardApp />);
        expect(screen.getByText(/Учебные карточки/i)).toBeInTheDocument();
    });
});