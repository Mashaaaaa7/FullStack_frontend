import React, { useState, useEffect } from 'react';
import { Deck, Card } from '../../types';
import { api } from '../../api/api';
import { useAuth } from '../../Context/AuthContext';
import '../../App.css';

interface DeckWithId extends Deck {
    id: number;
}

const DashboardApp: React.FC = () => {
    const { user } = useAuth();
    const [decks, setDecks] = useState<DeckWithId[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<DeckWithId | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [processingStatus, setProcessingStatus] = useState<{[key: number]: string}>({});
    const [generationConfig, setGenerationConfig] = useState({ maxCards: 10 });
    const [generatingFileId, setGeneratingFileId] = useState<number | null>(null);

    useEffect(() => {
        if (user?.email) {
            loadDecksFromServer();
        }
    }, [user?.email]);

    const loadDecksFromServer = async () => {
        try {
            console.log('📂 Загружаю список PDF с сервера...');
            const response = await api.listPDFs();

            if (response.success && response.pdfs) {
                setDecks(response.pdfs);
                console.log(`✅ Загружено ${response.pdfs.length} PDF файлов`);

                // ✅ Проверяем статусы ПОСЛЕ загрузки списка
                checkStatusesForLoadedDecks(response.pdfs);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки PDF:', error);
            setMessage('❌ Не удалось загрузить список PDF');
        }
    };

    // ✅ НОВАЯ ФУНКЦИЯ: быстро проверяет только активные обработки
    const checkStatusesForLoadedDecks = async (decksList: DeckWithId[]) => {
        for (const deck of decksList) {
            try {
                const statusRes = await api.getProcessingStatus(deck.id);

                if (statusRes.status === 'processing') {
                    setProcessingStatus(prev => ({
                        ...prev,
                        [deck.id]: 'processing'
                    }));
                    setGeneratingFileId(deck.id);
                    console.log(`⏳ Обнаружена обработка для файла ${deck.id}`);
                }
            } catch (error) {
                console.error(`⚠️ Ошибка проверки статуса для ${deck.id}:`, error);
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage('');

        try {
            console.log(`📤 Загружаю файл: ${file.name}`);
            const res = await api.uploadPDF(file);

            console.log('✅ Файл загружен, обновляю список...');

            // ✅ Добавляем задержку перед обновлением списка
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadDecksFromServer();

            setMessage(`✅ ${res.message}`);
            e.target.value = '';
        } catch (err: any) {
            console.error('❌ Ошибка загрузки:', err);
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCards = async (deck: DeckWithId) => {
        setLoading(true);
        setMessage('');
        setGeneratingFileId(deck.id);

        try {
            setProcessingStatus(prev => ({...prev, [deck.id]: 'processing'}));
            setMessage(`🔄 Начинаем создание карточек для "${deck.name}" (макс. ${generationConfig.maxCards})...`);

            console.log(`🔄 Запускаю обработку PDF ${deck.id}...`);
            await api.processCards(deck.id, generationConfig.maxCards);

            setMessage(`⏳ Генерирую карточки... подождите...`);

            let attempts = 0;
            const maxAttempts = 120;

            while (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                const statusRes = await api.getProcessingStatus(deck.id);
                console.log(`📊 Статус: ${statusRes.status}, карточек: ${statusRes.cards_count}`);

                if (statusRes.status === 'completed') {
                    console.log(`✅ Обработка завершена, загружаю карточки...`);

                    const cardsResponse = await api.getCards(deck.id);
                    console.log(`🎴 Получил карточки:`, cardsResponse);

                    if (cardsResponse.success && cardsResponse.cards && cardsResponse.cards.length > 0) {
                        setCards(cardsResponse.cards);
                        setSelectedDeck(deck);
                        setProcessingStatus(prev => ({...prev, [deck.id]: 'completed'}));
                        setMessage(`✅ Загружено ${cardsResponse.cards.length} карточек`);
                        console.log(`✅ Карточки загружены: ${cardsResponse.cards.length} шт`);
                    } else {
                        setMessage('❌ Карточки не найдены');
                        setProcessingStatus(prev => ({...prev, [deck.id]: 'failed'}));
                    }

                    break;

                } else if (statusRes.status === 'cancelled') {
                    setMessage('⛔ Генерация отменена');
                    setProcessingStatus(prev => ({...prev, [deck.id]: 'cancelled'}));
                    break;
                } else if (statusRes.status === 'failed') {
                    throw new Error('Ошибка при обработке PDF на сервере');
                }

                attempts++;
            }

            if (attempts >= maxAttempts) {
                throw new Error('Время ожидания истекло');
            }

        } catch (err: any) {
            console.error('❌ Ошибка:', err);
            setMessage(`❌ ${err.message}`);
            setProcessingStatus(prev => ({...prev, [deck.id]: 'failed'}));
        } finally {
            setLoading(false);
            setGeneratingFileId(null);
        }
    };

    const handleCancelGeneration = async (fileId: number) => {
        try {
            console.log(`⛔ Отмена генерации для файла ${fileId}...`);
            await api.cancelProcessing(fileId);
            setMessage('⛔ Генерация отменена');
            setProcessingStatus(prev => ({...prev, [fileId]: 'cancelled'}));
            setGeneratingFileId(null);
        } catch (err: any) {
            console.error('❌ Ошибка отмены:', err);
            setMessage(`❌ ${err.message}`);
        }
    };

    const handleDeleteDeck = async (deck: DeckWithId) => {
        if (!window.confirm(`Удалить ${deck.name}?`)) return;

        setLoading(true);

        try {
            console.log(`🗑️ Удаляю PDF ${deck.id}...`);
            await api.deleteFile(deck.id);

            setDecks(decks.filter(d => d.id !== deck.id));
            setMessage('✅ Файл удален');
            console.log('✅ Файл удалён успешно');

            if (selectedDeck?.id === deck.id) {
                setCards([]);
                setSelectedDeck(null);
            }
        } catch (err: any) {
            console.error('❌ Ошибка удаления:', err);
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearCards = () => {
        setCards([]);
        setSelectedDeck(null);
        setMessage('Карточки очищены');
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎴 Учебные карточки из PDF</h1>
                <div className="header-controls">
                    <p>Пользователь: {user?.email}</p>
                    <button
                        onClick={loadDecksFromServer}
                        disabled={loading}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        🔄 Обновить
                    </button>
                </div>
            </header>

            <main className="app-main">
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

                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '6px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            📊 Максимум карточек: {generationConfig.maxCards}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={generationConfig.maxCards}
                            onChange={(e) => setGenerationConfig({ maxCards: parseInt(e.target.value) })}
                            style={{ width: '100%' }}
                            disabled={loading}
                        />
                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.5rem 0 0 0' }}>
                            Выберите количество карточек (1-50)
                        </p>
                    </div>
                </section>

                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : message.includes('⛔') ? 'warning' : 'success'}`}>
                        {message}
                    </div>
                )}

                <section className="decks-section">
                    <h2>📁 Ваши PDF файлы ({decks.length})</h2>
                    <div className="decks-grid">
                        {decks.map(deck => (
                            <div key={deck.id} className="deck-card">
                                <div className="deck-info">
                                    <h3>{deck.name}</h3>
                                    <p>Размер: {(deck.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    <p>Загружен: {new Date(deck.created_at).toLocaleString('ru-RU')}</p>
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
                                    {generatingFileId === deck.id ? (
                                        <button
                                            onClick={() => handleCancelGeneration(deck.id)}
                                            style={{
                                                background: '#ff6b6b',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                width: '100%'
                                            }}
                                        >
                                            ⛔ Остановить
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleCreateCards(deck)}
                                                disabled={loading || processingStatus[deck.id] === 'processing'}
                                                className="create-cards-btn"
                                            >
                                                {processingStatus[deck.id] === 'processing'
                                                    ? '⏳ Создается...'
                                                    : 'Создать карточки'}
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
                        {decks.length === 0 && (
                            <div className="empty-state">
                                <p>Нет загруженных PDF</p>
                            </div>
                        )}
                    </div>
                </section>

                {cards.length > 0 && selectedDeck && (
                    <section className="cards-section">
                        <div className="cards-header">
                            <h2>🎴 Карточки из "{selectedDeck.name}" ({cards.length})</h2>
                            <button
                                onClick={handleClearCards}
                                className="clear-cards-btn"
                                title="Очистить карточки"
                            >
                                🗑️ Очистить
                            </button>
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
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="app-footer">
                Учебные карточки из PDF • Версия 1.0.0
            </footer>
        </div>
    );
};

export { DashboardApp };