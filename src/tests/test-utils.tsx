import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../Context/AuthContext";

export let currentUser: any = null;

// Устанавливаем текущего пользователя для тестов
export const setCurrentUser = (user: any) => {
    currentUser = user;
};

// Обертка для рендера компонентов с роутером и Auth
export const renderWithRouterAndAuth = (ui: React.ReactNode) =>
    render(
        <BrowserRouter>
            <AuthProvider>{ui}</AuthProvider>
        </BrowserRouter>
    );