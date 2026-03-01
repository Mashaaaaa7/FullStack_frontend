import axios from 'axios';
import { UploadResponse, ActionHistory } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // обязательно для отправки httpOnly cookie
    headers: {
        'Content-Type': 'application/json',
    },
});

// Перехватчик запросов: добавляем access token из localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Перехватчик ответов: обработка 401 (попытка обновить токен)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Вызываем /auth/refresh – cookie отправится автоматически
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
                const newAccessToken = data.access_token;
                localStorage.setItem('access_token', newAccessToken);
                // Повторяем исходный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Если обновить не удалось – разлогиниваем
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }).then(res => res.data),

    getMe: () => api.get('/profile/me').then(res => res.data), // <-- исправлено

    logout: () => api.post('/auth/logout').then(res => res.data),
};

// API методы для работы с PDF
export const pdfApi = {
    uploadPDF: (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/pdf/upload-pdf', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data);
    },

    processCards: (fileId: number, maxCards: number) =>
        api.post(`/pdf/process-pdf/${fileId}/start?max_cards=${maxCards}`).then(res => res.data),

    getCards: (fileId: number, skip = 0, limit = 10) =>
        api.get(`/pdf/cards/${fileId}?skip=${skip}&limit=${limit}`).then(res => res.data),

    listPDFs: () => api.get('/pdf/pdfs').then(res => res.data),

    getHistory: (): Promise<{ success: boolean; history: ActionHistory[]; total: number }> =>
        api.get('/pdf/history').then(res => res.data),

    deleteFile: (fileId: number) => api.delete(`/pdf/delete-file/${fileId}`).then(res => res.data),
};

// API методы для администратора
export const adminApi = {
    listUsers: () => api.get('/admin/users').then(res => res.data),
    updateUserRole: (userId: number, role: 'user' | 'admin') =>
        api.put(`/admin/users/${userId}/role`, { role }).then(res => res.data),
};

export default api;