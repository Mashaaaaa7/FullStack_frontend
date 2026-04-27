import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
    UploadResponse,
    ActionHistory,
    DictionaryData,
    CurrentUser,
    Card,
} from "../types";

const API_BASE = "http://localhost:8000/api";

declare module "axios" {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

interface ApiErrorResponse {
    detail?: string;
}

interface RefreshResponse {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
}

export interface PdfCardsResponse {
    cards: Card[];
    total: number;
}

export interface FileListItemDto {
    id: number;
    file_name: string;
    size: number;
    status: "uploaded" | "processing" | "processed" | "failed";
    created_at: string;
    owner_id: number;
    owner_email?: string;
}

export interface PdfListResponse {
    items: FileListItemDto[];
    total: number;
    success?: boolean;
}

export interface AdminUsersParams {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    role?: "user" | "admin" | "";
}

export interface AdminUserDto {
    user_id: number;
    email: string;
    role: "user" | "admin";
}

export interface AdminUsersResponse {
    items: AdminUserDto[];
    total: number;
}

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.detail ?? error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Произошла неизвестная ошибка";
};

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 60000,
    headers: {
        Accept: "application/json",
    },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    config.headers = config.headers ?? {};

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url ?? "";
        const isLoginRequest = requestUrl.includes("/auth/login");
        const isLogoutRequest = requestUrl.includes("/auth/logout");
        const isRefreshRequest = requestUrl.includes("/auth/refresh");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isLoginRequest &&
            !isLogoutRequest &&
            !isRefreshRequest
        ) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post<RefreshResponse>(
                    `${API_BASE}/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                localStorage.setItem("access_token", data.access_token);

                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("access_token");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.data?.detail) {
            error.message = error.response.data.detail;
        }

        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email: string, password: string) =>
        api.post("/auth/login", { email, password }).then((res) => res.data),

    register: (email: string, password: string) =>
        api.post("/auth/register", { email, password }).then((res) => res.data),

    getMe: (): Promise<CurrentUser> =>
        api.get<CurrentUser>("/profile/me").then((res) => res.data),

    logout: () => api.post("/auth/logout").then((res) => res.data),

    changePassword: (body: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }) => api.post("/profile/change-password", body).then((res) => res.data),

    changeEmail: (body: {
        new_email: string;
        password: string;
    }) => api.post("/profile/change-email", body).then((res) => res.data),
};

export const pdfApi = {
    uploadPDF: (
        file: File,
        onProgress?: (percentage: number) => void
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        return api
            .post<UploadResponse>("/pdf/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percent);
                    }
                },
            })
            .then((res) => res.data);
    },

    processCards: (fileId: number, maxCards: number) =>
        api.post(`/pdf/${fileId}/process?max_cards=${maxCards}`).then((res) => res.data),

    getCards: (fileId: number, skip = 0, limit = 10): Promise<PdfCardsResponse> =>
        api
            .get<PdfCardsResponse>(`/pdf/cards/${fileId}?skip=${skip}&limit=${limit}`)
            .then((res) => res.data),

    listPDFs: (): Promise<PdfListResponse> =>
        api.get<PdfListResponse>("/pdf/list").then((res) => res.data),

    getHistory: (): Promise<{ success: boolean; history: ActionHistory[]; total: number }> =>
        api.get("/pdf/history").then((res) => res.data),

    deleteFile: (fileId: number) =>
        api.delete(`/pdf/${fileId}`).then((res) => res.data),

    getDownloadUrl: (fileId: number) =>
        api.get(`/pdf/${fileId}/download`).then((res) => res.data),
};

export const adminApi = {
    listUsers: (params?: AdminUsersParams): Promise<AdminUsersResponse> =>
        api.get<AdminUsersResponse>("/admin/users", { params }).then((res) => res.data),

    updateUserRole: (userId: number, role: "user" | "admin") =>
        api.put(`/admin/users/${userId}/role`, { role }).then((res) => res.data),
};

export const dictionaryApi = {
    getDefinition: (word: string): Promise<DictionaryData> =>
        api
            .get<DictionaryData>(`/dictionary?word=${encodeURIComponent(word)}`)
            .then((res) => res.data),
};

export default api;