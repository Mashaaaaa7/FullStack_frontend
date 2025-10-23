import React from "react";
import { AuthForm } from "../components/AuthForm";

export const RegisterPage: React.FC<{ onLogin?: (username: string) => void }> = ({ onLogin }) => {
    return <AuthForm mode="register" onLogin={onLogin} />;
};
