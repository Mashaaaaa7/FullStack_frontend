export interface Deck {
    name: string;
    file_size: number;
    created_at: string;
}

export interface Card {
    id: string;
    question: string;
    answer: string;
    deck_name: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface UploadResponse {
    success: boolean;
    message: string;
    deck_name?: string;
}

export interface CardsResponse {
    success: boolean;
    cards: Card[];
    total: number;
    deck_name: string;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

export interface Deck {
    name: string;
    file_size: number;
    created_at: string;
}

export interface HistoryItem {
    id: string;
    type: 'upload' | 'create_cards';
    deck_name: string;
    timestamp: string;
    cards_count?: number;
    file_size?: number;
}