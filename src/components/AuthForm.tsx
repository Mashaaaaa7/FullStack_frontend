import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
    mode: "login" | "register";
    onLogin?: (username: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onLogin }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return alert("Введите имя и пароль");

        if (mode === "register") {
            localStorage.setItem("user", username);
            alert("Регистрация прошла успешно ✅");
        } else {
            const user = localStorage.getItem("user");
            if (user === username) {
                alert("Добро пожаловать обратно!");
            } else {
                alert("Пользователь не найден. Зарегистрируйтесь сначала.");
                navigate("/register");
                return;
            }
        }

        onLogin?.(username);
        navigate("/profile");
    };

    return (
        <div className="page-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>{mode === "login" ? "Вход" : "Регистрация"}</h2>
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit">{mode === "login" ? "Войти" : "Зарегистрироваться"}</button>
                <p>
                    {mode === "login" ? (
                        <>Нет аккаунта? <span onClick={() => navigate("/register")}>Зарегистрироваться</span></>
                    ) : (
                        <>Есть аккаунт? <span onClick={() => navigate("/login")}>Войти</span></>
                    )}
                </p>
            </form>
        </div>
    );
};