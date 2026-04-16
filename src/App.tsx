import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { DashboardApp } from './components/Dashboard/DashboardApp';
import { Profile } from './components/Profile/Profile';
import { Navbar } from './components/Layout/routes/Navbar.tsx';
import { PrivateRoute } from './components/Layout/routes/PrivateRoute';
import AdminPanel from "./components/AdminPanel/AdminPanel.tsx";
import { Forbidden } from "./components/Layout/routes/Forbidden.tsx";
import './App.css';
import About from "./components/Views/About.tsx";
import Home from "./components/Views/Home.tsx";

const AppContent: React.FC = () => {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forbidden" element={<Forbidden />} />

                <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
                    <Route path="/app" element={<DashboardApp />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
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