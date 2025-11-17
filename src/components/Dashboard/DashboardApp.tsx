import React, { useState, useEffect } from 'react';
import { Deck, Card } from '../../types';
import { api } from '../../api/api';
import { useAuth } from '../../Context/AuthContext';
import '../../App.css';

interface DeckWithId extends Deck {
    id: number;
}

interface SavedDeckState {
    deck: DeckWithId;
    cards: Card[];
}

const DashboardApp: React.FC = () => {
    const { user } = useAuth();
    const [decks, setDecks] = useState<DeckWithId[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<DeckWithId | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [processingStatus, setProcessingStatus] = useState<{[key: number]: string}>({});
    const [maxCards, setMaxCards] = useState(10);
    const [processingFileId, setProcessingFileId] = useState<number | null>(null);

    // ✅ При загрузке компонента
    useEffect(() => {
        if (user?.email) {
            loadDecksFromServer();
        }
    }, [user?.email]);

    // ✅ Сохранение состояния в localStorage
    const saveStateToLocalStorage = (deck: DeckWithId, cardsToSave: Card[]) => {
        const state: SavedDeckState = { deck, cards: cardsToSave };
        localStorage.setItem(`deck_state_${user?.email}`, JSON.stringify(state));
    };

    // ✅ Восстановление состояния из localStorage
    const restoreStateFromLocalStorage = (): SavedDeckState | null => {
        const saved = localStorage.getItem(`deck_state_${user?.email}`);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Ошибка восстановления:', e);
            return null;
        }
    };

    // ✅ Загружает список PDF с сервера
    const loadDecksFromServer = async () => {
        try {
            const response = await api.listPDFs();
            if (response.success && response.pdfs) {
                setDecks(response.pdfs);
            }

            // ✅ Восстанавливаем сохранённое состояние карточек
            const savedState = restoreStateFromLocalStorage();
            if (savedState) {
                setSelectedDeck(savedState.deck);
                setCards(savedState.cards);
                console.log(`✅ Восстановлено: ${savedState.cards.length} карточек из "${savedState.deck.name}"`);
            }

            // ✅ Проверяем есть ли текущие генерации
            await checkOngoingProcessing();
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            setMessage('❌ Не удалось загрузить список PDF');
        }
    };

    // ✅ Проверяет текущие генерации при загрузке
    const checkOngoingProcessing = async () => {
        try {
            const response = await api.listPDFs();
            if (!response.pdfs) return;

            for (const deck of response.pdfs) {
                try {
                    const statusRes = await api.getProcessingStatus(deck.id);

                    if (statusRes.status === 'processing') {
                        console.log(`🔄 Обнаружена генерация для ${deck.id}, восстанавливаю...`);
                        setProcessingFileId(deck.id);
                        setProcessingStatus(prev => ({
                            ...prev,
                            [deck.id]: 'processing'
                        }));

                        // ✅ Продолжаем ждать завершения
                        await waitForProcessing(deck);
                    }
                } catch (error) {
                    console.error(`⚠️ Ошибка проверки ${deck.id}:`, error);
                }
            }
        } catch (error) {
            console.error('⚠️ Ошибка проверки генерации:', error);
        }
    };

    const waitForProcessing = async (deck: DeckWithId) => {
        let attempts = 0;
        const maxAttempts = 600;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                const statusRes = await api.getProcessingStatus(deck.id);
                console.log(`📊 Статус ${deck.id}: ${statusRes.status}`);

                if (statusRes.status === 'completed') {
                    // ✅ Загружаем карточки
                    const cardsResponse = await api.getCards(deck.id);
                    if (cardsResponse.cards && cardsResponse.cards.length > 0) {
                        setCards(cardsResponse.cards);
                        setSelectedDeck(deck);
                        saveStateToLocalStorage(deck, cardsResponse.cards);
                        setProcessingStatus(prev => ({...prev, [deck.id]: 'completed'}));
                        setMessage(`✅ Загружено ${cardsResponse.cards.length} карточек`);
                        console.log(`✅ Карточки загружены: ${cardsResponse.cards.length} шт`);
                    } else {
                        setMessage('❌ Карточки не созданы');
                    }
                    break;
                } else if (statusRes.status === 'cancelled') {
                    setMessage('⛔ Генерация отменена');
                    setProcessingStatus(prev => ({...prev, [deck.id]: 'cancelled'}));
                    break;
                } else if (statusRes.status === 'failed') {
                    setMessage('❌ Ошибка при обработке');
                    setProcessingStatus(prev => ({...prev, [deck.id]: 'failed'}));
                    break;
                }
            } catch (error) {
                console.error('⚠️ Ошибка ожидания:', error);
            }

            attempts++;
        }

        if (attempts >= maxAttempts) {
            setMessage('⏱️ Время ожидания истекло');
            setProcessingStatus(prev => ({...prev, [deck.id]: 'failed'}));
        }

        setProcessingFileId(null);
    };

    // ✅ Загружает файл
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage('');

        try {
            await api.uploadPDF(file);
            await loadDecksFromServer();
            setMessage('✅ Файл загружен успешно');
            e.target.value = '';
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCards = async (deck: DeckWithId) => {
        setLoading(true);
        setMessage('');
        setProcessingFileId(deck.id);

        try {
            setProcessingStatus(prev => ({...prev, [deck.id]: 'processing'}));
            setMessage(`🔄 Генерирую до ${maxCards} карточек...`);

            console.log(`🔄 Запускаю: file_id=${deck.id}, max_cards=${maxCards}`);
            await api.processCards(deck.id, maxCards);

            await waitForProcessing(deck);
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
            setProcessingStatus(prev => ({...prev, [deck.id]: 'failed'}));
        } finally {
            setLoading(false);
        }
    };

    // ✅ Отмена генерации
    const handleCancelGeneration = async (fileId: number) => {
        try {
            setMessage('⛔ Отмена генерации...');
            console.log(`⛔ Отменяю генерацию для fileId=${fileId}`);
            await api.cancelProcessing(fileId);
            setProcessingStatus(prev => ({...prev, [fileId]: 'cancelled'}));
            setProcessingFileId(null);
            setMessage('⛔ Генерация отменена');
        } catch (err: any) {
            console.error('❌ Ошибка отмены:', err);
            setMessage(`❌ Ошибка отмены: ${err.message}`);
        }
    };

    // ✅ Удаление PDF файла
    const handleDeleteDeck = async (deck: DeckWithId) => {
        if (!window.confirm(`Удалить ${deck.name}?`)) return;

        setLoading(true);

        try {
            await api.deleteFile(deck.id);
            setDecks(decks.filter(d => d.id !== deck.id));
            setMessage('✅ Файл удален');

            if (selectedDeck?.id === deck.id) {
                setCards([]);
                setSelectedDeck(null);
                localStorage.removeItem(`deck_state_${user?.email}`);
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Очистка карточек
    const handleClearCards = () => {
        setCards([]);
        setSelectedDeck(null);
        localStorage.removeItem(`deck_state_${user?.email}`);
    };

    // ✅ JSX
    return (
        <div className="app">
            <header className="app-header">
                <h1>🎴 Учебные карточки из PDF</h1>
                <div className="header-controls">
                    <p>Пользователь: {user?.email}</p>
                </div>
            </header>

            <main className="app-main">
                {/* Секция загрузки PDF */}
                <section className="upload-section">
                    <h2>📤 Загрузите PDF</h2>
                    <div className="upload-area">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={loading}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="upload-label">
                            {loading ? 'Загрузка...' : 'Выберите PDF'}
                        </label>
                    </div>

                    {/* Slider для выбора количества карточек */}
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '6px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            📊 Максимум карточек: {maxCards}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={maxCards}
                            onChange={(e) => setMaxCards(parseInt(e.target.value))}
                            style={{ width: '100%' }}
                            disabled={loading}
                        />
                    </div>
                </section>

                {/* Сообщение */}
                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : message.includes('⛔') ? 'warning' : 'success'}`}>
                        {message}
                    </div>
                )}

                {/* Секция PDF файлов */}
                <section className="decks-section">
                    <h2>📁 Ваши PDF ({decks.length})</h2>
                    <div className="decks-grid">
                        {decks.map(deck => (
                            <div
                                key={deck.id}
                                className="deck-card"
                                style={{
                                    border: selectedDeck?.id === deck.id ? '2px solid #667eea' : '1px solid #e0e0e0',
                                    backgroundColor: selectedDeck?.id === deck.id ? '#f0f4ff' : 'white'
                                }}
                            >
                                <div className="deck-info">
                                    <h3>{deck.name}</h3>
                                    <p>Размер: {(deck.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    {processingStatus[deck.id] && (
                                        <p className="status-badge">
                                            {processingStatus[deck.id] === 'processing' && '⏳ Обработка...'}
                                            {processingStatus[deck.id] === 'completed' && '✅ Готово'}
                                            {processingStatus[deck.id] === 'failed' && '❌ Ошибка'}
                                            {processingStatus[deck.id] === 'cancelled' && '⛔ Отменено'}
                                        </p>
                                    )}
                                </div>
                                <div className="deck-actions">
                                    {processingFileId === deck.id ? (
                                        // ✅ Кнопка ОТМЕНЫ при генерации
                                        <button
                                            onClick={() => handleCancelGeneration(deck.id)}
                                            style={{
                                                background: '#ff6b6b',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                width: '100%',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ⛔ Остановить
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleCreateCards(deck)}
                                                disabled={loading || processingFileId !== null}
                                                className="create-cards-btn"
                                            >
                                                {processingFileId === deck.id ? '⏳ Создается...' : 'Создать карточки'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDeck(deck)}
                                                disabled={loading}
                                                className="delete-btn"
                                            >
                                                🗑️ Удалить
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {decks.length === 0 && <div className="empty-state"><p>Нет PDF</p></div>}
                    </div>
                </section>

                {/* Секция карточек */}
                {cards.length > 0 && selectedDeck && (
                    <section className="cards-section">
                        <div className="cards-header">
                            <h2>🎴 Карточки из "{selectedDeck.name}" ({cards.length})</h2>
                            <button onClick={handleClearCards} className="clear-cards-btn">🗑️ Очистить</button>
                        </div>
                        <div className="cards-grid">
                            {cards.map((card, index) => (
                                <div key={card.id || index} className="flashcard">
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                    <div className="card-front">
                                        <h3>Вопрос</h3>
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="card-back">
                                        <h3>Ответ</h3>
                                        <p>{card.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="app-footer">Учебные карточки из PDF • v1.0</footer>
        </div>
    );
};

export { DashboardApp };