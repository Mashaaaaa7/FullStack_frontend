import React, { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import "./AdminPanel.css";
import { adminApi } from "../../api/api";

interface UserItem {
    id: number;
    email: string;
    role: "user" | "admin";
}

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await adminApi.listUsers(); // data = { users: [...] }
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

    const updateRole = async (targetUserId: number, newRole: "user" | "admin") => {
        if (!user) return;

        if (targetUserId === user.id) {
            // Запрет на изменение своей роли – просто не делаем запрос
            return;
        }

        try {
            await adminApi.updateUserRole(targetUserId, newRole);
            await fetchUsers();
        } catch (err: any) {
            setError(err.message || "Не удалось изменить роль");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка пользователей...</p>
        </div>
    );

    if (error) return (
        <div className="message-error">
            <span>⚠️</span>
            {error}
        </div>
    );

    return (
        <div className="admin-container">
            <h1>Админ-панель</h1>
            <div className="table-wrapper">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Роль</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => {
                        const isSelf = u.id === user?.id;
                        return (
                            <tr key={u.id}>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge role-${u.role}`}>
                                        {u.role === "admin" ? "Администратор" : "Пользователь"}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    {isSelf ? (
                                        <span className="warning">❌ Нельзя менять свою роль</span>
                                    ) : (
                                        <>
                                            {u.role !== "admin" && (
                                                <button
                                                    className="action-button action-admin"
                                                    onClick={() => updateRole(u.id, "admin")}
                                                >
                                                    <span>👑</span> Сделать админом
                                                </button>
                                            )}
                                            {u.role !== "user" && (
                                                <button
                                                    className="action-button action-user"
                                                    onClick={() => updateRole(u.id, "user")}
                                                >
                                                    <span>👤</span> Сделать пользователем
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;