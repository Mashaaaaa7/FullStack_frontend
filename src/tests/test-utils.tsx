import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../Context/AuthContext';

export const renderWithRouterAndAuth = (ui: React.ReactElement) =>
    render(
        <MemoryRouter>
            <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
    );