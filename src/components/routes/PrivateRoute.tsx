import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {Forbidden} from "../Forbidden.tsx";


type PrivateRouteProps = {
    allowedRoles: ('user' | 'admin')[];
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;

    if (!user) {
        // Если не авторизован, редирект на /login
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Если роль не подходит — показываем 403
        return <Forbidden />;
    }

    // Всё ок — рендерим дочерние маршруты
    return <Outlet />;
};
