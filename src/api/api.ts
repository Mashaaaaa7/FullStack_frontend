import {
    ApiResponse,
    ActionHistory,
    GenerateQuestionRequest,
    QAGenerationResponse,
    FlashcardBatchCreate,
    Flashcard,
    PdfUploadResponse,
    PdfFlashcardGenerationResponse
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
    // Генерация Q&A пар из текста
    generateQAPairs: async (request: GenerateQuestionRequest): Promise<QAGenerationResponse> => {
        const response = await fetch(`${API_BASE_URL}/model/generate_qa_pairs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error('Ошибка генерации Q&A пар');
        }

        return response.json();
    },

    // Автоматическое создание карточек из PDF
    generateFlashcardsFromPdf: async (pdfFileId: number): Promise<PdfFlashcardGenerationResponse> => {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/model/generate_from_pdf/${pdfFileId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка генерации карточек из PDF');
        }

        return response.json();
    },

    // Создание нескольких карточек
    createFlashcardBatch: async (batch: FlashcardBatchCreate): Promise<ApiResponse<Flashcard[]>> => {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/model/create_flashcard_batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(batch),
        });

        if (!response.ok) {
            throw new Error('Ошибка создания карточек');
        }

        return response.json();
    },

    // Получение карточек пользователя
    getUserFlashcards: async (): Promise<ApiResponse<{ flashcards: Flashcard[] }>> => {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/model/flashcards`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Ошибка получения карточек');
        }

        return response.json();
    },

    // Загрузка PDF файла
    uploadPdf: async (file: File): Promise<PdfUploadResponse> => {
        const token = localStorage.getItem('auth_token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/pdf/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки файла');
        }

        return response.json();
    },

    // История действий (локальная)
    addToHistory: async (action: string, details: string, filename?: string, deck_name?: string): Promise<ApiResponse<void>> => {
        try {
            const savedHistory = localStorage.getItem('action_history');
            const history: ActionHistory[] = savedHistory ? JSON.parse(savedHistory) : [];

            const newAction: ActionHistory = {
                id: Date.now(),
                action,
                timestamp: new Date().toISOString(),
                details,
                filename,
                deck_name
            };

            history.unshift(newAction);
            localStorage.setItem('action_history', JSON.stringify(history.slice(0, 50)));

            return { success: true };
        } catch (error) {
            console.error('Error adding to history:', error);
            return { success: false };
        }
    },

    actionHistory: async (): Promise<ApiResponse<{ history: ActionHistory[] }>> => {
        try {
            const savedHistory = localStorage.getItem('action_history');
            const history: ActionHistory[] = savedHistory ? JSON.parse(savedHistory) : [];

            return {
                success: true,
                history
            };
        } catch (error) {
            console.error('Error fetching action history:', error);
            return {
                success: false,
                history: []
            };
        }
    }
};