import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { DashboardApp } from './components/Dashboard/DashboardApp';
import { Profile } from './components/Profile/Profile';
import { Navbar } from './components/Layout/Navbar';
import { PrivateRoute } from './components/routes/PrivateRoute';

import './App.css';
import {Forbidden} from "./components/Forbidden.tsx";
import AdminPanel from "./components/AdminPanel/AdminPanel.tsx";

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

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
                    <Route path="/forbidden" element={<Forbidden />} />
                </Route>

                {/* Только для админа */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>


                {/* Любой другой путь → Dashboard */}
                <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
        </>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;
