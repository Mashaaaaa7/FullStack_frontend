import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
        } catch {
            setError('Ошибка при входе');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h2>Вход</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Пароль"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                {error && <p className="error">{error}</p>}
            </div>
            <div className="auth-switch">
                <p>
                    Нет аккаунта? <a href="/register">Зарегистрироваться</a>
                </p>
            </div>
        </div>
    );
};