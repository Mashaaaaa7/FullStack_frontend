import { UploadResponse, ActionHistory } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${res.status}`);
    }
    return res.json();
};

export const api = {
    // 🔐 AUTH
    async login(email: string, password: string) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        return handleResponse(res);
    },

    async getMe(token: string) {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return handleResponse(res);
    },

    // 📄 PDF
    async uploadPDF(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE}/pdf/upload-pdf`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        return handleResponse(res);
    },

    async processCards(fileId: number, maxCards: number) {
        const res = await fetch(
            `${API_BASE}/pdf/process-pdf/${fileId}/start?max_cards=${maxCards}`,
            {
                method: 'POST',
                headers: getAuthHeaders()
            }
        );

        return handleResponse(res);
    },

    async getProcessingStatus(fileId: number) {
        const res = await fetch(
            `${API_BASE}/pdf/processing-status/${fileId}`,
            {
                headers: getAuthHeaders()
            }
        );

        return handleResponse(res);
    },

    async getCards(fileId: number, skip = 0, limit = 10) {
        const res = await fetch(
            `${API_BASE}/pdf/cards/${fileId}?skip=${skip}&limit=${limit}`,
            {
                headers: getAuthHeaders()
            }
        );

        return handleResponse(res);
    },

    async listPDFs() {
        const res = await fetch(
            `${API_BASE}/pdf/pdfs`,
            {
                headers: getAuthHeaders()
            }
        );

        return handleResponse(res);
    },

    async actionHistory(): Promise<{ success: boolean; history: ActionHistory[]; total: number }> {
        const res = await fetch(
            `${API_BASE}/pdf/history`,
            {
                headers: getAuthHeaders()
            }
        );

        return handleResponse(res);
    },

    async deleteFile(fileId: number) {
        const res = await fetch(
            `${API_BASE}/pdf/delete-file/${fileId}`,
            {
                method: 'DELETE',
                headers: getAuthHeaders()
            }
        );

        return handleResponse(res);
    }
};