import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Здесь будет логика авторизации
        console.log('Login attempt:', email, password);

        // После успешной авторизации переходим на главную
        navigate('/');
    };

    return (
        <div className="login-page"> {/* Изменили класс */}
            <div className="login-container"> {/* Изменили класс */}
                <h2>Вход в аккаунт</h2>
                <form onSubmit={handleSubmit} className="login-form"> {/* Изменили класс */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Введите ваш email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Введите ваш пароль"
                        />
                    </div>
                    <button type="submit" className="login-button"> {/* Изменили класс */}
                        Войти
                    </button>
                </form>
                <p className="auth-switch">
                    Нет аккаунта?{' '}
                    <Link to="/register" className="switch-link">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;