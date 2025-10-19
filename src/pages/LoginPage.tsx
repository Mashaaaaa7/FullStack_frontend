import React from 'react';
import { Link } from 'react-router-dom';
import { useHistoryContext } from '../Context/HistoryContext';

export const LoginPage: React.FC = () => {
    const { history, clearHistory } = useHistoryContext();

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
                    <h2>История действий</h2>
                    <button onClick={clearHistory} className="clear-history-btn">
                        Очистить историю
                    </button>

                    <div className="history-list">
                        {history.length === 0 ? (
                            <p className="empty-history">История действий пуста</p>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-action">{item.action}</div>
                                    <div className="history-deck">{item.deck}</div>
                                    <div className="history-time">
                                        {item.timestamp?.toLocaleString('ru-RU')}
                                    </div>
                                </div>
                            )).reverse()
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