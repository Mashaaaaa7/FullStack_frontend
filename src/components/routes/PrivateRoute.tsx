import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {useAuth} from "../../Context/AuthContext.tsx";

interface PrivateRouteProps {
    allowedRoles: ('user' | 'admin')[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (!allowedRoles.includes(user.role)) return <Navigate to="/app" replace />;

    return <Outlet />;
};
