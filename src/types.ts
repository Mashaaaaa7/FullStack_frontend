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

export interface UploadResponse {
    success: boolean;
    message: string;
    filename?: string;
}

export interface CardsResponse {
    success: boolean;
    cards: Card[];
    deck_name: string;
    total: number;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}