import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../../Auth/Login.tsx";
import { Register } from "../../Auth/Register.tsx";

export const PublicRoute: React.FC = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
);