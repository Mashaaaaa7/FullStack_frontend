import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DictionaryWidget from "../components/Dashboard/DictionaryWidget";
import { beforeEach, describe, it, vi } from "vitest";

beforeEach(() => vi.clearAllMocks());

describe("Dictionary loading state", () => {
    it("показывает загрузку и затем данные", async () => {
        render(<DictionaryWidget />);
        const input = screen.getByPlaceholderText(/Введите слово/i);
        const button = screen.getByRole("button", { name: /Узнать/i });

        fireEvent.change(input, { target: { value: "apple" } });
        fireEvent.click(button);

        expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
        await waitFor(() => expect(screen.getByText(/яблоко/i)).toBeInTheDocument());
    });

    it("показывает ошибку при неавторизованном", async () => {
        render(<DictionaryWidget />);
        // можно мокнуть fetch 401
        await waitFor(() => expect(screen.getByText(/Unauthorized/i)).toBeInTheDocument());
    });
});