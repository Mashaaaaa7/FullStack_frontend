import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {useAuth} from "../../Context/AuthContext.tsx";
import {Login} from "../Auth/Login.tsx";
import {Register} from "../Auth/Register.tsx";
import {Navbar} from "../Layout/Navbar.tsx";
import {PrivateRoute} from "./PrivateRoute.tsx";
import {DashboardApp} from "../Dashboard/DashboardApp.tsx";
import {Profile} from "../Profile/Profile.tsx";
import AdminPanel from "../AdminPanel.tsx";


const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Как только пользователь авторизован — редирект на /app
    useEffect(() => {
        if (!loading && user) {
            navigate('/app', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) return <div className="loading">Загрузка...</div>;

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <>
            <Navbar />
            <Routes>
                {/* Для всех авторизованных */}
                <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
                    <Route path="/app" element={<DashboardApp />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Только админ */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>

                {/* Любой другой путь → Dashboard */}
                <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
        </>
    );
};

export default AppContent;