import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";

export const UserPanel: React.FC = () => {
    const { email, logout } = useAuth();
    const [open, setOpen] = useState(false);

    return (
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                }}
            >
                {email} ⚙️
            </button>
            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        marginTop: "0.5rem",
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                        zIndex: 100,
                        minWidth: "200px",
                    }}
                >
                    <button
                        style={{ display: "block", width: "100%", padding: "0.5rem", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
                        onClick={() => alert("Настройки профиля (заглушка)")}
                    >
                        Настройки
                    </button>
                    <button
                        style={{ display: "block", width: "100%", padding: "0.5rem", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
                        onClick={logout}
                    >
                        Выйти
                    </button>
                </div>
            )}
        </div>
    );
};
