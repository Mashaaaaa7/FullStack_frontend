// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    email: string;
    setToken: (token: string) => void;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    email: "",
    setToken: () => {},
    login: async () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("token"));
    const [email, setEmail] = useState<string>(() => localStorage.getItem("email") || "");

    const setToken = (t: string) => {
        localStorage.setItem("token", t);
        setTokenState(t);
    };

    const login = async (emailInput: string, password: string) => {
        // Заглушка проверки
        if (!emailInput.includes("@") || password.length < 6 || !/[A-Z]/.test(password)) {
            throw new Error("Неверная почта или пароль");
        }
        const dummyToken = "dummy-token";
        localStorage.setItem("token", dummyToken);
        localStorage.setItem("email", emailInput);
        setTokenState(dummyToken);
        setEmail(emailInput);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        setTokenState(null);
        setEmail("");
    };

    useEffect(() => {
        const savedEmail = localStorage.getItem("email");
        if (savedEmail) setEmail(savedEmail);
    }, []);

    return (
        <AuthContext.Provider value={{ token, email, setToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
