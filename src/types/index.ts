// User types
export interface User {
    id: number;
    email: string;
    username: string;
}

export interface UserProfile {
    id: number;
    email: string;
    created_at: string;
    last_login?: string;
}

// Card types (ваши существующие + наши новые)
export interface Card {
    id: number;
    question: string;
    answer: string;
    deck_name: string;
    created_at?: string;
    timestamp?: string;
    pdf_file_id?: number;
}

export interface Flashcard {
    id: number;
    question: string;
    answer: string;
    timestamp: string;
    created_at?: string;
    pdf_file_id?: number;
    deck_id?: number;
    deck_name?: string;
}

export interface Deck {
    name: string;
    file_size: number;
    created_at: string;
    total_cards?: number;
}

// PDF types
export interface PDFFile {
    id: number;
    filename: string;
    file_path: string;
    user_id: number;
    uploaded_at: string;
    processed: boolean;
    deck_name?: string;
}

export interface TextChunk {
    text: string;
    index: number;
}

// Q&A Generation types
export interface QAPair {
    question: string;
    answer: string;
    confidence?: number;
    deck_name?: string;
}

export interface GenerateQuestionRequest {
    text: string;
    pdf_file_id?: number;
    deck_name?: string;
}

export interface QAGenerationResponse {
    qa_pairs: QAPair[];
    original_text: string;
}

export interface FlashcardBatchCreate {
    flashcards: QAPair[];
    pdf_file_id?: number;
    deck_name?: string;
}

// API Response types (ваши существующие + наши новые)
export interface UploadResponse {
    success: boolean;
    message: string;
    filename?: string;
    file_id?: number;
    chunks?: string[];
    deck_name?: string;
}

export interface PdfUploadResponse {
    success: boolean;
    message: string;
    filename?: string;
    file_id?: number;
    chunks?: string[];
    deck_name?: string;
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

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    history?: ActionHistory[];
    error?: string;
    flashcards?: Flashcard[];
    cards?: Card[];
    deck_name?: string;
    total?: number;
}

export interface PdfFlashcardGenerationResponse {
    success: boolean;
    message: string;
    flashcards: Flashcard[];
    cards?: Card[];
    deck_name?: string;
}

// History types
export interface ActionHistory {
    id?: number;
    action: string;
    deck_name?: string;
    filename?: string;
    timestamp: string;
    details: string;
}