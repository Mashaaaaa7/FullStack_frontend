import React, { useState, useEffect } from 'react';
import { Deck, Card } from '../../types';
import { api } from '../../api/api';
import { useAuth } from '../../Context/AuthContext';
import '../../App.css';

const DashboardApp: React.FC = () => {
    const { user } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedCards = localStorage.getItem('savedCards');
        const savedSelectedDeck = localStorage.getItem('selectedDeck');

        if (savedCards && savedSelectedDeck) {
            try {
                setCards(JSON.parse(savedCards));
                setSelectedDeck(savedSelectedDeck);
            } catch (error) {
                console.error('Error loading saved cards:', error);
            }
        }

        loadDecks();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && selectedDeck) {
            localStorage.setItem('savedCards', JSON.stringify(cards));
            localStorage.setItem('selectedDeck', selectedDeck);
        }
    }, [cards, selectedDeck]);

    const loadDecks = async () => {
        try {
            const saved = localStorage.getItem('uploadedFiles') || '[]';
            const files = JSON.parse(saved);
            setDecks(files);
        } catch (error) {
            console.error('Load decks error:', error);
            setDecks([]);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage('');

        try {
            const res = await api.uploadPDF(file);

            const newFile = {
                id: res.file_id || Date.now(),
                name: res.filename || file.name,
                file_size: file.size,
                created_at: new Date().toISOString()
            };

            const saved = localStorage.getItem('uploadedFiles') || '[]';
            const files = JSON.parse(saved);
            files.push(newFile);
            localStorage.setItem('uploadedFiles', JSON.stringify(files));

            setDecks(files);  // ✅ ОБНОВИТЬ UI
            setMessage('✅ ' + res.message);
            e.target.value = '';
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCards = async (deckName: string) => {
        setLoading(true);
        setMessage('');

        try {
            const res = await api.createCards(deckName);
            if (res.success && res.cards) {
                setCards(res.cards);
                setSelectedDeck(deckName);
                setMessage(`✅ Загружено ${res.cards.length} карточек`);
            } else {
                setMessage('❌ Ошибка при загрузке карточек');
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDeck = async (deckName: string) => {
        if (!window.confirm(`Удалить ${deckName}?`)) return;

        setLoading(true);

        try {
            // ✅ Удалить из localStorage
            const saved = localStorage.getItem('uploadedFiles') || '[]';
            let files = JSON.parse(saved);
            files = files.filter((f: Deck) => f.name !== deckName);
            localStorage.setItem('uploadedFiles', JSON.stringify(files));

            setMessage('✅ Файл удален');

            await loadDecks(); // ✅ Перезагрузить список

            if (selectedDeck === deckName) {
                setCards([]);
                setSelectedDeck('');
                localStorage.removeItem('savedCards');
                localStorage.removeItem('selectedDeck');
            }
        } catch (err: any) {
            setMessage(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleClearCards = () => {
        setCards([]);
        setSelectedDeck('');
        localStorage.removeItem('savedCards');
        localStorage.removeItem('selectedDeck');
        setMessage('Карточки очищены');
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>🎴 Учебные карточки из PDF</h1>
                <div className="header-controls">
                    <p>Пользователь: {user?.email}</p>
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
                </section>

                {message && (
                    <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <section className="decks-section">
                    <h2>📁 PDF файлы ({decks.length})</h2>
                    <div className="decks-grid">
                        {decks.map(deck => (
                            <div key={deck.name} className="deck-card">
                                <div className="deck-info">
                                    <h3>{deck.name}</h3>
                                    <p>Размер: {(deck.file_size/1024/1024).toFixed(2)} MB</p>
                                    <p>Загружен: {new Date(deck.created_at).toLocaleString('ru-RU')}</p>
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
                                    >
                                        🗑️ Удалить
                                    </button>
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

                {cards.length > 0 && (
                    <section className="cards-section">
                        <div className="cards-header">
                            <h2>🎴 Карточки из "{selectedDeck}" ({cards.length})</h2>
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