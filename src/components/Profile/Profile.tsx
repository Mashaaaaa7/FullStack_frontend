import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { api } from '../../api/api';
import { UserProfile, ActionHistory } from '../../types';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfileData();
    }, [user?.email]);

    const loadProfileData = async () => {
        try {
            setLoading(true);

            // ✅ Загрузить историю из БД (не из localStorage)
            const historyRes = await api.actionHistory();
            if (historyRes.success && historyRes.history) {
                setActionHistory(historyRes.history);
            } else {
                setActionHistory([]);
            }

            // Создать профиль из текущего пользователя
            const userProfile = createProfile();
            setProfile(userProfile);

        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage('⚠️ Ошибка загрузки профиля');

            // Создать профиль даже при ошибке
            const userProfile = createProfile();
            setProfile(userProfile);
            setActionHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const createProfile = (): UserProfile => {
        return {
            email: user?.email || 'unknown@email.com',
            created_at: new Date().toISOString()
        };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading">Загрузка профиля...</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>👤 Профиль пользователя</h1>
            </header>

            {message && (
                <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="profile-content">
                <section className="profile-info">
                    <h2>Личная информация</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{profile?.email}</span>
                        </div>
                        {profile?.created_at && (
                            <div className="info-item">
                                <label>Дата регистрации:</label>
                                <span>{formatDate(profile.created_at)}</span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="action-history">
                    <h2>📊 История действий ({actionHistory.length})</h2>
                    {actionHistory.length === 0 ? (
                        <div className="empty-state">
                            <p>История действий пуста</p>
                            <p className="empty-subtitle">Здесь будут отображаться ваши действия с карточками</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {actionHistory.map((action, index) => (
                                <div key={action.id || index} className="history-item">
                                    <div className="action-main">
                                        <span className="action-type">
                                            {action.action === 'upload' && '⬆️'}
                                            {action.action === 'view' && '👁️'}
                                            {action.action === 'delete' && '🗑️'}
                                            {' '}{action.action.toUpperCase()}
                                        </span>
                                        <span className="action-date">
                                            {formatDate(action.timestamp)}
                                        </span>
                                    </div>
                                    <div className="action-description">
                                        {action.details}
                                    </div>
                                    {action.filename && (
                                        <div className="action-meta">
                                            📄 {action.filename}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};