import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { api } from '../../api/api';
import { ActionHistory } from '../../types';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadHistory();
    }, [user?.email]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const historyRes = await api.actionHistory();

            if (historyRes.success && Array.isArray(historyRes.history)) {
                setActionHistory(historyRes.history);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage('⚠️ Ошибка загрузки истории');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const removeHistoryEntry = (id: number | undefined) => {
        setActionHistory(prev => prev.filter(entry => entry.id !== id));
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Загрузка...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>👤 Профиль</h1>
            </header>

            {message && <div className="message error">{message}</div>}

            <div className="profile-content">
                <section className="profile-info">
                    <h2>Личная информация</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{user?.email}</span>
                        </div>
                    </div>
                </section>

                <section className="action-history">
                    <h2>📊 История действий ({actionHistory.length})</h2>
                    {actionHistory.length === 0 ? (
                        <div className="empty-state">
                            <p>История пуста</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {actionHistory.map((action, index) => (
                                <div key={action.id || index} className="history-item">
                                    <div className="history-item-content">
                                        <div className="history-item-header">
                                            <span className="action-type">
                                                {action.action === 'upload' && '⬆️'}
                                                {action.action === 'delete' && '🗑️'}
                                                {action.action === 'process' && '⚙️'}
                                                {action.action === 'generate' && '✨'}
                                                {' '}
                                                <strong>{action.action.toUpperCase()}</strong>
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                                {formatDate(action.timestamp)}
                                            </span>
                                        </div>
                                        <div className="history-item-body">
                                            <p>{action.details}</p>
                                            {action.filename && (
                                                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                                    📄 {action.filename}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeHistoryEntry(action.id)}
                                        className="delete-history-btn"
                                        aria-label="Удалить запись"
                                    >
                                        🗑️ Удалить
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};