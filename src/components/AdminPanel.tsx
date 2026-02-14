import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";

interface UserItem {
    id: number;
    email: string;
    role: "user" | "admin";
}

const AdminPanel: React.FC = () => {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Получаем актуального пользователя с бэка ---
    const refreshCurrentUser = async () => {
        if (!user) return;
        try {
            const res = await fetch("http://127.0.0.1:8000/api/auth/me", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!res.ok) throw new Error("Не удалось получить данные пользователя");
            const meData = await res.json();
            return meData;
        } catch (err) {
            console.error(err);
            logout();
            return null;
        }
    };

    // --- Получаем список всех пользователей ---
    const fetchUsers = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/api/admin/users", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!res.ok) throw new Error(`Ошибка ${res.status}: ${await res.text()}`);

            const data = await res.json();

            // Приводим user_id к числу
            const usersList: UserItem[] = (data.users || []).map((u: any) => ({
                id: Number(u.user_id),
                email: u.email,
                role: u.role,
            }));

            setUsers(usersList);
        } catch (err: any) {
            setError(err.message || "Не удалось загрузить пользователей");
        } finally {
            setLoading(false);
        }
    };

    // --- Изменяем роль пользователя ---
    const updateRole = async (targetUserId: number, newRole: "user" | "admin") => {
        if (!user) return;

        // Защита: нельзя менять свою роль
        if (targetUserId === user.id) {
            alert("❌ Нельзя менять свою роль самому!");
            return;
        }

        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/admin/users/${targetUserId}/role`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ role: newRole }),
                }
            );
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Ошибка ${res.status}: ${text}`);
            }

            // После успешного изменения подтягиваем пользователей заново
            await fetchUsers();
        } catch (err: any) {
            setError(err.message || "Не удалось изменить роль");
        }
    };

    useEffect(() => {
        const init = async () => {
            await refreshCurrentUser();
            await fetchUsers();
        };
        init();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1>Админ-панель</h1>
            <table>
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                            {u.role !== "admin" && (
                                <button onClick={() => updateRole(u.id, "admin")}>
                                    Сделать админом
                                </button>
                            )}
                            {u.role !== "user" && (
                                <button onClick={() => updateRole(u.id, "user")}>
                                    Сделать пользователем
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;
