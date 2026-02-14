import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type User = {
    id: number;
    email: string;
    role: "user" | "admin";
    token: string; // access_token
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (user: User, refreshToken: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Инициализация при загрузке страницы ---
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedRefresh = localStorage.getItem("refreshToken");
        if (storedUser && storedRefresh) {
            setUser(JSON.parse(storedUser));
            setRefreshToken(storedRefresh);
        }
        setLoading(false);
    }, []);

    // --- Авто-обновление access_token каждые N секунд ---
    useEffect(() => {
        const interval = setInterval(() => {
            if (refreshToken) refreshAccessToken();
        }, 5 * 60 * 1000); // каждые 5 минут
        return () => clearInterval(interval);
    }, [refreshToken]);

    const login = (newUser: User, newRefreshToken: string) => {
        setUser(newUser);
        setRefreshToken(newRefreshToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        localStorage.setItem("refreshToken", newRefreshToken);
    };

    const logout = () => {
        setUser(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
    };

    const refreshAccessToken = async () => {
        try {
            if (!refreshToken) return;

            // Получаем новый access_token
            const res = await fetch("http://127.0.0.1:8000/api/auth/refresh-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!res.ok) throw new Error("Не удалось обновить токен");
            const data = await res.json();

            // Обновляем токен
            if (user) {
                const updatedUser = { ...user, token: data.access_token };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }

            // Подтягиваем актуальные данные пользователя с сервера
            const meRes = await fetch("http://127.0.0.1:8000/api/auth/me", {
                headers: { Authorization: `Bearer ${data.access_token}` },
            });
            if (!meRes.ok) throw new Error("Не удалось получить данные пользователя");
            const meData = await meRes.json();

            const refreshedUser: User = {
                id: meData.user_id,
                email: meData.email,
                role: meData.role,
                token: data.access_token,
            };
            setUser(refreshedUser);
            localStorage.setItem("user", JSON.stringify(refreshedUser));

        } catch (err) {
            console.error("Ошибка при обновлении токена:", err);
            logout(); // при ошибке выкидываем пользователя
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
