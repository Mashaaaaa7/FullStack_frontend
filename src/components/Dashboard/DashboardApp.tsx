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
    const [maxCards, setMaxCards] = useState(10);
    const [processingFileId, setProcessingFileId] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCards, setTotalCards] = useState(0);
    const cardsPerPage = 6;

    useEffect(() => {
        if (user?.email) {
            loadDecksFromServer();
        }
    }, [user?.email]);

    const loadDecksFromServer = async () => {
        try {
            const response = await api.listPDFs();
            if (response.success && response.pdfs) {
                setDecks(response.pdfs);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            setMessage('❌ Не удалось загрузить список PDF');
        }
    };

    const loadPage = async (fileId: number, page: number) => {
        try {
            setLoading(true);
            const skip = (page - 1) * cardsPerPage;
            const response = await api.getCards(fileId, skip, cardsPerPage);

            setCards(response.cards);
            setTotalCards(response.total);
            setCurrentPage(page);
            setMessage('');
        } catch (err: any) {
            setMessage(`❌ Ошибка загрузки страницы: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

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
            setMessage(`🔄 Генерирую карточки (макс. ${maxCards})...`);

            await api.processCards(deck.id, maxCards);

            let attempts = 0;
            while (attempts < 120) {
                await new Promise(resolve => setTimeout(resolve, 2000));

                const statusRes = await api.getProcessingStatus(deck.id);

                if (statusRes.status === 'completed') {
                    setSelectedDeck(deck);
                    setCurrentPage(1);
                    setProcessingStatus(prev => ({...prev, [deck.id]: 'completed'}));
                    setMessage('✅ Карточки готовы!');
                    await loadPage(deck.id, 1);
                    break;
                } else if (statusRes.status === 'failed') {
                    throw new Error('Ошибка при обработке');
                }

                attempts++;
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
            setProcessingStatus(prev => ({...prev, [deck.id]: 'failed'}));
        } finally {
            setLoading(false);
            setProcessingFileId(null);
        }
    };

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
                setCurrentPage(1);
                setTotalCards(0);
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearCards = () => {
        setCards([]);
        setSelectedDeck(null);
        setCurrentPage(1);
        setTotalCards(0);
    };

    const totalPages = Math.ceil(totalCards / cardsPerPage);

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <h1>🎴 Учебные карточки из PDF</h1>
                    <p>Создавайте карточки для эффективного обучения</p>
                    <div className="header-controls">
                        <span>Пользователь: {user?.email}</span>
                    </div>
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

                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <section className="decks-section">
                    <h2>📁 Ваши PDF ({decks.length})</h2>
                    <div className="decks-grid">
                        {decks.map(deck => (
                            <div key={deck.id} className="deck-card">
                                <div className="deck-info">
                                    <h3>{deck.name}</h3>
                                    <p>Размер: {(deck.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    {processingStatus[deck.id] && (
                                        <p className="status-badge">
                                            {processingStatus[deck.id] === 'processing' && '⏳ Обработка...'}
                                            {processingStatus[deck.id] === 'completed' && '✅ Готово'}
                                            {processingStatus[deck.id] === 'failed' && '❌ Ошибка'}
                                        </p>
                                    )}
                                </div>
                                <div className="deck-actions">
                                    <button
                                        onClick={() => handleCreateCards(deck)}
                                        disabled={loading || processingFileId === deck.id}
                                        className="create-cards-btn"
                                    >
                                        ✨ Создать карточки
                                    </button>

                                    <button
                                        onClick={() => {
                                            setSelectedDeck(deck);
                                            setCurrentPage(1);
                                            loadPage(deck.id, 1);
                                        }}
                                        disabled={loading}
                                        className="view-btn"
                                    >
                                        👁️
                                    </button>

                                    <button
                                        onClick={() => handleDeleteDeck(deck)}
                                        disabled={loading}
                                        className="delete-btn"
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                        {decks.length === 0 && <div className="empty-state"><p>Нет PDF</p></div>}
                    </div>
                </section>

                {cards.length > 0 && selectedDeck && (
                    <section className="cards-section">
                        <div className="cards-header">
                            <div>
                                <h2>🎴 Карточки ({totalCards})</h2>
                            </div>
                            <button onClick={handleClearCards} className="clear-cards-btn">
                                🗑️ Очистить все
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

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => loadPage(selectedDeck.id, Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="pagination-btn"
                                >
                                    ← Назад
                                </button>

                                <div className="pagination-pages">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => loadPage(selectedDeck.id, page)}
                                            disabled={loading}
                                            className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => loadPage(selectedDeck.id, Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages || loading}
                                    className="pagination-btn"
                                >
                                    Вперед →
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </main>

            <footer className="app-footer">Учебные карточки из PDF • v1.0</footer>
        </div>
    );
};

export { DashboardApp };