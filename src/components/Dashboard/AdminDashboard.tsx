import React from "react";
import { Link } from "react-router-dom";
import {useUser} from "../../Context/UserContext.tsx";

const AdminDashboard: React.FC = () => {
    const { user } = useUser();

    return (
        <div>
            <h1>Привет, {user?.username}</h1>
            <p>Роль: {user?.role}</p>

            <ul>
                <li><Link to="/dashboard">Мои PDF</Link></li>

                {/* Ссылка на админ-панель только для admin */}
                {user?.role === "admin" && (
                    <li><Link to="/admin">Админ-панель</Link></li>
                )}

            </ul>
        </div>
    );
};

export default AdminDashboard;
