import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardApp } from "../components/Dashboard/DashboardApp.tsx";

describe('Dashboard', () => {
    it('renders Dashboard page', () => {
        render(<DashboardApp />);
        expect(screen.getByText(/Учебные карточки/i)).toBeInTheDocument();
    });
});