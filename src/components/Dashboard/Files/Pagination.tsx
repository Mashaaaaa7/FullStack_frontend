import React from 'react';
import './Files.css';

interface PaginationProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          page,
                                                          limit,
                                                          total,
                                                          onPageChange,
                                                      }) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                ← Назад
            </button>
            <div className="pagination-pages">
                {pages.map(p => (
                    <button
                        key={p}
                        className={`pagination-page ${page === p ? 'active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>
            <button
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Вперед →
            </button>
        </div>
    );
};