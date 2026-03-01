import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {useAuth} from "../../Context/AuthContext.tsx";

interface RoleRouteProps {
    allowedRole: 'user' | 'admin';
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
    const { hasRole, isAuthenticated, loading } = useAuth();
    if (loading) return <div>Загрузка...</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return hasRole(allowedRole) ? <Outlet /> : <Navigate to="/forbidden" replace />;
};