import React, { useState, useEffect } from 'react';
import { Deck, Card } from '../../types';
import {pdfApi} from '../../api/api';
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
    const [maxCards, setMaxCards] = useState(10);
    const [processingFileId] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCards, setTotalCards] = useState(0);
    const cardsPerPage = 6;

    // Состояние для модальных окон
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteCardsModalOpen, setDeleteCardsModalOpen] = useState(false);
    const [selectedDeckForDelete, setSelectedDeckForDelete] = useState<DeckWithId | null>(null);

    useEffect(() => {
        if (user?.email) loadDecksFromServer();
    }, [user?.email]);

    const loadDecksFromServer = async () => {
        try {
            const response = await pdfApi.listPDFs();
            if (response.success && response.pdfs) {
                setDecks(response.pdfs);
            }
        } catch (err) {
            console.error('❌ Ошибка загрузки:', err);
            setMessage('❌ Не удалось загрузить список PDF');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (!user) return <p>Вы не авторизованы</p>;

    const loadPage = async (fileId: number, page: number) => {
        try {
            setLoading(true);
            const skip = (page - 1) * cardsPerPage;
            const response = await pdfApi.getCards(fileId, skip, cardsPerPage);

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
            await pdfApi.uploadPDF(file);
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
        setMessage(`🔄 Генерирую карточки (макс. ${maxCards})...`);

        try {
            await pdfApi.processCards(deck.id, maxCards);
            let attempts = 0;

            while (attempts < 120) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const statusRes = await pdfApi.getProcessingStatus(deck.id);

                if (statusRes.status === 'completed') {
                    setSelectedDeck(deck);
                    setCurrentPage(1);
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
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteDeck = (deck: DeckWithId) => {
        setSelectedDeckForDelete(deck);
        setDeleteModalOpen(true);
    };

    const confirmDeleteDeck = async () => {
        if (!selectedDeckForDelete) return;

        setLoading(true);
        setDeleteModalOpen(false);

        try {
            await pdfApi.deleteFile(selectedDeckForDelete.id);
            setDecks(decks.filter(d => d.id !== selectedDeckForDelete.id));
            setMessage('✅ Файл удален');

            if (selectedDeck?.id === selectedDeckForDelete.id) {
                setCards([]);
                setSelectedDeck(null);
                setCurrentPage(1);
                setTotalCards(0);
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
            setSelectedDeckForDelete(null);
        }
    };

    const handleClearCardsClick = () => {
        setDeleteCardsModalOpen(true);
    };

    const confirmClearCards = () => {
        setCards([]);
        setSelectedDeck(null);
        setCurrentPage(1);
        setTotalCards(0);
        setDeleteCardsModalOpen(false);
    };

    const totalPages = Math.ceil(totalCards / cardsPerPage);
    if (!user) return <p>Вы не авторизованы</p>;

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <h1>📖 Учебные карточки из PDF</h1>
                    <p>Создавайте карточки для эффективного обучения</p>
                    <div className="header-controls">
                        <span>Пользователь: {user.email}</span> |
                        <span> Роль: {user.role}</span>
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

                    <div className="slider-container">
                        <label className="slider-label">
                            📊 Максимум карточек: <span className="slider-value">{maxCards}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={maxCards}
                            onChange={(e) => setMaxCards(parseInt(e.target.value))}
                            disabled={loading}
                        />
                    </div>
                </section>

                {message && (
                    <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'warning'}`}>
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
                        {decks.length === 0 && (
                            <div className="empty-state">
                                <p>Нет загруженных PDF файлов</p>
                                <p className="empty-subtitle">Загрузите первый PDF файл, чтобы начать создавать карточки</p>
                            </div>
                        )}
                    </div>
                </section>

                {cards.length > 0 && selectedDeck && (
                    <section className="cards-section">
                        <div className="cards-header">
                            <div>
                                <h2>🎴 Карточки из "{selectedDeck.name}" ({totalCards})</h2>
                            </div>
                            <button
                                onClick={handleClearCardsClick}
                                className="clear-cards-btn"
                                disabled={loading}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {/* Глаз */}
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    {/* Зрачок */}
                                    <circle cx="12" cy="12" r="3" />
                                    {/* Зачёркивание */}
                                    <line x1="2" y1="2" x2="22" y2="22" />
                                </svg>

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

                {/* Модальное окно для подтверждения удаления колоды */}
                <div className={`modal ${deleteModalOpen ? 'show' : ''}`} style={{ display: deleteModalOpen ? 'flex' : 'none' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Подтверждение удаления</h3>
                            <button className="modal-close" onClick={() => setDeleteModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="1.5">
                                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="modal-text">Вы уверены, что хотите удалить эту колоду?</p>
                            <p className="modal-subtext">Это действие нельзя будет отменить.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn modal-btn-cancel"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="modal-btn modal-btn-delete"
                                onClick={confirmDeleteDeck}
                            >
                                <span className="delete-icon">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                                    </svg>
                                </span>
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>

                {/* Модальное окно для удаления всех карточек */}
                <div className={`modal ${deleteCardsModalOpen ? 'show' : ''}`} style={{ display: deleteCardsModalOpen ? 'flex' : 'none' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Очистить карточки</h3>
                            <button className="modal-close" onClick={() => setDeleteCardsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-icon warning">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fd7e14" strokeWidth="1.5">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.197 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                            </div>
                            <p className="modal-text">Скрыть все карточки?</p>
                            <p className="modal-subtext">Все сгенерированные карточки будут скрыты.</p>
                            <div className="modal-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Всего карточек:</span>
                                    <span id="Total" className="stat-value">{totalCards}</span>
                                </div>
                                {selectedDeck && (
                                    <div className="stat-item">
                                        <span className="stat-label">Текущая колода:</span>
                                        <span id="modalTotalDecks" className="stat-value">{selectedDeck.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn modal-btn-cancel"
                                onClick={() => setDeleteCardsModalOpen(false)}
                            >
                                Отмена
                            </button>
                            <button
                                className="modal-btn modal-btn-delete warning"
                                onClick={confirmClearCards}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {/* Глаз */}
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    {/* Зрачок */}
                                    <circle cx="12" cy="12" r="3"/>
                                    {/* Зачёркивание */}
                                    <line x1="2" y1="2" x2="22" y2="22"/>
                                </svg>
                                Скрыть все
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="app-footer">
                Учебные карточки из PDF • v1.0
            </footer>
        </div>
    );
};

export { DashboardApp };