import React from "react";
import { Link } from "react-router-dom";

export const Forbidden: React.FC = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>403 — Доступ запрещён</h1>
            <p>У вас нет прав для просмотра этой страницы.</p>
            <Link to="/app">Вернуться в приложение</Link>
        </div>
    );
};