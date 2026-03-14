import axios from 'axios';
import { UploadResponse, ActionHistory } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Перехватчик запросов: добавляем access token из localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватчик ответов: обработка 401 (обновление токена)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
                localStorage.setItem('access_token', data.access_token);
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                return api(originalRequest);
            } catch {
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// API для аутентификации
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }).then(res => res.data),

    getMe: () => api.get('/profile/me').then(res => res.data),

    logout: () => api.post('/auth/logout').then(res => res.data),
};

// === API для работы с PDF ===
export const pdfApi = {
    uploadPDF: (file: File, onProgress?: (percentage: number) => void): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/pdf/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            },
        }).then(res => res.data);
    },

    processCards: (fileId: number, maxCards: number) =>
        api.post(`/pdf/${fileId}/process?max_cards=${maxCards}`).then(res => res.data),

    getCards: (fileId: number, skip = 0, limit = 10) =>
        api.get(`/pdf/cards/${fileId}?skip=${skip}&limit=${limit}`).then(res => res.data),

    listPDFs: () => api.get('/pdf/list').then(res => res.data),

    getHistory: (): Promise<{ success: boolean; history: ActionHistory[]; total: number }> =>
        api.get('/pdf/history').then(res => res.data),

    deleteFile: (fileId: number) => api.delete(`/pdf/${fileId}`).then(res => res.data),

    getDownloadUrl: (fileId: number) => api.get(`/pdf/${fileId}/download`).then(res => res.data),
};

// API для администратора
export const adminApi = {
    listUsers: () => api.get('/admin/users').then(res => res.data),
    updateUserRole: (userId: number, role: 'user' | 'admin') =>
        api.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),
};

export default api;