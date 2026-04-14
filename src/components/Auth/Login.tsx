import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {AuthForm} from "../AuthForm/AuthForm.tsx";
import {useAuth} from "../../Context/AuthContext.tsx";

export const Login: React.FC = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
        setError('');
        try {
            await login(email, password);
            navigate('/app');
        } catch {
            setError('Ошибка при входе');
        }
    };

    return (
        <div className="auth-container">
            <AuthForm
                title="Вход"
                submitLabel="Войти"
                onSubmit={handleSubmit}
                switchLink={{ text: "Нет аккаунта?", label: "Зарегистрироваться", to: "/register" }}
            />
            {error && <p className="error">{error}</p>}
        </div>
    );
};