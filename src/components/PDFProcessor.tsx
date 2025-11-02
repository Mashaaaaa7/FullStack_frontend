import React, { useState, ChangeEvent, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { api } from '../api/api';
import {
    Flashcard,
    TextChunk,
    GenerateQuestionRequest,
    QAGenerationResponse,
    QAPair,
    PdfUploadResponse,
    PdfFlashcardGenerationResponse
} from '../types';
import './PdfProcessor.css';

const PdfProcessor: React.FC = () => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [textChunks, setTextChunks] = useState<TextChunk[]>([]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentText, setCurrentText] = useState<string>('');
    const [generatedQAPairs, setGeneratedQAPairs] = useState<QAPair[]>([]);
    const [currentPdfFileId, setCurrentPdfFileId] = useState<number | null>(null);
    const [autoGenerateMode, setAutoGenerateMode] = useState<boolean>(true);

    useEffect(() => {
        loadUserFlashcards();
    }, []);

    const loadUserFlashcards = async (): Promise<void> => {
        try {
            const response = await api.getUserFlashcards();
            if (response.success && response.flashcards) {
                const formattedFlashcards: Flashcard[] = response.flashcards.map((card: Flashcard) => ({
                    ...card,
                    timestamp: card.created_at || new Date().toLocaleString('ru-RU')
                }));
                setFlashcards(formattedFlashcards);
            }
        } catch (error) {
            console.error('Error loading flashcards:', error);
        }
    };

    // Автоматическая генерация карточек из PDF
    const handleAutoGenerateFromPdf = async (): Promise<void> => {
        if (!currentPdfFileId) {
            alert('Сначала загрузите PDF файл');
            return;
        }

        try {
            setLoading(true);
            const response: PdfFlashcardGenerationResponse = await api.generateFlashcardsFromPdf(currentPdfFileId);

            if (response.success) {
                const newFlashcards: Flashcard[] = response.flashcards.map((card: Flashcard) => ({
                    ...card,
                    timestamp: card.created_at || new Date().toLocaleString('ru-RU')
                }));

                setFlashcards(prev => [...prev, ...newFlashcards]);

                await api.addToHistory(
                    'AUTO_GENERATE_FLASHCARDS',
                    `Автоматически создано ${response.flashcards.length} карточек из PDF`,
                    selectedFile?.name,
                    'Основная колода'
                );

                alert(`✅ Создано ${response.flashcards.length} карточек автоматически!`);
            }
        } catch (error) {
            console.error('Ошибка автоматической генерации:', error);
            alert('Ошибка автоматической генерации карточек');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка PDF и автоматическая генерация
    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        try {
            setLoading(true);
            const response: PdfUploadResponse = await api.uploadPdf(file);

            if (response.success && response.file_id) {
                setCurrentPdfFileId(response.file_id);

                if (response.chunks) {
                    const chunks: TextChunk[] = response.chunks.map((chunk: string, index: number) => ({
                        text: chunk,
                        index: index
                    }));
                    setTextChunks(chunks);
                }

                // Автоматически генерируем карточки если включен режим
                if (autoGenerateMode && response.file_id) {
                    await handleAutoGenerateFromPdf();
                }

                await api.addToHistory(
                    'PDF_UPLOAD',
                    `Загружен PDF файл: ${file.name}`,
                    file.name
                );
            }

        } catch (error) {
            console.error('Ошибка при загрузке PDF:', error);
            alert('Ошибка при загрузке PDF файла');
        } finally {
            setLoading(false);
        }
    };

    // Генерация Q&A пар из текста
    const generateQAPairs = async (text: string): Promise<void> => {
        if (!text.trim()) {
            alert('Введите текст для генерации карточек');
            return;
        }

        try {
            setLoading(true);
            setCurrentText(text);

            const requestData: GenerateQuestionRequest = {
                text,
                pdf_file_id: currentPdfFileId || undefined
            };

            const response: QAGenerationResponse = await api.generateQAPairs(requestData);
            setGeneratedQAPairs(response.qa_pairs);

            await api.addToHistory(
                'QA_PAIRS_GENERATED',
                `Сгенерировано ${response.qa_pairs.length} Q&A пар из текста`,
                undefined,
                'Основная колода'
            );

        } catch (error) {
            console.error('Ошибка при генерации Q&A пар:', error);
            alert('Ошибка при генерации вопросов и ответов');
        } finally {
            setLoading(false);
        }
    };

    // Сохранение сгенерированных Q&A пар как карточек
    const saveQAPairsAsFlashcards = async (): Promise<void> => {
        if (generatedQAPairs.length === 0) {
            alert('Нет Q&A пар для сохранения');
            return;
        }

        try {
            const response = await api.createFlashcardBatch({
                flashcards: generatedQAPairs,
                pdf_file_id: currentPdfFileId || undefined
            });

            if (response.success && response.data) {
                const newFlashcards: Flashcard[] = response.data.map((card: Flashcard) => ({
                    ...card,
                    timestamp: card.created_at || new Date().toLocaleString('ru-RU')
                }));

                setFlashcards(prev => [...prev, ...newFlashcards]);
                setGeneratedQAPairs([]);
                setCurrentText('');

                await api.addToHistory(
                    'FLASHCARDS_BATCH_CREATED',
                    `Создано ${newFlashcards.length} карточек из Q&A пар`,
                    undefined,
                    'Основная колода'
                );

                alert(`✅ Сохранено ${newFlashcards.length} карточек!`);
            }
        } catch (error) {
            console.error('Ошибка при сохранении карточек:', error);
            alert('Ошибка при сохранении карточек');
        }
    };

    // Ручной ввод текста
    const handleManualTextSubmit = (): void => {
        if (currentText.trim()) {
            generateQAPairs(currentText).catch(error => {
                console.error('Error generating Q&A pairs:', error);
            });
        }
    };

    // Удаление карточки
    const deleteFlashcard = async (id: number, question: string): Promise<void> => {
        setFlashcards(prev => prev.filter(card => card.id !== id));
        await api.addToHistory(
            'FLASHCARD_DELETED',
            `Удалена карточка: ${question.substring(0, 50)}...`,
            undefined,
            'Основная колода'
        );
    };

    return (
        <div className="pdf-processor">
            <div className="processor-header">
                <h1>🎴 Автоматическое создание учебных карточек</h1>
                <p>Загрузите PDF - система автоматически создаст вопросы и ответы</p>
                {user && (
                    <div className="user-welcome">
                        Добро пожаловать, {user.username || user.email}!
                    </div>
                )}
            </div>

            <div className="processor-grid">
                {/* Левая колонка - ввод данных */}
                <div className="input-section">
                    {/* Настройки */}
                    <div className="settings-card">
                        <h3>⚙️ Настройки генерации</h3>
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={autoGenerateMode}
                                onChange={(e) => setAutoGenerateMode(e.target.checked)}
                            />
                            Автоматически создавать карточки при загрузке PDF
                        </label>
                    </div>

                    {/* Загрузка PDF */}
                    <div className="upload-card">
                        <h3>📄 Загрузите PDF файл</h3>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            className="file-input"
                            disabled={loading}
                        />
                        {selectedFile && (
                            <p className="file-info">Выбран файл: {selectedFile.name}</p>
                        )}
                        {currentPdfFileId && (
                            <p className="file-id">ID файла: {currentPdfFileId}</p>
                        )}
                        {loading && <div className="loading-indicator">Обработка файла...</div>}

                        {currentPdfFileId && !autoGenerateMode && (
                            <button
                                onClick={handleAutoGenerateFromPdf}
                                disabled={loading}
                                className="auto-generate-btn"
                            >
                                🚀 Автоматически создать карточки из PDF
                            </button>
                        )}
                    </div>

                    {/* Ручной ввод текста */}
                    <div className="manual-input-card">
                        <h3>✏️ Или введите текст для генерации карточек</h3>
                        <textarea
                            value={currentText}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCurrentText(e.target.value)}
                            placeholder="Введите текст - система создаст вопросы и ответы..."
                            rows={6}
                            className="text-input"
                            disabled={loading}
                        />
                        <button
                            onClick={handleManualTextSubmit}
                            disabled={loading || !currentText.trim()}
                            className="generate-btn"
                        >
                            {loading ? '🔄 Генерация...' : '🎯 Сгенерировать Q&A пары'}
                        </button>
                    </div>

                    {/* Результат генерации Q&A пар */}
                    {generatedQAPairs.length > 0 && (
                        <div className="generation-card">
                            <h3>✅ Сгенерировано {generatedQAPairs.length} Q&A пар</h3>
                            <div className="qa-pairs-list">
                                {generatedQAPairs.map((pair: QAPair, index: number) => (
                                    <div key={index} className="qa-pair-item">
                                        <div className="question-section">
                                            <strong>Вопрос {index + 1}:</strong>
                                            <p>{pair.question}</p>
                                        </div>
                                        <div className="answer-section">
                                            <strong>Ответ:</strong>
                                            <p>{pair.answer}</p>
                                        </div>
                                        {pair.confidence && (
                                            <div className="confidence-section">
                                                <strong>Уверенность:</strong>
                                                <span>{(pair.confidence * 100).toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={saveQAPairsAsFlashcards}
                                className="save-all-btn"
                                disabled={loading}
                            >
                                💾 Сохранить все карточки ({generatedQAPairs.length})
                            </button>
                        </div>
                    )}
                </div>

                {/* Правая колонка - результаты */}
                <div className="results-section">
                    {/* Статистика */}
                    <div className="stats-card">
                        <h3>📊 Статистика</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{flashcards.length}</span>
                                <span className="stat-label">Всего карточек</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{textChunks.length}</span>
                                <span className="stat-label">Фрагментов текста</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{generatedQAPairs.length}</span>
                                <span className="stat-label">Сгенерировано пар</span>
                            </div>
                        </div>
                    </div>

                    {/* Созданные карточки */}
                    {flashcards.length > 0 && (
                        <div className="flashcards-card">
                            <h3>🎴 Мои карточки ({flashcards.length})</h3>
                            <div className="flashcards-list">
                                {flashcards.map((card: Flashcard) => (
                                    <div key={card.id} className="flashcard-item">
                                        <div className="flashcard-content">
                                            <div className="flashcard-front">
                                                <strong>В:</strong> {card.question}
                                            </div>
                                            <div className="flashcard-back">
                                                <strong>О:</strong> {card.answer}
                                            </div>
                                            <div className="flashcard-meta">
                                                Создано: {card.timestamp}
                                                {card.pdf_file_id && ` • Из PDF`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteFlashcard(card.id, card.question)}
                                            className="delete-btn"
                                            title="Удалить карточку"
                                            disabled={loading}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdfProcessor;