import { screen, waitFor } from "@testing-library/react";
import { DashboardApp } from "../../components/Dashboard/DashboardApp.tsx";
import { authApi, pdfApi } from "../../api/api";
import { renderWithRouterAndAuth } from "../test-utils.tsx";
import { describe, it, beforeEach, vi, expect } from "vitest";

vi.mock("../../api/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../api/api")>();

    return {
        ...actual,
        authApi: {
            ...actual.authApi,
            getMe: vi.fn(),
            login: vi.fn(),
            logout: vi.fn(),
        },
        pdfApi: {
            ...actual.pdfApi,
            listPDFs: vi.fn().mockResolvedValue({ items: [], total: 0 }),
            getHistory: vi.fn().mockResolvedValue({ history: [], total: 0 }),
            getCards: vi.fn().mockResolvedValue({ cards: [], total: 0 }),
            getFiles: vi.fn().mockResolvedValue({ items: [], total: 0 }),
            processCards: vi.fn(),
        },
    };
});

const renderDashboard = () => renderWithRouterAndAuth(<DashboardApp />);

describe("Dashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("отображает email и роль пользователя user", async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 1,
            email: "user@test.com",
            role: "user",
        });

        vi.mocked(pdfApi.listPDFs).mockResolvedValue({ items: [], total: 0 });

        localStorage.setItem("access_token", "mock-token");
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/user@test\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/роль: user/i)).toBeInTheDocument();
        });
    });

    it("отображает email и роль пользователя admin", async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 2,
            email: "admin@test.com",
            role: "admin",
        });

        vi.mocked(pdfApi.listPDFs).mockResolvedValue({ items: [], total: 0 });

        localStorage.setItem("access_token", "mock-token");
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/admin@test\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/роль: admin/i)).toBeInTheDocument();
        });
    });
});