import React, { useState } from 'react';
import {authApi} from "../../api/api.ts";
import {useNavigate} from "react-router-dom";

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authApi.login(email, password);
            localStorage.setItem('access_token', response.access_token);
            navigate('/app');
        } catch (err: any) {
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