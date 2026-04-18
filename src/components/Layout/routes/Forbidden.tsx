import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext.tsx";

export const Forbidden: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>403 — Доступ запрещён</h1>
            <p>У вас нет прав для просмотра этой страницы.</p>
            <button onClick={() => navigate('/app')}>
                Вернуться в приложение
            </button>
        </div>
    );
};