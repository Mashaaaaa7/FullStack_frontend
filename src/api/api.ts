import { UploadResponse, ActionHistory, Card } from '../types';

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
        const res = await fetch(`${API_BASE}/upload-pdf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type for FormData - browser handles it
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
            file_id: data.file_id,  // ✅ Store this ID!
            message: data.message
        };
    },

    processCards: async (fileId: number, maxCards: number = 10): Promise<{message: string; status: string}> => {
        const res = await fetch(`${API_BASE}/process-pdf/${fileId}?max_cards=${maxCards}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    getCards: async (fileId: number): Promise<{success: boolean; cards: Card[]; total: number}> => {
        const res = await fetch(`${API_BASE}/cards/${fileId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    actionHistory: async (): Promise<{success: boolean; history: ActionHistory[]; total: number}> => {
        const res = await fetch(`${API_BASE}/history`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    deleteFile: async (fileId: number): Promise<{success: boolean; message: string}> => {
        const res = await fetch(`${API_BASE}/delete-file/${fileId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    }
};