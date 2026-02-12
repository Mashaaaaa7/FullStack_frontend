import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

export const Register: React.FC = () => {
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
            const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                // Если сервер вернул ошибку, читаем текст ошибки
                const errorData = await res.json();
                setMessage(errorData.detail || '❌ Ошибка регистрации');
                return;
            }

            const data = await res.json();

            // Проверяем, что пришёл токен и email
            if (data.access_token && data.email) {
                login(data.access_token, {
                    email: data.email,
                    role: data.role || 'user',
                });
                navigate('/app');
            } else {
                setMessage('❌ Ошибка регистрации: некорректный ответ сервера');
            }
        } catch (err) {
            setMessage('❌ Ошибка сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h2>Регистрация</h2>
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
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <div className="auth-switch">
                    <p>
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="link">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};