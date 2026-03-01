import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../../Context/AuthContext";
import { authApi } from "../../api/api";

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
            // Логин – получаем access token
            const data = await authApi.login(email, password);
            const accessToken = data.access_token;
            localStorage.setItem('access_token', accessToken);
            const meData = await authApi.getMe();

            const currentUser = {
                id: meData.user_id,
                email: meData.email,
                role: meData.role,
                token: accessToken,
            };

            // Сохраняем пользователя в контексте (refresh token не нужен)
            login(currentUser);
            navigate('/app');
        } catch (err: any) {
            setMessage(err.response?.data?.detail || err.message || '❌ Ошибка входа');
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