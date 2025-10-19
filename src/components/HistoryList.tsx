import React from "react";
import { useHistoryContext } from "../Context/HistoryContext";

export const HistoryList: React.FC = () => {
    const { history, clearHistory } = useHistoryContext();

    if (history.length === 0) return null;

    return (
        <div className="history-list">
            <h3>📜 История действий</h3>
            <button className="clear-btn" onClick={clearHistory}>Очистить историю</button>
            <ul>
                {history.map((item, idx) => (
                    <li key={idx}>
                        <span>{item.timestamp} — </span>
                        <span>{item.action}</span>
                        {item.deck && <span> ({item.deck})</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
