
import React, { useEffect, useState } from "react";
import { uploadPDF, getDecks, createCards } from "./api";

export default function MainPage() {
    const [file, setFile] = useState<File | null>(null);
    const [decks, setDecks] = useState<{name:string}[]>([]);
    const [cards, setCards] = useState<{question:string,answer:string}[]>([]);
    const [status, setStatus] = useState<string>("");

    useEffect(() => { loadDecks(); }, []);

    async function loadDecks() {
        try {
            const data = await getDecks();
            setDecks(data.decks || []);
        } catch (e) {
            console.error(e);
        }
    }

    async function onUpload() {
        if (!file) { alert("Выберите PDF"); return; }
        setStatus("Загружаю...");
        try {
            await uploadPDF(file);
            setStatus("Файл загружен");
            setFile(null);
            await loadDecks();
        } catch (e) {
            console.error(e);
            setStatus("Ошибка загрузки");
        }
    }

    async function onCreateCards(name:string) {
        setStatus("Генерация карточек...");
        try {
            const data = await createCards(name);
            setCards(data.cards || []);
            setStatus("Карточки готовы");
        } catch (e) {
            console.error(e);
            setStatus("Ошибка генерации");
        }
    }

    function downloadJSON() {
        const blob = new Blob([JSON.stringify(cards, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "cards.json"; a.click(); URL.revokeObjectURL(url);
    }

    return (
        <>
            <div className="header">
                <h1>Учебные карточки</h1>
                <div>
                    <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                    <button className="button primary" onClick={onUpload}>Загрузить PDF</button>
                    <span className="status">{status}</span>
                </div>
            </div>

            <h2>Загруженные файлы:</h2>
            <div>
                {decks.length === 0 && <div>Пока нет файлов</div>}
                {decks.map(d => (
                    <div key={d.name} className="deck-item">
                        <div>{d.name}</div>
                        <div>
                            <button className="button success" onClick={() => onCreateCards(d.name)}>Создать карточки</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cards">
                <h2>Карточки</h2>
                {cards.length === 0 && <div>Нет карточек (сгенерируйте их)</div>}
                {cards.map((c, i) => (
                    <div key={i} className="card">
                        <div className="question" onClick={(e)=> {
                            const ans = (e.currentTarget.nextSibling as HTMLElement);
                            if (ans) ans.classList.toggle("show");
                        }}>{c.question}</div>
                        <div className="answer">{c.answer}</div>
                    </div>
                ))}
                {cards.length>0 && <button className="button" onClick={downloadJSON}>Скачать все (JSON)</button>}
            </div>
        </>
    );
}
