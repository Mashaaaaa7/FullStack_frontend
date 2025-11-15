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
        const errorMsg = errorData.detail || `HTTP error! status: ${res.status}`;
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
    }
    return await res.json();
};

export const api = {
    uploadPDF: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE}/api/pdf/upload-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await handleResponse(res);

            return {
                success: true,
                filename: data.file_name || data.filename,
                file_id: data.file_id,
                message: data.message
            };
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    processCards: async (fileId: number, maxCards: number = 10): Promise<{message: string; status: string}> => {
        try {
            const res = await fetch(`${API_BASE}/api/pdf/process-pdf/${fileId}?max_cards=${maxCards}`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            console.error('processCards error:', error);
            throw error;
        }
    },

    getProcessingStatus: async (fileId: number): Promise<{success: boolean; status: string; cards_count: number}> => {
        try {
            const res = await fetch(`${API_BASE}/api/pdf/processing-status/${fileId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            console.error('getProcessingStatus error:', error);
            throw error;
        }
    },

    getCards: async (fileId: number): Promise<{success: boolean; cards: Card[]; total: number}> => {
        try {
            const res = await fetch(`${API_BASE}/api/pdf/cards/${fileId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            console.error('getCards error:', error);
            throw error;
        }
    },

    listPDFs: async (): Promise<{success: boolean; pdfs: any[]; total: number}> => {
        try {
            const res = await fetch(`${API_BASE}/api/pdf/pdfs`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            console.error('listPDFs error:', error);
            throw error;
        }
    },

    actionHistory: async (): Promise<{success: boolean; history: ActionHistory[]; total: number}> => {
        try {
            const res = await fetch(`${API_BASE}/api/pdf/history`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            console.error('actionHistory error:', error);
            throw error;
        }
    },

    deleteFile: async (fileId: number): Promise<{success: boolean; message: string}> => {
        try {
            const res = await fetch(`${API_BASE}/api/pdf/delete-file/${fileId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await handleResponse(res);
        } catch (error) {
            console.error('deleteFile error:', error);
            throw error;
        }
    }
};