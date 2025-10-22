// api.ts
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    async uploadPDF(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const result = await response.json();
            console.log('Upload response:', result); // Добавим лог
            return result;
        } catch (error) {
            console.error('Upload API error:', error);
            throw error; // Просто пробрасываем ошибку дальше
        }
    },

    async getDecks() {
        try {
            const response = await fetch(`${API_BASE_URL}/decks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('Get decks response:', result); // Добавим лог
            return result;
        } catch (error) {
            console.error('Get decks API error:', error);
            throw error;
        }
    },

    async createCards(deckName: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/decks/${deckName}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Create cards response:', result); // Добавим лог
            return result;
        } catch (error) {
            console.error('Create cards API error:', error);
            throw error;
        }
    },

    async deleteDeck(deckName: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/decks/${deckName}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Delete deck response:', result); // Добавим лог
            return result;
        } catch (error) {
            console.error('Delete deck API error:', error);
            throw error;
        }
    },

    async getHistory(): Promise<{success: boolean; history: HistoryItem[]}> {
        try {
            const response = await fetch(`${API_BASE_URL}/history`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('Get history response:', result); // Добавим лог
            return result;
        } catch (error) {
            console.error('Get history API error:', error);
            // Для демо возвращаем пустую историю
            return { success: true, history: [] };
        }
    },

    async addHistoryItem(item: Omit<HistoryItem, 'id'>): Promise<{success: boolean}> {
        try {
            // Генерируем ID на фронтенде
            const itemWithId = {
                ...item,
                id: Math.random().toString(36).substr(2, 9)
            };

            const response = await fetch(`${API_BASE_URL}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(itemWithId),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Add history response:', result); // Добавим лог
            return result;
        } catch (error) {
            console.error('Add history API error:', error);
            // Игнорируем ошибки истории, чтобы не мешать основному функционалу
            return { success: true };
        }
    },
};