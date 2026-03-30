vi.mock('../api/api', () => ({
    authApi: {
        login: vi.fn(),
        getMe: vi.fn(),
        logout: vi.fn(),
        refresh: vi.fn(),
    },
    pdfApi: {
        getCards: vi.fn(),
        list: vi.fn(),
    },
    dictionaryApi: {
        getDefinition: vi.fn(),
    },
}));

import {renderWithRouterAndAuth, setCurrentUser} from "./test-utils";
import { screen, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, vi } from "vitest";
import {DashboardApp} from "../components/Dashboard/DashboardApp.tsx";

beforeEach(() => {
    vi.clearAllMocks();
});

describe("RBAC Dashboard", () => {
    const testCases = [
        { role: "user", canSeeAdmin: false },
        { role: "admin", canSeeAdmin: true },
    ];

    testCases.forEach(({ role, canSeeAdmin }) => {
        it(`${role} ${canSeeAdmin ? "видит" : "не видит"} admin меню`, async () => {
            setCurrentUser({ id: 1, email: "test@test.com", role, token: "token" });
            renderWithRouterAndAuth(<DashboardApp />);

            await waitFor(() => {
                if (canSeeAdmin) {
                    expect(screen.getByText(/admin/i)).toBeInTheDocument();
                } else {
                    expect(screen.queryByText(/admin/i)).toBeNull();
                }
            });
        });
    });
});