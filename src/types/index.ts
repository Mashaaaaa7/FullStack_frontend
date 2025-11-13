export interface Deck {
    id: number;
    name: string;
    file_size: number;
    created_at: string;
}

export interface Card {
    question: string;
    answer: string;
    id?: number;
}

export interface UploadResponse {
    success: boolean;
    filename: string;
    file_id: number;
    message: string;
}

export interface ActionHistory {
    id?: number;
    action: string;
    filename?: string;
    timestamp: string;
    details?: string;
}

export interface UserProfile {
    email: string;
    created_at: string;
}