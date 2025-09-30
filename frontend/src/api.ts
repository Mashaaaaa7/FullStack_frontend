export async function uploadPDF(file: File) {
    const fd = new FormData();
    fd.append("pdf", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
}

export async function getDecks() {
    const res = await fetch("/api/decks");
    if (!res.ok) throw new Error("Failed to get decks");
    return res.json();
}

export async function createCards(filename: string) {
    const res = await fetch(`/api/create_cards/${encodeURIComponent(filename)}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to create cards");
    return res.json();
}
