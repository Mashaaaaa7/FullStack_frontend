import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { api } from '../../api/api';
import { ActionHistory } from '../../types';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

interface ChangePasswordForm {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

interface ChangeEmailForm {
    new_email: string;
    password: string;
}

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const [actionHistory, setActionHistory] = useState<ActionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const navigate = useNavigate(); // Хук для перенаправления

    // Состояние для смены пароля
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordErrors, setPasswordErrors] = useState<Partial<ChangePasswordForm>>({});
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Состояние для смены email
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [emailForm, setEmailForm] = useState<ChangeEmailForm>({
        new_email: '',
        password: ''
    });
    const [emailErrors, setEmailErrors] = useState<Partial<ChangeEmailForm>>({});
    const [emailLoading, setEmailLoading] = useState(false);

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
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const validatePasswordForm = (): boolean => {
        const errors: Partial<ChangePasswordForm> = {};

        if (!passwordForm.current_password) {
            errors.current_password = 'Введите текущий пароль';
        }

        if (!passwordForm.new_password) {
            errors.new_password = 'Введите новый пароль';
        } else if (passwordForm.new_password.length < 8) {
            errors.new_password = 'Пароль должен быть минимум 8 символов';
        } else if (passwordForm.new_password.length > 100) {
            errors.new_password = 'Пароль слишком длинный';
        }

        if (!passwordForm.confirm_password) {
            errors.confirm_password = 'Подтвердите пароль';
        } else if (passwordForm.new_password !== passwordForm.confirm_password) {
            errors.confirm_password = 'Пароли не совпадают';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) return;

        try {
            setPasswordLoading(true);
            // Используем ваш существующий fetch запрос
            const response = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password,
                    confirm_password: passwordForm.confirm_password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Успех! Данные обновлены.
                setMessage('✅ Пароль успешно изменён. Пожалуйста, войдите снова.');
                setMessageType('success');

                // Даем пользователю прочитать сообщение 1.5 секунды и выкидываем
                setTimeout(() => {
                    logout(); // Чистим токен и состояние пользователя
                    navigate('/login'); // Редирект на логин
                }, 1500);

            } else {
                setMessage(`❌ ${data.detail || 'Ошибка при смене пароля'}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage('❌ Ошибка при смене пароля');
            setMessageType('error');
        } finally {
            setPasswordLoading(false);
        }
    };

    // ===== ВАЛИДАЦИЯ EMAIL =====
    const validateEmailForm = (): boolean => {
        const errors: Partial<ChangeEmailForm> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailForm.new_email) {
            errors.new_email = 'Введите новый email';
        } else if (!emailRegex.test(emailForm.new_email)) {
            errors.new_email = 'Некорректный email';
        } else if (emailForm.new_email === user?.email) {
            errors.new_email = 'Email совпадает с текущим';
        }

        if (!emailForm.password) {
            errors.password = 'Введите пароль для подтверждения';
        }

        setEmailErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ===== СМЕНА EMAIL =====
    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmailForm()) return;

        try {
            setEmailLoading(true);
            const response = await fetch('/api/profile/change-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    new_email: emailForm.new_email,
                    password: emailForm.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Успех!
                setMessage('✅ Email успешно изменён. Пожалуйста, войдите снова.');
                setMessageType('success');

                // Также выкидываем пользователя, так как старый email (логин) больше невалиден
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 1500);

            } else {
                setMessage(`❌ ${data.detail || 'Ошибка при смене email'}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setMessage('❌ Ошибка при смене email');
            setMessageType('error');
        } finally {
            setEmailLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    if (loading) {
        return <div className="profile-container"><div className="loading">Загрузка...</div></div>;
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>👤 Профиль</h1>
            </header>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                    <button
                        className="message-close"
                        onClick={() => setMessage('')}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="profile-content">
                {/* ===== ЛИЧНАЯ ИНФОРМАЦИЯ ===== */}
                <section className="profile-info">
                    <h2>Личная информация</h2>
                    <div className="info-grid">
                        {/* Email */}
                        <div className="info-item">
                            <label>Email:</label>
                            <div className="info-display">
                                <span>{user?.email}</span>
                                <button
                                    className="edit-btn"
                                    onClick={() => setShowEmailForm(!showEmailForm)}
                                    title="Изменить email"
                                >
                                    ✏️
                                </button>
                            </div>
                        </div>

                        {/* Форма смены email */}
                        {showEmailForm && (
                            <div className="edit-form email-form">
                                <h3>Изменить Email</h3>
                                <form onSubmit={handleChangeEmail}>
                                    <div className="form-group">
                                        <label htmlFor="new-email">Новый Email:</label>
                                        <input
                                            id="new-email"
                                            type="email"
                                            className="form-input"
                                            value={emailForm.new_email}
                                            onChange={(e) =>
                                                setEmailForm({
                                                    ...emailForm,
                                                    new_email: e.target.value
                                                })
                                            }
                                            placeholder="example@domain.com"
                                        />
                                        {emailErrors.new_email && (
                                            <span className="error-text">
                                                {emailErrors.new_email}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email-password">
                                            Пароль (для подтверждения):
                                        </label>
                                        <input
                                            id="email-password"
                                            type="password"
                                            className="form-input"
                                            value={emailForm.password}
                                            onChange={(e) =>
                                                setEmailForm({
                                                    ...emailForm,
                                                    password: e.target.value
                                                })
                                            }
                                            placeholder="Введите пароль"
                                        />
                                        {emailErrors.password && (
                                            <span className="error-text">
                                                {emailErrors.password}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={emailLoading}
                                        >
                                            {emailLoading ? 'Обновляю...' : 'Обновить Email'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => {
                                                setShowEmailForm(false);
                                                setEmailForm({
                                                    new_email: '',
                                                    password: ''
                                                });
                                                setEmailErrors({});
                                            }}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Пароль */}
                        <div className="info-item">
                            <label>Пароль:</label>
                            <div className="info-display">
                                <span>••••••••</span>
                                <button
                                    className="edit-btn"
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    title="Изменить пароль"
                                >
                                    ✏️
                                </button>
                            </div>
                        </div>

                        {/* Форма смены пароля */}
                        {showPasswordForm && (
                            <div className="edit-form password-form">
                                <h3>Изменить Пароль</h3>
                                <form onSubmit={handleChangePassword}>
                                    <div className="form-group">
                                        <label htmlFor="current-password">
                                            Текущий пароль:
                                        </label>
                                        <input
                                            id="current-password"
                                            type="password"
                                            className="form-input"
                                            value={passwordForm.current_password}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    current_password: e.target.value
                                                })
                                            }
                                            placeholder="Введите текущий пароль"
                                        />
                                        {passwordErrors.current_password && (
                                            <span className="error-text">
                                                {passwordErrors.current_password}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="new-password">Новый пароль:</label>
                                        <input
                                            id="new-password"
                                            type="password"
                                            className="form-input"
                                            value={passwordForm.new_password}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    new_password: e.target.value
                                                })
                                            }
                                            placeholder="Минимум 8 символов"
                                        />
                                        {passwordErrors.new_password && (
                                            <span className="error-text">
                                                {passwordErrors.new_password}
                                            </span>
                                        )}
                                        <div className="password-hints">
                                            <small>
                                                ✓ Минимум 8 символов
                                            </small>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirm-password">
                                            Подтверждение пароля:
                                        </label>
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            className="form-input"
                                            value={passwordForm.confirm_password}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    confirm_password: e.target.value
                                                })
                                            }
                                            placeholder="Повторите пароль"
                                        />
                                        {passwordErrors.confirm_password && (
                                            <span className="error-text">
                                                {passwordErrors.confirm_password}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                            disabled={passwordLoading}
                                        >
                                            {passwordLoading ? 'Обновляю...' : 'Обновить Пароль'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordForm({
                                                    current_password: '',
                                                    new_password: '',
                                                    confirm_password: ''
                                                });
                                                setPasswordErrors({});
                                            }}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </section>

                {/* ===== ИСТОРИЯ ДЕЙСТВИЙ ===== */}
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
                                    <span className="action-type">
                                        {action.action === 'upload' && '⬆️'}
                                        {action.action === 'delete' && '🗑️'}
                                        {action.action === 'process' && '⚙️'}
                                        {action.action === 'change_password' && '🔐'}
                                        {action.action === 'change_email' && '✉️'}
                                        {' '}{action.action.toUpperCase()}
                                    </span>
                                    <span>{action.details}</span>
                                    {action.filename && <span>📄 {action.filename}</span>}
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                        {formatDate(action.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};