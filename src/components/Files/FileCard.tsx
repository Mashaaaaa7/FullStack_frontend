import React from 'react';
import { useAuth } from "../../Context/AuthContext.tsx";
import api from "../../api/api.ts";
import { FileItem } from './FileList';

interface FileCardProps {
    file: FileItem;
    onDelete: (id: number) => void;
    onGenerate?: (file: FileItem) => void;
    onView?: (file: FileItem) => void;
    isSelected?: boolean;
    processingFileId?: number | null;
}

export const FileCard: React.FC<FileCardProps> = ({
                                                      file,
                                                      onDelete,
                                                      onGenerate,
                                                      onView,
                                                      isSelected,
                                                      processingFileId
                                                  }) => {
    const { user } = useAuth();

    const handleDownload = async () => {
        try {
            const response = await api.get(`/pdf/${file.id}/download`);
            const { download_url } = response.data;
            window.open(download_url, '_blank');
        } catch (error) {
            alert('Не удалось скачать файл');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Удалить файл?')) {
            try {
                await api.delete(`/pdf/${file.id}`);
                onDelete(file.id);
            } catch (error) {
                alert('Ошибка при удалении');
            }
        }
    };

    return (
        <div className={`file-card ${isSelected ? 'selected' : ''}`}>
            <h3>{file.file_name}</h3>
            <div className="file-info">
                {user?.role === 'admin' && file.owner_email && (
                    <p>Владелец: {file.owner_email}</p>
                )}
            </div>
            <div className="file-actions">
                {onGenerate && (
                    <button
                        className="file-btn generate"
                        onClick={() => onGenerate(file)}
                        disabled={processingFileId === file.id}
                        title="Создать карточки"
                    >
                        ✨
                    </button>
                )}
                {onView && (
                    <button className="file-btn view" onClick={() => onView(file)} title="Просмотр карточек">
                        👁️
                    </button>
                )}
                <button className="file-btn download" onClick={handleDownload}>Скачать</button>
                <button className="file-btn delete" onClick={handleDelete}>Удалить</button>
            </div>
        </div>
    );
};