export interface Deck {
    id: number;
    name: string;           // ✅ Было "file_name", теперь "name"
    file_size: number;      // ✅ Было другое имя
    created_at: string;     // ✅ ISO строка
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
    action: string;  // 'upload', 'view', 'delete'
    filename?: string;
    timestamp: string;  // ISO string
    details?: string;
}

export interface UserProfile {
    email: string;
    created_at: string;
}