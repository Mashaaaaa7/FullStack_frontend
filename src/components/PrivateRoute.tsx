// src/components/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
};

