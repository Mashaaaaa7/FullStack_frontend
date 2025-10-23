import React from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = api.getCurrentUser();

    const handleLogout = () => {
        api.logout();
        navigate('/');
        window.location.reload(); // Перезагружаем для обновления состояния
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <h1>Добро пожаловать 🎓</h1>
                <p>Здесь вы можете загружать PDF и превращать их в карточки для запоминания.</p>

                {/* Статус авторизации */}
                {currentUser ? (
                    <div className="user-info">
                        <p>Вы вошли как: <strong>{currentUser.email}</strong></p>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Выйти
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <button
                            className="auth-btn login-btn"
                            onClick={() => navigate('/login')}
                        >
                            Войти
                        </button>
                        <button
                            className="auth-btn register-btn"
                            onClick={() => navigate('/register')}
                        >
                            Зарегистрироваться
                        </button>
                    </div>
                )}

                <div className="landing-buttons">
                    <button
                        className="primary-button"
                        onClick={() => navigate('/app')}
                    >
                        Начать работу
                    </button>
                    <button
                        className="secondary-button"
                        onClick={() => navigate('/profile')}
                    >
                        Мой профиль
                    </button>
                </div>
            </header>

            <section className="features">
                <h2>Возможности приложения</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📤</div>
                        <h3>Загрузка PDF</h3>
                        <p>Загружайте учебные материалы в формате PDF</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎴</div>
                        <h3>Создание карточек</h3>
                        <p>Автоматическое создание карточек для запоминания</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Отслеживание прогресса</h3>
                        <p>История действий и статистика в профиле</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔐</div>
                        <h3>Безопасность</h3>
                        <p>Ваши данные защищены и хранятся безопасно</p>
                    </div>
                </div>
            </section>

            <nav className="navigation">
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
                        onClick={() => navigate('/profile')}
                    >
                        Профиль
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default LandingPage;