import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";

interface UserItem {
    id: number;
    username: string;
    role: "user" | "admin";
}

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/users", {
                headers: { Authorization: `Bearer ${user?.token}` },
            });

            if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
            const data = await res.json();
            setUsers(data.users);
        } catch (err: any) {
            setError(err.message || "Не удалось загрузить пользователей");
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: number, newRole: "user" | "admin") => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
            await fetchUsers();
        } catch (err: any) {
            setError(err.message || "Не удалось изменить роль");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1>Админ-панель</h1>
            <table>
                <thead>
                <tr>
                    <th>Имя пользователя</th>
                    <th>Роль</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.username}</td>
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