import {UploadResponse, ActionHistory, Card} from '../types';

const API_BASE = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const api = {
    uploadPDF: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/upload-pdf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        return {
            success: true,
            filename: data.file_name || data.filename,
            file_id: data.file_id,
            message: data.message
        };
    },

    createCards: async (fileName: string): Promise<Card[]> => {
        const res = await fetch(`${API_BASE}/api/cards/${fileName}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        // ✅ Backend возвращает МАССИВ напрямую
        return await res.json();
    },

    actionHistory: async (): Promise<{success: boolean; history: ActionHistory[]; total: number}> => {
        const res = await fetch(`${API_BASE}/api/history`, {  // ✅ Новый endpoint
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },
};