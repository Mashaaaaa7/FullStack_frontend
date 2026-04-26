import { useState } from "react";
import { dictionaryApi, getErrorMessage } from "../../api/api";
import type { DictionaryData } from "../../types";

export default function DictionaryWidget() {
    const [word, setWord] = useState("");
    const [result, setResult] = useState<DictionaryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedWord = word.trim();
        if (!trimmedWord) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await dictionaryApi.getDefinition(trimmedWord);
            setResult(data);
        } catch (err: unknown) {
            const message = getErrorMessage(err).toLowerCase();

            setError(
                message.includes("404") || message.includes("not found")
                    ? "Слово не найдено"
                    : "Не удалось загрузить определение"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dictionary-widget">
            <h3>📖 Словарь английского</h3>

            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={word}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWord(e.target.value)}
                    placeholder="Введите слово..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !word.trim()}>
                    {loading ? "Загрузка..." : "Узнать"}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {result && !error && (
                <div className="result">
                    <h4>
                        {result.word}{" "}
                        {result.phonetic && <span className="phonetic">/{result.phonetic}/</span>}
                    </h4>

                    {result.definitions.length === 0 ? (
                        <p>Определения не найдены.</p>
                    ) : (
                        result.definitions.map((def, idx) => (
                            <div key={idx} className="definition">
                                <strong>{def.partOfSpeech}</strong>: {def.definition}
                                {def.example && <div className="example">Пример: "{def.example}"</div>}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}