import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="about-page">
            <Helmet>
                <title>О проекте | Карточки из PDF</title>
                <meta name="description" content="Превратите PDF в учебные карточки. Учитесь эффективно." />
                <link rel="canonical" href="http://localhost:3000/about" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Карточки из PDF",
                        "url": "http://localhost:3000",
                        "description": "Создавайте учебные карточки из PDF-файлов",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "http://localhost:3000/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    })}
                </script>
            </Helmet>
            <main>
                <h1>О проекте</h1>
                <p>Приложение позволяет загружать PDF-документы и создавать из них учебные карточки.</p>
                <p>Используйте встроенный словарь, чтобы быстро узнавать значения английских слов.</p>
                <Link to="/" className="back-link">← На главную</Link>
            </main>
        </div>
    );
}