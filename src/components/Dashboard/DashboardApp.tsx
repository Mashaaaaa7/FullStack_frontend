import React, { useState, useRef, useEffect } from "react";
import { Deck, Card } from "../../types";
import { pdfApi, getErrorMessage, PdfCardsResponse } from "../../api/api";
import { useAuth } from "../../Context/AuthContext";
import "../../App.css";
import { FileList, FileItem } from "./Files/FileList";
import FileUploader from "./Files/FileUploader.tsx";
import DictionaryWidget from "./DictionaryWidget.tsx";

interface DeckWithId extends Deck {
    id: number;
}

export const DashboardApp: React.FC = () => {
    const { user } = useAuth();
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<DeckWithId | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [maxCards, setMaxCards] = useState(10);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [processingFileId, setProcessingFileId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCards, setTotalCards] = useState(0);
    const cardsPerPage = 6;
    const [deleteCardsModalOpen, setDeleteCardsModalOpen] = useState(false);
    const scrollPositionRef = useRef<number>(0);

    const saveScrollPosition = () => {
        scrollPositionRef.current = window.scrollY;
    };

    useEffect(() => {
        if (cards.length > 0 && scrollPositionRef.current > 0) {
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollPositionRef.current);
                scrollPositionRef.current = 0;
            });
        }
    }, [cards]);

    const loadPage = async (fileId: number, page: number) => {
        saveScrollPosition();

        try {
            setLoading(true);
            const skip = (page - 1) * cardsPerPage;
            const response: PdfCardsResponse = await pdfApi.getCards(fileId, skip, cardsPerPage);

            setCards(response.cards);
            setTotalCards(response.total);
            setCurrentPage(page);
            setMessage("");
        } catch (err: unknown) {
            setMessage(`❌ Ошибка загрузки страницы: ${getErrorMessage(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCards = async (deck: DeckWithId) => {
        setProcessingFileId(deck.id);
        setMessage(`🔄 Генерирую карточки (макс. ${maxCards})...`);

        try {
            await pdfApi.processCards(deck.id, maxCards);
            setMessage("✅ Обработка запущена. Карточки появятся через несколько секунд.");

            let attempts = 0;
            const maxAttempts = 30;

            while (attempts < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 2000));

                try {
                    const response: PdfCardsResponse = await pdfApi.getCards(deck.id, 0, 1);

                    if (response.total > 0) {
                        if (selectedDeck?.id === deck.id) {
                            await loadPage(deck.id, currentPage).catch(console.error);
                        }
                        setMessage("✅ Карточки готовы!");
                        break;
                    }
                } catch {
                    console.log("Карточки ещё не готовы...");
                }

                attempts++;
            }

            if (attempts >= maxAttempts) {
                setMessage("⚠️ Обработка заняла больше времени. Обновите страницу позже.");
            }
        } catch (err: unknown) {
            setMessage(`❌ ${getErrorMessage(err)}`);
        } finally {
            setProcessingFileId(null);
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

    const handleSelectFile = (file: FileItem) => {
        setSelectedDeck({ id: file.id, name: file.file_name });
        setSelectedFileId(file.id);
        setCurrentPage(1);
        void loadPage(file.id, 1);
    };

    const handleUploadSuccess = () => {
        setMessage("✅ Файл загружен успешно");
        setRefreshKey((prev) => prev + 1);
    };

    const handleGenerateCards = async (file: FileItem) => {
        const deck: DeckWithId = { id: file.id, name: file.file_name };
        await handleCreateCards(deck);
    };

    const handleViewCards = (file: FileItem) => {
        saveScrollPosition();
        setSelectedDeck({ id: file.id, name: file.file_name });
        setSelectedFileId(file.id);
        setCurrentPage(1);
        void loadPage(file.id, 1);
    };

    const totalPages = Math.ceil(totalCards / cardsPerPage);

    if (!user) return <p>Вы не авторизованы</p>;

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <header className="app-header">
                    <h1>📖 Учебные карточки из PDF</h1>
                    <p>Создавайте карточки для эффективного обучения</p>
                    <div className="header-controls">
                        <span>Пользователь: {user.email}</span> |<span> Роль: {user.role}</span>
                    </div>
                </header>
                <aside className="sidebar">
                    <DictionaryWidget />
                </aside>
            </div>

            <main className="app-main">
                <section className="upload-section">
                    <h2>📤 Загрузите PDF</h2>
                    <FileUploader
                        onUploadSuccess={handleUploadSuccess}
                        maxSizeMB={10}
                        allowedTypes={["application/pdf"]}
                    />
                    <div className="slider-container">
                        <label className="slider-label">
                            📊 Максимум карточек: <span className="slider-value">{maxCards}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={maxCards}
                            onChange={(e) => setMaxCards(Number.parseInt(e.target.value, 10))}
                            disabled={loading}
                        />
                    </div>
                </section>

                {message && (
                    <div
                        className={`message ${
                            message.includes("❌") ? "error" : message.includes("✅") ? "success" : "warning"
                        }`}
                    >
                        {message}
                    </div>
                )}

                <section className="decks-section">
                    <h2>📁 Ваши PDF</h2>
                    <FileList
                        onSelectFile={handleSelectFile}
                        selectedFileId={selectedFileId}
                        refreshTrigger={refreshKey}
                        onGenerateCards={handleGenerateCards}
                        onViewCards={handleViewCards}
                        processingFileId={processingFileId}
                    />
                </section>

                {cards.length > 0 && selectedDeck && (
                    <section className="cards-section">
                        <div className="cards-header">
                            <div>
                                <h2>
                                    🎴 Карточки из &quot;{selectedDeck.name}&quot; ({totalCards})
                                </h2>
                            </div>
                            <button onClick={handleClearCardsClick} className="clear-cards-btn" disabled={loading}>
                                {/* иконка */}
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
                                    onClick={() => loadPage(selectedDeck.id, Math.max(1, currentPage - 1)).catch(console.error)}
                                    disabled={currentPage === 1 || loading}
                                    className="pagination-btn"
                                >
                                    ← Назад
                                </button>
                                <div className="pagination-pages">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => loadPage(selectedDeck.id, page).catch(console.error)}
                                            disabled={loading}
                                            className={`pagination-page ${currentPage === page ? "active" : ""}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() =>
                                        loadPage(selectedDeck.id, Math.min(totalPages, currentPage + 1)).catch(console.error)
                                    }
                                    disabled={currentPage === totalPages || loading}
                                    className="pagination-btn"
                                >
                                    Вперед →
                                </button>
                            </div>
                        )}
                    </section>
                )}

                <div
                    className={`modal ${deleteCardsModalOpen ? "show" : ""}`}
                    style={{ display: deleteCardsModalOpen ? "flex" : "none" }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Очистить карточки</h3>
                            <button className="modal-close" onClick={() => setDeleteCardsModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-icon warning">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fd7e14" strokeWidth="1.5">
                                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.197 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <p className="modal-text">Скрыть все карточки?</p>
                            <p className="modal-subtext">Все сгенерированные карточки будут скрыты.</p>
                            <div className="modal-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Всего карточек:</span>
                                    <span id="Total" className="stat-value">
                                        {totalCards}
                                    </span>
                                </div>
                                {selectedDeck && (
                                    <div className="stat-item">
                                        <span className="stat-label">Текущая колода:</span>
                                        <span id="modalTotalDecks" className="stat-value">
                                            {selectedDeck.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn modal-btn-cancel" onClick={() => setDeleteCardsModalOpen(false)}>
                                Отмена
                            </button>
                            <button className="modal-btn modal-btn-delete warning" onClick={confirmClearCards}>
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
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                    <line x1="2" y1="2" x2="22" y2="22" />
                                </svg>
                                Скрыть все
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="app-footer">Учебные карточки из PDF • v1.0</footer>
        </div>
    );
};