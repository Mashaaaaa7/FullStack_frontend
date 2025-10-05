import React, { useEffect, useState } from "react";
import { uploadPDF, getDecks, createCards, deleteCards } from "./api"; // импортируем все API функции

export default function MainPage() {
    // ------------------------
    // Состояния компонента
    // ------------------------
    const [file, setFile] = useState<File | null>(null); // выбранный PDF
    const [decks, setDecks] = useState<{name:string}[]>([]); // список загруженных файлов
    const [cards, setCards] = useState<{question:string,answer:string}[]>([]); // карточки
    const [status, setStatus] = useState<string>(""); // статус загрузки/генерации/удаления

    // ------------------------
    // Загружаем список файлов при монтировании
    // ------------------------
    useEffect(() => { loadDecks(); }, []);

    async function loadDecks() {
        try {
            const data = await getDecks();
            setDecks(data.decks || []);
        } catch (e) {
            console.error(e);
            setStatus("Ошибка при загрузке файлов");
        }
    }

    // ------------------------
    // Загрузка PDF на сервер
    // ------------------------
    async function onUpload() {
        if (!file) { alert("Выберите PDF"); return; }
        setStatus("Загружаю...");
        try {
            await uploadPDF(file);
            setStatus("Файл загружен");
            setFile(null);
            await loadDecks(); // обновляем список файлов
        } catch (e) {
            console.error(e);
            setStatus("Ошибка загрузки");
        }
    }

    // ------------------------
    // Генерация карточек для выбранного файла
    // ------------------------
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

    // ------------------------
    // Удаление набора карточек и файла
    // ------------------------
    async function onDeleteCards(name: string) {
        if (!window.confirm(`Удалить ${name}?`)) return; // подтверждение
        try {
            await deleteCards(name); // вызов API
            setDecks(decks.filter(d => d.name !== name)); // обновляем список файлов
            setStatus(`${name} удалён`);
            setCards([]); // очищаем карточки, если удалили текущий набор
        } catch (e) {
            console.error(e);
            setStatus("Ошибка удаления");
        }
        setDeletedDecks(prev => [...prev, name]);

        const [deletedDecks, setDeletedDecks] = useState<string[]>([]);

    }

        // ------------------------
    // Скачивание всех карточек в JSON
    // ------------------------
    function downloadJSON() {
        const blob = new Blob([JSON.stringify(cards, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cards.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // ------------------------
    // JSX-разметка
    // ------------------------
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
                            <button className="button danger" onClick={() => onDeleteCards(d.name)}>Удалить</button>
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
