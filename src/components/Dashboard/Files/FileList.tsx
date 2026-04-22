import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from "../../../hooks/useDebounce.ts";
import api, { pdfApi } from "../../../api/api.ts";
import { FileCard } from "./FileCard.tsx";
import { Pagination } from "./Pagination.tsx";
import toast from 'react-hot-toast';
import './Files.css';

export interface FileItem {
    id: number;
    file_name: string;
    size: number;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    created_at: string;
    owner_id: number;
    owner_email?: string;
}

interface FileListProps {
    onSelectFile?: (file: FileItem) => void;
    selectedFileId?: number | null;
    refreshTrigger?: number;
    onGenerateCards?: (file: FileItem) => void;
    onViewCards?: (file: FileItem) => void;
    processingFileId?: number | null;
}

export const FileList: React.FC<FileListProps> = ({
                                                      selectedFileId,
                                                      refreshTrigger,
                                                      onGenerateCards,
                                                      onViewCards,
                                                      processingFileId
                                                  }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'created_at_desc';

    const debouncedSearch = useDebounce(search, 500);

    const updateParams = (newParams: Record<string, string>) => {
        setSearchParams({ ...Object.fromEntries(searchParams), ...newParams });
    };

    const fetchFiles = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/pdf/list', {
                params: {
                    page,
                    limit,
                    status: status || undefined,
                    search: debouncedSearch || undefined,
                    sort,
                },
            });
            setFiles(response.data.items);
            setTotal(response.data.total);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [page, limit, status, debouncedSearch, sort, refreshTrigger]);

    const handleDeleteClick = (fileId: number) => {
        const file = files.find(f => f.id === fileId);
        if (file) {
            setFileToDelete(file);
            setDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        setDeleteModalOpen(false);
        try {
            await pdfApi.deleteFile(fileToDelete.id);
            await fetchFiles();
            toast.success('Файл удалён');
        } catch (err: any) {
            const detail = err.response?.data?.detail || 'Ошибка удаления';
            toast.error(detail);
        } finally {
            setFileToDelete(null);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateParams({ search: e.target.value, page: '1' });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ status: e.target.value, page: '1' });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ sort: e.target.value, page: '1' });
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ limit: e.target.value, page: '1' });
    };

    const handlePageChange = (newPage: number) => {
        updateParams({ page: String(newPage) });
    };


    return (
        <div className="files-container">
            {/* Форма фильтров */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label htmlFor="search">Поиск</label>
                    <input
                        id="search"
                        type="text"
                        className="filter-input"
                        placeholder="По названию"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="status">Статус</label>
                    <select
                        id="status"
                        className="filter-select"
                        value={status}
                        onChange={handleStatusChange}
                    >
                        <option value="">Все</option>
                        <option value="uploaded">Загружен</option>
                        <option value="processing">Обрабатывается</option>
                        <option value="processed">Обработан</option>
                        <option value="failed">Ошибка</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="sort">Сортировка</label>
                    <select
                        id="sort"
                        className="filter-select"
                        value={sort}
                        onChange={handleSortChange}
                    >
                        <option value="created_at_desc">Новые сначала</option>
                        <option value="created_at_asc">Старые сначала</option>
                        <option value="name_asc">По имени (А–Я)</option>
                        <option value="name_desc">По имени (Я–А)</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="limit">На странице</label>
                    <select
                        id="limit"
                        className="filter-select"
                        value={limit}
                        onChange={handleLimitChange}
                    >
                        <option value="6">6</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                    </select>
                </div>
            </div>

            {/* Список файлов */}
            {loading && <p>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="file-grid">
                {files.map(file => (
                    <FileCard
                        key={file.id}
                        file={file}
                        onDelete={handleDeleteClick}
                        onGenerate={onGenerateCards}
                        onView={onViewCards}
                        isSelected={file.id === selectedFileId}
                        processingFileId={processingFileId}
                    />
                ))}
            </div>

            {/* Пагинация */}
            <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={handlePageChange}
            />

            <div className={`modal ${deleteModalOpen ? 'show' : ''}`} style={{ display: deleteModalOpen ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>Подтверждение удаления</h3>
                        <button className="modal-close" onClick={() => setDeleteModalOpen(false)}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <div className="modal-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="1.5">
                                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="modal-text">Вы уверены, что хотите удалить файл?</p>
                        <p className="modal-subtext">{fileToDelete?.file_name}</p>
                        <p className="modal-subtext">Это действие нельзя будет отменить.</p>
                    </div>
                    <div className="modal-footer">
                        <button className="modal-btn modal-btn-cancel" onClick={() => setDeleteModalOpen(false)}>
                            Отмена
                        </button>
                        <button className="modal-btn modal-btn-delete" onClick={confirmDelete}>
                            <span className="delete-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                                </svg>
                            </span>
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};