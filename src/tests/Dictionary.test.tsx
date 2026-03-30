import { renderWithRouterAndAuth, setCurrentUser } from "./test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import DictionaryWidget from "../components/Dashboard/DictionaryWidget";
import { beforeEach, describe, it, vi } from "vitest";

beforeEach(() => vi.clearAllMocks());

vi.mock("../api/api", () => ({
    pdfApi: { getCards: vi.fn().mockResolvedValue({ cards: [{ id: 1, question: "Q", answer: "A" }], total: 1 }) },
    dictionaryApi: { getCard: vi.fn((word) => Promise.resolve({ id: 1, question: word, answer: "ответ" })) },
}));

describe("DictionaryWidget", () => {
    it("загружает данные после запроса", async () => {
        setCurrentUser({ id: 1, email: "user@test.com", role: "user", token: "token" });
        renderWithRouterAndAuth(<DictionaryWidget />);

        fireEvent.change(screen.getByPlaceholderText(/Введите слово/i), { target: { value: "apple" } });
        fireEvent.click(screen.getByRole("button", { name: /Узнать/i }));

        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/ответ/i)).toBeInTheDocument());
    });

    it("показывает ошибку при 401", async () => {
        setCurrentUser({ id: 1, email: "user@test.com", role: "user", token: "token" });
        vi.mocked(require("../api/api").dictionaryApi.getCard).mockRejectedValue({ response: { status: 401 } });

        renderWithRouterAndAuth(<DictionaryWidget />);
        fireEvent.change(screen.getByPlaceholderText(/Введите слово/i), { target: { value: "apple" } });
        fireEvent.click(screen.getByRole("button", { name: /Узнать/i }));

        await waitFor(() => expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument());
    });
});