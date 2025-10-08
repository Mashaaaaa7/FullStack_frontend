const API_URL = 'http://127.0.0.1:8000/api';

export async function uploadPDF(file: File) {
    const fd = new FormData();
    fd.append("pdf", file);

    const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: fd
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload error:', errorText);
        throw new Error(errorText);
    }
    return res.json();
}

export async function getDecks() {
    const res = await fetch(`${API_URL}/decks`);
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Get decks error:', errorText);
        throw new Error(errorText);
    }
    return res.json();
}

export async function createCards(filename: string) {
    console.log('Creating cards for:', filename);
    const encodedFilename = encodeURIComponent(filename);

    const res = await fetch(`${API_URL}/create_cards/${encodedFilename}`, {
        method: "POST"
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Create cards error:', errorText);
        throw new Error(errorText);
    }
    return res.json();
}

export async function deleteCards(filename: string) {
    const encodedFilename = encodeURIComponent(filename);
    const res = await fetch(`${API_URL}/delete_cards/${encodedFilename}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Delete cards error:', errorText);
        throw new Error(errorText);
    }
    return res.json();
}