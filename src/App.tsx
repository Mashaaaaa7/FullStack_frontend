import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import DashboardApp from './components/Dashboard/DashboardApp';
import { Profile } from './components/Profile/Profile';
import { Navbar } from './components/Layout/Navbar';
import './App.css';

const AppContent: React.FC = () => {
    const { user } = useAuth();

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
                <Route path="/app" element={<DashboardApp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
        </>
    );
};

const App: React.FC = () => (
    <Router>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </Router>
);

export default App;