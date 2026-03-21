import { useState } from 'react';

interface Definition {
    partOfSpeech: string;
    definition: string;
    example?: string;
}

interface DictionaryData {
    word: string;
    phonetic: string | null;
    definitions: Definition[];
}

export default function DictionaryWidget() {
    const [word, setWord] = useState('');
    const [result, setResult] = useState<DictionaryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!word.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Word not found');
                }
                throw new Error('Failed to fetch');
            }
            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message === 'Word not found' ? 'Слово не найдено' : 'Не удалось загрузить определение');
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
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Введите слово..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Загрузка...' : 'Узнать'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {result && !error && (
                <div className="result">
                    <h4>
                        {result.word} {result.phonetic && <span className="phonetic">/{result.phonetic}/</span>}
                    </h4>
                    {result.definitions.map((def, idx) => (
                        <div key={idx} className="definition">
                            <strong>{def.partOfSpeech}</strong>: {def.definition}
                            {def.example && <div className="example">Пример: "{def.example}"</div>}
                        </div>
                    ))}
                    {result.definitions.length === 0 && <p>Определения не найдены.</p>}
                </div>
            )}
        </div>
    );
}