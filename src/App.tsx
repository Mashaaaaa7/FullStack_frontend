import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import DashboardApp from './components/Dashboard/DashboardApp';
import './App.css';

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [showRegister, setShowRegister] = useState(false);

    if (!user) {
        return showRegister
            ? <Register switchToLogin={() => setShowRegister(false)} />
            : <Login switchToRegister={() => setShowRegister(true)} />;
    }

    return <DashboardApp />;
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/app" element={<MainApp />} />
            </Routes>
        </Router>
    );
};

export default App;


