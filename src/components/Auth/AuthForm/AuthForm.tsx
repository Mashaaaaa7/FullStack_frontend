import React, { useState } from "react";
import { Link } from "react-router-dom";

interface AuthFormProps {
    title: string;
    submitLabel: string;
    onSubmit: (values: { email: string; password: string }) => void;
    switchLink?: { text: string; label: string; to: string };
}

export const AuthForm: React.FC<AuthFormProps> = ({ title, submitLabel, onSubmit, switchLink }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "300px",
            background: "white",
            padding: "2rem",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
            <h2 style={{ textAlign: "center" }}>{title}</h2>

            <label>
                Email
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                />
            </label>

            <label>
                Пароль
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                />
            </label>

            <button
                type="submit"
                style={{
                    padding: "0.75rem",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 500
                }}
            >
                {submitLabel}
            </button>

            {switchLink && (
                <p style={{ textAlign: "center", margin: 0, fontSize: "0.9rem", color: "#666" }}>
                    {switchLink.text}{" "}
                    <Link to={switchLink.to} style={{ color: "#667eea", textDecoration: "none", fontWeight: 500 }}>
                        {switchLink.label}
                    </Link>
                </p>
            )}
        </form>
    );
};