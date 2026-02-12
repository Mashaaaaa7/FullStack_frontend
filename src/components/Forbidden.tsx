import React from 'react';

export const Forbidden: React.FC = () => {
    return (
        <div style={{ padding: 40, textAlign: 'center' }}>
            <h1>403 — Доступ запрещён</h1>
            <p>У вас нет прав для просмотра этой страницы.</p>
        </div>
    );
};
