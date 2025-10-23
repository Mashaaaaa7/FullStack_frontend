export interface Card {
    id: number;
    question: string;
    answer: string;
    deck_name: string;
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

export interface User {
    id: number;
    email: string;
    name?: string;
    theme?: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
}