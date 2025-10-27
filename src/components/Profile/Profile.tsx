import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { api } from '../../api/api';
import { UserProfile, ActionHistory } from '../../types';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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

            // Загружаем историю действий
            const historyRes = await api.actionHistory();
            if (historyRes.success) {
                setActionHistory(historyRes.history || []);
            }

            // Создаем mock профиль на основе данных из контекста
            const mockProfile: UserProfile = {
                id: 1,
                email: user?.email || 'unknown@email.com',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            setProfile(mockProfile);

        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage('Ошибка загрузки профиля');

            // Fallback: создаем mock данные при ошибке
            const mockProfile: UserProfile = {
                id: 1,
                email: user?.email || 'unknown@email.com',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            setProfile(mockProfile);
            setActionHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail || newEmail === profile?.email) {
            setEditingEmail(false);
            return;
        }

        try {
            // Mock обновление email
            setMessage('Email успешно обновлен');
            setProfile(prev => prev ? { ...prev, email: newEmail } : null);
            setEditingEmail(false);
            localStorage.setItem('email', newEmail);
        } catch (error) {
            console.error('Error updating email:', error);
            setMessage('Ошибка обновления email');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/app');
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
                {/* Информация о пользователе */}
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
                            <label>Дата регистрации:</label>
                            <span>{profile ? formatDate(profile.created_at) : 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <label>Последний вход:</label>
                            <span>{profile?.last_login ? formatDate(profile.last_login) : 'N/A'}</span>
                        </div>
                    </div>
                </section>

                {/* История действий */}
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