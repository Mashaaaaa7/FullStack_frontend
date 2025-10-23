import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppPDF from "./App"; // App.tsx с PDF/карточками
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HistoryProvider } from "./Context/HistoryContext";
import { Header } from "./components/Header";
import "./App.css";

const Root: React.FC = () => {
    const [user, setUser] = useState<string | undefined>(localStorage.getItem("user") || undefined);

    const handleLogout = () => setUser(undefined);

    return (
        <HistoryProvider>
            <BrowserRouter>
                <Header user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
                    <Route path="/login" element={<LoginPage onLogin={setUser} />} />
                    <Route path="/register" element={<RegisterPage onLogin={setUser} />} />
                    <Route path="/app" element={<AppPDF />} />
                </Routes>
            </BrowserRouter>
        </HistoryProvider>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
