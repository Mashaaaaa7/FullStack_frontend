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
    const [editingEmail, setEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            setLoading(true);

            // История теперь сохраняется между перезагрузками
            const historyRes = await api.actionHistory();
            if (historyRes.success) {
                setActionHistory(historyRes.history || []);
            }

            const mockProfile = createMockProfile();
            setProfile(mockProfile);

        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage('Ошибка загрузки профиля');

            const mockProfile = createMockProfile();
            setProfile(mockProfile);
            setActionHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const createMockProfile = (): UserProfile => {
        let lastLoginDate = localStorage.getItem('user_last_login');
        const now = new Date().toISOString();

        if (!lastLoginDate) {
            lastLoginDate = now;
        }

        localStorage.setItem('user_last_login', now);

        return {
            created_at: "",
            id: 1,
            email: user?.email || 'unknown@email.com',
            last_login: lastLoginDate
        };
    };

    const handleUpdateEmail = async () => {
        if (!newEmail || newEmail === profile?.email) {
            setEditingEmail(false);
            return;
        }

        try {
            setMessage('Email успешно обновлен');
            setProfile(prev => prev ? { ...prev, email: newEmail } : null);
            setEditingEmail(false);
            localStorage.setItem('user_email', newEmail);
        } catch (error) {
            console.error('Error updating email:', error);
            setMessage('Ошибка обновления email');
        }
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
                            <label>ID пользователя:</label>
                            <span>{profile?.id || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            {editingEmail ? (
                                <div className="email-edit">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="email-input"
                                        placeholder="Введите новый email"
                                    />
                                    <button onClick={handleUpdateEmail} className="save-btn" title="Сохранить">
                                        💾
                                    </button>
                                    <button onClick={() => {
                                        setEditingEmail(false);
                                        setNewEmail(profile?.email || '');
                                    }} className="cancel-btn" title="Отмена">
                                        ❌
                                    </button>
                                </div>
                            ) : (
                                <div className="email-display">
                                    <span>{profile?.email}</span>
                                    <button
                                        onClick={() => {
                                            setEditingEmail(true);
                                            setNewEmail(profile?.email || '');
                                        }}
                                        className="edit-btn"
                                        title="Редактировать email"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="info-item">
                            <label>Последний вход:</label>
                            <span>{profile?.last_login ? formatDate(profile.last_login) : 'N/A'}</span>
                        </div>
                    </div>
                </section>

                <section className="action-history">
                    <h2>📊 История действий</h2>
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
                                        <span className="action-type">{action.action}</span>
                                        <span className="action-date">
                                            {formatDate(action.timestamp)}
                                        </span>
                                    </div>
                                    <div className="action-description">
                                        {action.details}
                                    </div>
                                    {action.filename && (
                                        <div className="action-meta">
                                            Файл: {action.filename}
                                        </div>
                                    )}
                                    {action.deck_name && (
                                        <div className="action-meta">
                                            Колода: {action.deck_name}
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