export interface Deck {
    id: number;
    name: string;
    size?: number;
    status?: string;
    created_at?: string;
    owner_id?: number;
    owner_email?: string;
}

export interface Card {
    id?: number;
    question: string;
    answer: string;
    context?: string;
    source?: string;
    is_hidden?: boolean;
    is_deleted?: boolean;
}

export interface UploadResponse {
    success: boolean;
    filename: string;
    file_id: number;
    message: string;
}

export interface ActionHistory {
    created_at: string;
    id?: number;
    action: string;
    filename?: string;
    timestamp: string;
    details?: string;
}

export interface Definition {
    partOfSpeech: string;
    definition: string;
    example?: string;
}

export interface DictionaryData {
    word: string;
    phonetic: string | null;
    definitions: Definition[];
}

export type Role = 'user' | 'admin';

export interface CurrentUser {
    user_id: number;
    email: string;
    role: Role;
}