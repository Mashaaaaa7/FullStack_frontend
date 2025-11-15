export interface Deck {
    id: number;
    name: string;
    file_size: number;
}

export interface Card {
    id?: number;
    question: string;
    answer: string;
    context?: string;
    source?: string;
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
}