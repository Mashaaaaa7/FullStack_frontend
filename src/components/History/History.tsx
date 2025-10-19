import React from "react";
import { useHistoryContext } from "../../Context/HistoryContext";
import "./History.css";

export const History: React.FC = () => {
    const { history } = useHistoryContext();

    if (history.length === 0) {
        return (
            <div className="history-container empty">
                <p>📭 История пуста — пока нет действий.</p>
            </div>
        );
    }

    return (
        <div className="history-container">
            <h2>🕓 История действий</h2>
            <ul className="history-list">
                {history.map((item, index) => (
                    <li key={index} className="history-item">
                        <div className="history-main">
                            <span className="history-action">{item.action}</span>
                            {item.deck && <span className="history-deck">({item.deck})</span>}
                            {item.cardsCount && (
                                <span className="history-cards">💳 {item.cardsCount} карточек</span>
                            )}
                        </div>
                        <div className="history-time">{item.timestamp}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
