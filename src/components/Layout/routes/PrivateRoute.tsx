import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext.tsx";

interface PrivateRouteProps {
    allowedRoles: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
    const { user } = useAuth();

    return allowedRoles.includes(user!.role)
        ? <Outlet />
        : <Navigate to="/forbidden" replace />;
};