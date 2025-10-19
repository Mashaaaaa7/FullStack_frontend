import React from "react";
import { Link } from "react-router-dom";
import { useHistoryContext } from "../Context/HistoryContext";

export const HomePage: React.FC = () => {
    const { addHistory } = useHistoryContext();

    const handleAddExample = () => {
        addHistory({ action: "Загружен тестовый файл", deck: "Пример.pdf" });
        alert("Добавлено в историю!");
    };

    return (
        <div className="page-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="header-title">
                        <h1>🎴 Учебные карточки из PDF</h1>
                    </div>
                    <nav className="header-nav">
                        <Link to="/app" className="nav-link">Приложение</Link>
                        <Link to="/profile" className="nav-link">👤 Профиль</Link>
                    </nav>
                </div>
            </header>

            <div className="home-content">
                <section className="hero-section">
                    <h1>Добро пожаловать 🎓</h1>
                    <p className="hero-description">
                        Здесь вы можете загружать PDF и превращать их в карточки для запоминания.
                    </p>
                    <div className="hero-actions">
                        <Link to="/app" className="cta-button">
                            Начать работу
                        </Link>
                        <button onClick={handleAddExample} className="secondary-button">
                            Добавить пример в историю
                        </button>
                    </div>
                </section>

                <section className="features-section">
                    <h2>Возможности приложения</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>📤 Загрузка PDF</h3>
                            <p>Загружайте учебные материалы в формате PDF</p>
                        </div>
                        <div className="feature-card">
                            <h3>🎴 Создание карточек</h3>
                            <p>Автоматическое создание карточек для запоминания</p>
                        </div>
                        <div className="feature-card">
                            <h3>📊 Отслеживание прогресса</h3>
                            <p>История действий и статистика в профиле</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};