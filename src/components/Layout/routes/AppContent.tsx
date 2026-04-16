import React from "react";
import { useAuth } from "../../../Context/AuthContext.tsx";
import { PublicRoute } from "./PublicRoute.tsx";
import {ProtectedRoutes} from "./ProtectedRoute.tsx";
import {Navbar} from "./Navbar.tsx";

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Загрузка...</div>;
    if (!user) return <PublicRoute />;

    return (
        <>
            <Navbar />
            <ProtectedRoutes />
        </>
    );
};

export default AppContent;