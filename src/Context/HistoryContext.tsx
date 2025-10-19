import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface HistoryItem {
    action: string;
    deck: string;
    timestamp: Date;
}

interface HistoryContextType {
    history: HistoryItem[];
    addHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
    clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    const addHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
        console.log('Adding history:', item); // Добавим лог для отладки
        setHistory(prev => {
            const newHistory = [...prev, { ...item, timestamp: new Date() }];
            console.log('New history state:', newHistory);
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <HistoryContext.Provider value={{ history, addHistory, clearHistory }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistoryContext = () => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistoryContext must be used within a HistoryProvider');
    }
    return context;
};