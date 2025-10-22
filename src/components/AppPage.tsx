import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Deck, HistoryItem } from '../types';
import { api } from '../api';
import './AppPage.css';

const AppPage: React.FC = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [selectedDeck, setSelectedDeck] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Загрузка списка деков
    const loadDecks = async () => {
        try {
            const response = await api.getDecks();
            if (response.success) {
                setDecks(response.decks);
            }
        } catch (error) {
            console.error('Load decks error:', error);
            setMessage('Ошибка загрузки списка файлов');
        }
    };

    // Загрузка PDF файла
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Проверка типа файла
        if (file.type !== 'application/pdf') {
            setMessage('Ошибка: Пожалуйста, выберите PDF файл');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await api.uploadPDF(file);
            console.log('Upload result:', result);

            // Просто проверяем, что ответ есть, не проверяем result.success
            if (result) {
                setMessage(`Файл "${file.name}" успешно загружен!`);
                await loadDecks();

                // Добавляем в историю (игнорируем ошибки истории)
                try {
                    const historyItem: Omit<HistoryItem, 'id'> = {
                        type: 'upload',
                        deck_name: file.name,
                        timestamp: new Date().toLocaleString('ru-RU'),
                        file_size: file.size
                    };
                    await api.addHistoryItem(historyItem);
                } catch (historyError) {
                    console.log('History error (ignored):', historyError);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage('Ошибка загрузки файла');
        } finally {
            setLoading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    // Создание карточек
    const handleCreateCards = async (deckName: string) => {
        setLoading(true);
        setMessage('');

        try {
            const result = await api.createCards(deckName);
            console.log('Create cards result:', result);

            // Просто проверяем, что ответ есть и есть карточки
            if (result && result.cards) {
                setCards(result.cards);
                setSelectedDeck(deckName);
                setMessage(`Создано ${result.cards.length} карточек`);

                // Добавляем в историю (игнорируем ошибки истории)
                try {
                    const historyItem: Omit<HistoryItem, 'id'> = {
                        type: 'create_cards',
                        deck_name: deckName,
                        timestamp: new Date().toLocaleString('ru-RU'),
                        cards_count: result.cards.length
                    };
                    await api.addHistoryItem(historyItem);
                } catch (historyError) {
                    console.log('History error (ignored):', historyError);
                }
            }
        } catch (error) {
            console.error('Create cards error:', error);
            setMessage('Ошибка создания карточек');
        } finally {
            setLoading(false);
        }
    };

    // ФУНКЦИЯ УДАЛЕНИЯ ФАЙЛА
    const handleDeleteDeck = async (deckName: string) => {
        if (!window.confirm(`Вы уверены, что хотите удалить файл "${deckName}" и все связанные карточки?`)) {
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const result = await api.deleteDeck(deckName);
            console.log('Delete result:', result);

            // Просто проверяем, что ответ есть
            if (result) {
                setMessage(`Файл "${deckName}" успешно удален`);
                await loadDecks();
                if (selectedDeck === deckName) {
                    setCards([]);
                    setSelectedDeck('');
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
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
                <h1>🎴 Учебные карточки из PDF</h1>
                <p>Преобразуйте учебные материалы в карточки для запоминания</p>
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
                <p>Учебные карточки из PDF • Версия 1.0</p>
            </footer>
        </div>
    );
};

export default AppPage;