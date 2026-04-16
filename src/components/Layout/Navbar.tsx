import React from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Navbar.css';

export const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // твоя функция из AuthContext
        navigate('/login', { replace: true });
    };


    if (!user) {
        return null;
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/app">🎴 Учебные карточки</Link>
            </div>
            <div className="navbar-menu">
                <Link
                    to="/app"
                    className={`navbar-item ${location.pathname === '/app' ? 'active' : ''}`}
                >
                    📁 Карточки
                </Link>
                <Link
                    to="/profile"
                    className={`navbar-item ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                    👤 Профиль
                </Link>

                {/* Кнопка для админа */}
                {user.role === 'admin' && (
                    <Link
                        to="/admin"
                        className={`navbar-item ${location.pathname === '/admin' ? 'active' : ''}`}
                    >
                        ⚙️ Админ
                    </Link>
                )}

                <button onClick={handleLogout} className="navbar-logout">Выйти</button>

            </div>
        </nav>
    );
};