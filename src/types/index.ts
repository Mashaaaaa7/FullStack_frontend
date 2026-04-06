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
    id?: number;
    action: string;
    filename?: string;
    timestamp: string;
    details?: string;
}

export interface GetMe {
    id: number;
    email: string;
    role: 'user' | 'admin';
    token: string;
}

export type Role = "user" | "admin";
//
export interface CurrentUser {
    id: number;
    username: string;
    role: Role;
    token: string;
}