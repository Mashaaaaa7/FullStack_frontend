import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute.tsx";
import { Forbidden } from "./Forbidden.tsx";
import { DashboardApp } from "../../Dashboard/DashboardApp.tsx";
import { Profile } from "../../Profile/Profile.tsx";
import AdminPanel from "../../AdminPanel/AdminPanel.tsx";

export const ProtectedRoutes: React.FC = () => (
    <Routes>
        <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/app" element={<DashboardApp />} />
            <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
);