import "@testing-library/jest-dom";
import {  screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, vi, beforeEach } from "vitest";
import { renderWithRouterAndAuth } from "./test-utils";
import {Login} from "../components/Auth/Login.tsx";

beforeEach(() => vi.clearAllMocks());

vi.mock("../api/api", () => ({
    authApi: {
        login: vi.fn((email: string, password: string) => {
            if (email === "user@test.com" && password === "password") return Promise.resolve("token");
            return Promise.reject(new Error("Invalid credentials"));
        }),
        getMe: vi.fn(() =>
            Promise.resolve({ user_id: 1, email: "user@test.com", role: "user" })
        ),
    },
}));

describe("LoginPage", () => {
    it("рендерится корректно", () => {
        renderWithRouterAndAuth(<Login />);
        expect(screen.getByText(/Войти/i)).toBeInTheDocument();
    });

    it("успешный login", async () => {
        renderWithRouterAndAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: "user@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/Пароль/i), {
            target: { value: "password" },
        });
        fireEvent.click(screen.getByText(/Войти/i));

        await waitFor(() =>
            expect(screen.getByText(/Dashboard/i)).toBeInTheDocument()
        );
    });

    it("неуспешный login показывает ошибку", async () => {
        renderWithRouterAndAuth(<Login />);

        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: "bad@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/Пароль/i), {
            target: { value: "wrong" },
        });
        fireEvent.click(screen.getByText(/Войти/i));

        await waitFor(() =>
            expect(screen.getByText(/ошибка при входе/i)).toBeInTheDocument()
        );
    });
});