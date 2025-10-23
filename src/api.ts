const API_BASE_URL = 'http://localhost:8000/';

// Хранилище токена
let authToken: string | null = localStorage.getItem('authToken');

export const api = {
    // Аутентификация
    async register(email: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.token) {
                authToken = result.token;
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            return result;
        } catch (error) {
            console.error('Register API error:', error);
            throw error;
        }
    },

    async login(email: string, password: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.token) {
                authToken = result.token;
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            return result;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },

    logout() {
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Защищенные API методы
    async uploadPDF(file: File) {
        if (!authToken) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Upload API error:', error);
            throw error;
        }
    },

    async getDecks() {
        if (!authToken) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/decks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get decks API error:', error);
            throw error;
        }
    },

    async createCards(deckName: string) {
        if (!authToken) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/decks/${deckName}/cards`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create cards API error:', error);
            throw error;
        }
    },

    async deleteDeck(deckName: string) {
        if (!authToken) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/decks/${deckName}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Delete deck API error:', error);
            throw error;
        }
    },

    async getHistory() {
        if (!authToken) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Get history API error:', error);
            return { success: true, history: [] };
        }
    },
};