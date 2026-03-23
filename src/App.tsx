import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { DashboardApp } from './components/Dashboard/DashboardApp';
import { Profile } from './components/Profile/Profile';
import { Navbar } from './components/Layout/Navbar';
import { PrivateRoute } from './components/routes/PrivateRoute';
import Home from './components/Home';
import './App.css';

import AdminPanel from "./components/AdminPanel/AdminPanel.tsx";
import { Forbidden } from "./components/routes/Forbidden.tsx";

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;

    if (user) {
        return (
            <>
                <Navbar />
                <Routes>
                    <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
                        <Route path="/app" element={<DashboardApp />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/forbidden" element={<Forbidden />} />
                        <Route path="/" element={<Navigate to="/app" replace />} />
                    </Route>
                    <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminPanel />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/app" replace />} />
                </Routes>
            </>
        );
    }

    // Неавторизованные пользователи
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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