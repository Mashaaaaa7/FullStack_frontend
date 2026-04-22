import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useDebounce } from "../../hooks/useDebounce";
import { adminApi } from "../../api/api";
import "./AdminPanel.css";

interface UserItem {
    id: number;
    email: string;
    role: "user" | "admin";
}

const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const sort = searchParams.get("sort") || "email_asc";

    const debouncedSearch = useDebounce(search, 500);

    const updateParams = (newParams: Record<string, string>) => {
        setSearchParams({ ...Object.fromEntries(searchParams), ...newParams });
    };

    const fetchUsers = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {
                page,
                limit,
                sort,
            };
            if (debouncedSearch) params.search = debouncedSearch;
            if (roleFilter) params.role = roleFilter;

            const data = await adminApi.listUsers(params);
            // data = { success, total, page, limit, items }
            const usersList: UserItem[] = (data.items || []).map((u: any) => ({
                id: Number(u.user_id),
                email: u.email,
                role: u.role,
            }));
            setUsers(usersList);
            setTotal(data.total || 0);
        } catch (err: any) {
            setError(err.message || "Не удалось загрузить пользователей");
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (targetUserId: number, newRole: "user" | "admin") => {
        if (!user || targetUserId === user.user_id) return;

        try {
            await adminApi.updateUserRole(targetUserId, newRole);
            await fetchUsers(); // перезагружаем список с текущими фильтрами
        } catch (err: any) {
            setError(err.message || "Не удалось изменить роль");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, limit, debouncedSearch, roleFilter, sort]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateParams({ search: e.target.value, page: "1" });
    };

    const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ role: e.target.value, page: "1" });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ sort: e.target.value, page: "1" });
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ limit: e.target.value, page: "1" });
    };

    const handlePageChange = (newPage: number) => {
        updateParams({ page: String(newPage) });
    };

    const totalPages = Math.ceil(total / limit);

    if (loading && users.length === 0) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка пользователей...</p>
        </div>
    );

    if (error) return (
        <div className="message-error">
            <span>⚠️</span> {error}
        </div>
    );

    return (
        <div className="admin-container">
            <h1>Админ-панель</h1>

            {/* Фильтры */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>Поиск по email</label>
                    <input
                        type="text"
                        className="filter-input"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Введите email..."
                    />
                </div>

                <div className="filter-group">
                    <label>Роль</label>
                    <select className="filter-select" value={roleFilter} onChange={handleRoleFilterChange}>
                        <option value="">Все</option>
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Сортировка</label>
                    <select className="filter-select" value={sort} onChange={handleSortChange}>
                        <option value="email_asc">Email (А–Я)</option>
                        <option value="email_desc">Email (Я–А)</option>
                        <option value="role_asc">Роль (сначала admin)</option>
                        <option value="role_desc">Роль (сначала user)</option>

                    </select>
                </div>

                <div className="filter-group">
                    <label>На странице</label>
                    <select className="filter-select" value={limit} onChange={handleLimitChange}>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>

            {/* Таблица */}
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
                        const isSelf = u.id === user?.user_id;
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

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        ← Назад
                    </button>
                    <div className="pagination-pages">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                className={`pagination-page ${page === p ? 'active' : ''}`}
                                onClick={() => handlePageChange(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        className="pagination-btn"
                        disabled={page === totalPages}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        Вперед →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;