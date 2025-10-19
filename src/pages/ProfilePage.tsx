import React from 'react';
import { Link } from 'react-router-dom';
import { useHistoryContext } from '../Context/HistoryContext';

export const ProfilePage: React.FC = () => {
    const { history, clearHistory } = useHistoryContext();

    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ФИКС: Создаем копию массива для реверса, чтобы не мутировать оригинал
    const sortedHistory = [...history].reverse();

    return (
        <div className="page-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>👤 Профиль пользователя</h1>
                    </div>
                    <nav className="header-nav">
                        <Link to="/" className="nav-link">Главная</Link>
                        <Link to="/app" className="nav-link">Приложение</Link>
                    </nav>
                </div>
            </header>

            <div className="profile-content">
                <section className="profile-section">
                    <div className="section-header">
                        <h2>История действий ({history.length})</h2>
                        {history.length > 0 && (
                            <button onClick={clearHistory} className="clear-history-btn">
                                Очистить историю
                            </button>
                        )}
                    </div>

                    <div className="history-list">
                        {history.length === 0 ? (
                            <div className="empty-history">
                                <p>История действий пуста</p>
                                <p>Начните работать с приложением, чтобы увидеть историю здесь</p>
                            </div>
                        ) : (
                            sortedHistory.map((item, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-main">
                                        <div className="history-action">{item.action}</div>
                                        <div className="history-deck">Файл: {item.deck}</div>
                                    </div>
                                    <div className="history-time">
                                        {formatTimestamp(item.timestamp)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="profile-section">
                    <h2>Статистика</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Всего действий</h3>
                            <p className="stat-number">{history.length}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Загружено файлов</h3>
                            <p className="stat-number">
                                {history.filter(item => item.action.includes('Загружен')).length}
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Создано карточек</h3>
                            <p className="stat-number">
                                {history.filter(item => item.action.includes('Созданы')).length}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};