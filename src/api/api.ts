import { UploadResponse, ActionHistory, Card } from '../types';

const API_BASE = 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${res.status}`);
    }
    return await res.json();
};

export const api = {
    uploadPDF: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_BASE}/api/pdf/upload-pdf`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await handleResponse(res);
        return {
            success: true,
            filename: data.file_name || data.filename,
            file_id: data.file_id,
            message: data.message
        };
    },

    processCards: async (fileId: number, maxCards: number = 10): Promise<{message: string; status: string}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/process-pdf/${fileId}?max_cards=${maxCards}`,
            { method: 'POST', headers: getAuthHeaders() }
        );
        return await handleResponse(res);
    },

    getProcessingStatus: async (fileId: number): Promise<{success: boolean; status: string; cards_count: number}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/processing-status/${fileId}`,
            { method: 'GET', headers: getAuthHeaders() }
        );
        return await handleResponse(res);
    },

    // ✅ НОВАЯ ФУНКЦИЯ
    cancelProcessing: async (fileId: number): Promise<{success: boolean; message: string}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/cancel-processing/${fileId}`,
            {
                method: 'POST',
                headers: getAuthHeaders()
            }
        );
        return await handleResponse(res);
    },

    getCards: async (fileId: number): Promise<{success: boolean; cards: Card[]; total: number}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/cards/${fileId}`,
            { method: 'GET', headers: getAuthHeaders() }
        );
        return await handleResponse(res);
    },

    listPDFs: async (): Promise<{success: boolean; pdfs: any[]; total: number}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/pdfs`,
            { method: 'GET', headers: getAuthHeaders() }
        );
        return await handleResponse(res);
    },

    actionHistory: async (): Promise<{success: boolean; history: ActionHistory[]; total: number}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/history`,
            { method: 'GET', headers: getAuthHeaders() }
        );
        return await handleResponse(res);
    },

    deleteFile: async (fileId: number): Promise<{success: boolean; message: string}> => {
        const res = await fetch(
            `${API_BASE}/api/pdf/delete-file/${fileId}`,
            { method: 'DELETE', headers: getAuthHeaders() }
        );
        return await handleResponse(res);
    }
};