import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {useAuth} from "../../Context/AuthContext.tsx";

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 1️⃣ Логинимся и получаем access и refresh токены
            const res = await fetch('http://127.0.0.1:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(data.detail || '❌ Ошибка входа');
                return;
            }

            const accessToken = data.access_token;
            const refreshToken = data.refresh_token;

            // 2️⃣ Получаем актуальные данные пользователя
            const meRes = await fetch('http://127.0.0.1:8000/api/auth/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!meRes.ok) throw new Error('Не удалось получить данные пользователя');
            const meData = await meRes.json();

            const currentUser = {
                id: meData.user_id,
                email: meData.email,
                role: meData.role,
                token: accessToken,
            };

            // 3️⃣ Логиним пользователя в контекст
            login(currentUser, refreshToken);

            // 4️⃣ Переходим на Dashboard
            navigate('/app');

        } catch (err: any) {
            setMessage(err.message || '❌ Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h2>Вход</h2>
                {message && <div className="message error">{message}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Введите ваш email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Введите ваш пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                <div className="auth-switch">
                    <p>
                        Нет аккаунта?{' '}
                        <Link to="/register" className="link">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
