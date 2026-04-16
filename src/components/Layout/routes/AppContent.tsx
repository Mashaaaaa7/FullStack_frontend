import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext.tsx";
import { PublicRoute } from "./PublicRoute.tsx";
import {Navbar} from "./Navbar.tsx";
import Home from "../../Views/Home.tsx";
import About from "../../Views/About.tsx";
import {ProtectedRoutes} from "./ProtectedRoute.tsx";

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <>
            {user && <Navbar />}
            <Routes>
                {/* Доступны всем */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />

                {/* Остальное зависит от авторизации */}
                {!user
                    ? <Route path="*" element={<PublicRoute />} />
                    : <Route path="*" element={<ProtectedRoutes />} />
                }
            </Routes>
        </>
    );
};

export default AppContent;