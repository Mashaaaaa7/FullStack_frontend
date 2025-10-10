import { Card, Deck, UploadResponse, CardsResponse, DeleteResponse } from './types';

const API_BASE = 'http://localhost:8000/api';

class FlashcardsAPI {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async healthCheck(): Promise<{ status: string; service: string }> {
        return this.request('/health');
    }

    async uploadPDF(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
        });

        return response.json();
    }

    async getDecks(): Promise<{ success: boolean; decks: Deck[] }> {
        return this.request('/decks');
    }

    async createCards(deckName: string): Promise<CardsResponse> {
        return this.request(`/decks/${deckName}/cards`, {
            method: 'POST',
        });
    }

    async getCards(deckName: string): Promise<CardsResponse> {
        return this.request(`/decks/${deckName}/cards`);
    }

    async deleteDeck(deckName: string): Promise<DeleteResponse> {
        const encodedName = encodeURIComponent(deckName);
        return this.request(`/decks/${encodedName}`, {
            method: 'DELETE',
        });
    }
}

export const api = new FlashcardsAPI();