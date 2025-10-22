import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        // Здесь будет логика регистрации
        console.log('Registration attempt:', email, password);

        // После успешной регистрации переходим на главную
        navigate('/');
    };

    return (
        <div className="register-page"> {/* Изменили класс */}
            <div className="register-container"> {/* Изменили класс */}
                <h2>Регистрация</h2>
                <form onSubmit={handleSubmit} className="register-form"> {/* Изменили класс */}
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
                            placeholder="Придумайте пароль"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Подтвердите пароль</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Повторите пароль"
                        />
                    </div>
                    <button type="submit" className="register-button"> {/* Изменили класс */}
                        Зарегистрироваться
                    </button>
                </form>
                <p className="auth-switch">
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className="switch-link">
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;