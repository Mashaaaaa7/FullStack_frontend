import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Card, Deck } from './types';
import { api } from './api';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { useHistoryContext } from './Context/HistoryContext';
import './App.css';

const MainApp: React.FC = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { addHistory } = useHistoryContext();

    // Загрузка списка деков
    const loadDecks = async () => {
        try {
            const response = await api.getDecks();
            if (response.success) {
                setDecks(response.decks);
            }
        } catch (error) {
            setMessage('Ошибка загрузки списка файлов');
        }
    };

    // Загрузка PDF файла
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage('');

        try {
            const result = await api.uploadPDF(file);
            setMessage(result.message);

            if (result.success) {
                addHistory({ action: "Загружен файл", deck: file.name });
                await loadDecks();
            }
        } catch (error) {
            setMessage('Ошибка загрузки файла');
        } finally {
            setLoading(false);
        }
    };

    // Создание карточек
    const handleCreateCards = async (deckName: string) => {
        setLoading(true);
        setMessage('');

        try {
            const result = await api.createCards(deckName);
            if (result.success) {
                setCards(result.cards);
                setSelectedDeck(deckName);
                setMessage(`Создано ${result.total} карточек`);
                addHistory({ action: "Созданы карточки", deck: deckName });
            }
        } catch (error) {
            setMessage('Ошибка создания карточек');
        } finally {
            setLoading(false);
        }
    };

    // Функция удаления файла
    const handleDeleteDeck = async (deckName: string) => {
        if (!window.confirm(`Вы уверены, что хотите удалить файл "${deckName}" и все связанные карточки?`)) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await api.deleteDeck(deckName);
            setMessage(result.message);

            if (result.success) {
                addHistory({ action: "Удален файл", deck: deckName });
                await loadDecks();

                if (selectedDeck === deckName) {
                    setCards([]);
                    setSelectedDeck('');
                }
            }
        } catch (error) {
            setMessage('Ошибка удаления файла');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка при старте
    useEffect(() => {
        loadDecks();
    }, []);

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>🎴 Учебные карточки из PDF</h1>
                        <p>Преобразуйте учебные материалы в карточки для запоминания</p>
                    </div>
                    <nav className="header-nav">
                        <Link to="/" className="nav-link">Главная</Link>
                        <Link to="/profile" className="nav-link">👤 Профиль</Link>
                    </nav>
                </div>
            </header>

            <main className="app-main">
                {/* Секция загрузки */}
                <section className="upload-section">
                    <h2>📤 Загрузите PDF файл</h2>
                    <div className="upload-area">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={loading}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="upload-label">
                            {loading ? 'Загрузка...' : 'Выберите PDF файл'}
                        </label>
                    </div>
                </section>

                {/* Сообщения */}
                {message && (
                    <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                {/* Список деков */}
                <section className="decks-section">
                    <h2>📁 Ваши PDF файлы ({decks.length})</h2>
                    <div className="decks-grid">
                        {decks.map(deck => (
                            <div key={deck.name} className="deck-card">
                                <div className="deck-info">
                                    <h3>{deck.name}</h3>
                                    <p>Размер: {(deck.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    <p>Загружен: {deck.created_at}</p>
                                </div>
                                <div className="deck-actions">
                                    <button
                                        onClick={() => handleCreateCards(deck.name)}
                                        disabled={loading}
                                        className="create-cards-btn"
                                    >
                                        Создать карточки
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDeck(deck.name)}
                                        disabled={loading}
                                        className="delete-btn"
                                        title={`Удалить ${deck.name}`}
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                        {decks.length === 0 && (
                            <div className="empty-state">
                                <p>Пока нет загруженных PDF файлов</p>
                                <p>Загрузите PDF файл, чтобы начать работу</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Карточки */}
                {cards.length > 0 && (
                    <section className="cards-section">
                        <h2>🎴 Карточки из "{selectedDeck}" ({cards.length})</h2>
                        <div className="cards-grid">
                            {cards.map(card => (
                                <div key={card.id} className="flashcard">
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
                <p>Учебные карточки из PDF • Версия 1.0.0</p>
            </footer>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/app" element={<MainApp />} />
            </Routes>
        </Router>
    );
};

export default App;