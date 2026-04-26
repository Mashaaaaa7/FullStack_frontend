import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach } from "vitest";
import DictionaryWidget from "../../components/Dashboard/DictionaryWidget.tsx";
import { dictionaryApi } from "../../api/api";

vi.mock("../../api/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../api/api")>();

    return {
        ...actual,
        dictionaryApi: {
            ...actual.dictionaryApi,
            getDefinition: vi.fn(),
        },
    };
});

describe("Dictionary loading state", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("показывает загрузку и затем данные", async () => {
        vi.mocked(dictionaryApi.getDefinition).mockResolvedValueOnce({
            word: "apple",
            phonetic: null,
            definitions: [
                {
                    partOfSpeech: "noun",
                    definition: "яблоко",
                    example: "I eat an apple.",
                },
            ],
        });

        render(<DictionaryWidget />);

        fireEvent.change(screen.getByPlaceholderText("Введите слово..."), {
            target: { value: "apple" },
        });
        fireEvent.click(screen.getByRole("button", { name: /узнать/i }));

        expect(
            screen.getByRole("button", { name: /загрузка/i })
        ).toBeInTheDocument();

        expect(await screen.findByText(/яблоко/i)).toBeInTheDocument();
    });

    it("показывает ошибку при неавторизованном запросе", async () => {
        vi.mocked(dictionaryApi.getDefinition).mockRejectedValueOnce(
            new Error("Unauthorized")
        );

        render(<DictionaryWidget />);

        fireEvent.change(screen.getByPlaceholderText("Введите слово..."), {
            target: { value: "apple" },
        });
        fireEvent.click(screen.getByRole("button", { name: /узнать/i }));

        expect(
            await screen.findByText(/не удалось загрузить определение/i)
        ).toBeInTheDocument();
    });
});