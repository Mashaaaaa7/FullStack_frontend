import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { api } from '../../api/api';

type MeResponse = {
    id: number;
    email: string;
    role: 'user' | 'admin';
};

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
            // 1️⃣ Логин — получаем токен
            const { access_token } = await api.login(email, password);

            // 2️⃣ Запрашиваем данные пользователя
            const me: MeResponse = await api.getMe(access_token);

            // 3️⃣ Передаем данные в контекст
            login(access_token, {
                id: me.id,
                email: me.email,
                role: me.role,
                token: access_token
            });

            // 4️⃣ Редирект на Dashboard
            navigate('/app', { replace: true });

        } catch {
            setMessage('❌ Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h2>Вход в систему</h2>
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
                        Нет аккаунта? <Link to="/register" className="link">
                        Зарегистрироваться
                    </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};