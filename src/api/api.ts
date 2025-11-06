import {Deck, UploadResponse, CardsResponse, DeleteResponse, ActionHistory} from '../types';

// В файле api.ts
const API_BASE = 'http://127.0.0.1:8000/api/pdf'; // Добавьте /pdf

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const api = {
    getDecks: async (): Promise<{ success: boolean; decks: Deck[] }> => {
        const res = await fetch(`${API_BASE}/decks`, { // Теперь будет /api/pdf/decks
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    uploadPDF: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/upload`, { // Теперь будет /api/pdf/upload
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    createCards: async (deckName: string): Promise<CardsResponse> => {
        const res = await fetch(`${API_BASE}/decks/${deckName}/cards`, { // /api/pdf/decks/{name}/cards
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    deleteDeck: async (deckName: string): Promise<DeleteResponse> => {
        const res = await fetch(`${API_BASE}/decks/${deckName}`, { // /api/pdf/decks/{name}
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

    actionHistory: async (): Promise<{
        success: boolean;
        history: ActionHistory[];
        total: number
    }> => {
        const res = await fetch(`${API_BASE}/history`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json();
    },

};