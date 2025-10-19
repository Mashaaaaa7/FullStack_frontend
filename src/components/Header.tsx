import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
    user?: string;
    onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();

    return (
        <header className="app-header">
            <h1 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>🎴 Зарегистрируйтесь или войдите</h1>
            <div className="header-buttons">
                {user ? (
                    <>
                        <button onClick={() => navigate("/app")}>Профиль</button>
                        <button onClick={onLogout}>Выйти</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate("/login")}>Войти</button>
                        <button onClick={() => navigate("/register")}>Регистрация</button>
                        <button onClick={onLogout}>Выйти</button>
                    </>
                )}
            </div>
        </header>
    );
};
