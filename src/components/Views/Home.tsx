import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="landing-page">
            <Helmet>
                <title>Карточки из PDF | Создавайте учебные карточки</title>
                <meta name="description" content="Превратите PDF в удобные учебные карточки." />
                <link rel="canonical" href="http://localhost:3000/" />
            </Helmet>
            <main>
                <h1>Создавайте учебные карточки из PDF</h1>
                <section>
                    <h2>Как это работает</h2>
                    <p>1. Загрузите PDF-файл с лекцией или учебником.</p>
                    <p>2. Система автоматически извлечёт ключевые термины и сформирует карточки.</p>
                    <p>3. Учитесь с помощью удобного интерфейса.</p>
                </section>
                <div className="cta-buttons">
                    <Link to="/register">Зарегистрироваться</Link>
                    <Link to="/login">Войти</Link>
                    <Link to="/about" className="about-btn">О проекте</Link>
                </div>
            </main>
        </div>
    );
}