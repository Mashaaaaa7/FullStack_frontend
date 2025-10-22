import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryItem } from '../types';
import { api } from '../api';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [stats, setStats] = useState({
        totalActions: 0,
        filesUploaded: 0,
        cardsCreated: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    // Загрузка истории и статистики
    const loadHistory = async () => {
        setLoading(true);
        setError('');

        try {
            console.log('Loading history...');
            const response = await api.getHistory();
            console.log('History response:', response);

            if (response.success) {
                setHistory(response.history);

                // Расчет статистики
                const filesUploaded = response.history.filter(item => item.type === 'upload').length;
                const cardsCreated = response.history
                    .filter(item => item.type === 'create_cards')
                    .reduce((total, item) => total + (item.cards_count || 0), 0);

                setStats({
                    totalActions: response.history.length,
                    filesUploaded,
                    cardsCreated
                });
            } else {
                setError('Не удалось загрузить историю');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            setError('Ошибка загрузки истории');
            // Для демо создаем тестовые данные
            setHistory([
                {
                    id: '1',
                    type: 'upload',
                    deck_name: 'example.pdf',
                    timestamp: new Date().toLocaleString('ru-RU'),
                    file_size: 2048576
                },
                {
                    id: '2',
                    type: 'create_cards',
                    deck_name: 'example.pdf',
                    timestamp: new Date().toLocaleString('ru-RU'),
                    cards_count: 5
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // Функция для форматирования размера файла
    const formatFileSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    // Функция для получения иконки типа действия
    const getActionIcon = (type: string) => {
        switch (type) {
            case 'upload': return '📤';
            case 'create_cards': return '🎴';
            default: return '📝';
        }
    };

    // Функция для получения текста действия
    const getActionText = (item: HistoryItem) => {
        switch (item.type) {
            case 'upload':
                return `Загружен файл ${item.deck_name} (${formatFileSize(item.file_size || 0)})`;
            case 'create_cards':
                return `Создано ${item.cards_count} карточек из ${item.deck_name}`;
            default:
                return `Действие с ${item.deck_name}`;
        }
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>Профиль</h1>
                <nav className="profile-nav">
                    <div style={{ marginRight: '20px' }}>
                        <button
                            className="nav-button"
                            onClick={() => navigate('/app')}
                        >
                            Приложение
                        </button>
                    </div>
                    <div>
                        <button
                            className="nav-button"
                            onClick={() => navigate('/')}
                        >
                            Главная
                        </button>
                    </div>
                </nav>
            </header>

            <div className="profile-content">
                {/* История действий */}
                <section className="history-section">
                    <h2>История действий ({history.length})</h2>

                    {loading && <p>Загрузка истории...</p>}
                    {error && <div className="error-message">{error}</div>}

                    <div className="history-list">
                        {history.length > 0 ? (
                            history.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="history-icon">
                                        {getActionIcon(item.type)}
                                    </div>
                                    <div className="history-content">
                                        <p className="history-text">{getActionText(item)}</p>
                                        <p className="history-time">{item.timestamp}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-history">
                                <p>История действий пуста</p>
                                <p>Начните работать с приложением, чтобы увидеть историю здесь</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Статистика */}
                <section className="stats-section">
                    <h2>Статистика</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Всего действий</h3>
                            <div className="stat-number">{stats.totalActions}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Загружено файлов</h3>
                            <div className="stat-number">{stats.filesUploaded}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Создано карточек</h3>
                            <div className="stat-number">{stats.cardsCreated}</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;