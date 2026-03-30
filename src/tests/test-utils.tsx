import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Рендер с Router и AuthProvider
export const renderWithRouterAndAuth = (ui: ReactNode) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};