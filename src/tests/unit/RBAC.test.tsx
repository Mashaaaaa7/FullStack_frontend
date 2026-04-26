import { screen, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, vi } from "vitest";
import { DashboardApp } from "../../components/Dashboard/DashboardApp.tsx";
import { authApi, pdfApi } from "../../api/api";
import { renderWithRouterAndAuth } from "../test-utils.tsx";

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

const renderApp = () => renderWithRouterAndAuth(<DashboardApp />);

describe("RBAC", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("user видит свою роль в интерфейсе", async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 1,
            email: "user@test.com",
            role: "user",
        });

        vi.mocked(pdfApi.listPDFs).mockResolvedValue({ items: [], total: 0 });

        localStorage.setItem("access_token", "mock-token");
        renderApp();

        await waitFor(() =>
            expect(screen.getByText(/роль: user/i)).toBeInTheDocument()
        );
    });

    it("admin видит свою роль в интерфейсе", async () => {
        vi.mocked(authApi.getMe).mockResolvedValue({
            user_id: 2,
            email: "admin@test.com",
            role: "admin",
        });

        vi.mocked(pdfApi.listPDFs).mockResolvedValue({ items: [], total: 0 });

        localStorage.setItem("access_token", "mock-token");
        renderApp();

        await waitFor(() =>
            expect(screen.getByText(/роль: admin/i)).toBeInTheDocument()
        );
    });
});