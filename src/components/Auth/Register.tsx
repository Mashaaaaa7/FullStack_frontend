import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from "../AuthForm/AuthForm.tsx";

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
        setMessage('');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage(data.detail || '❌ Ошибка регистрации');
                return;
            }

            navigate('/app');
        } catch {
            setMessage('❌ Ошибка сервера');
        }
    };

    return (
        <div className="auth-container">
            <AuthForm
                title="Регистрация"
                submitLabel="Зарегистрироваться"
                onSubmit={handleSubmit}
                switchLink={{ text: "Уже есть аккаунт?", label: "Войти", to: "/login" }}
            />
            {message && <p className="error">{message}</p>}
        </div>
    );
};