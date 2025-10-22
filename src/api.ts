import { Deck, UploadResponse, CardsResponse, DeleteResponse, User, LoginData, RegisterData } from './types';

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

    // Методы аутентификации
    async login(data: LoginData): Promise<{ success: boolean; user?: User; token?: string }> {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('Login API error:', error);
            return { success: false };
        }
    }

    async register(data: RegisterData): Promise<{ success: boolean; user?: User; token?: string }> {
        try {
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('Register API error:', error);
            return { success: false };
        }
    }

    async verifyToken(): Promise<{ success: boolean; user?: User }> {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { success: false };
            }

            const response = await fetch(`${API_BASE}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                return { success: false };
            }

            return await response.json();
        } catch (error) {
            console.error('Token verification error:', error);
            localStorage.removeItem('token');
            return { success: false };
        }
    }

    // Дополнительный метод для выхода
    async logout(): Promise<{ success: boolean }> {
        localStorage.removeItem('token');
        return { success: true };
    }
}

export const api = new FlashcardsAPI();