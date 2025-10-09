export const API_BASE_URL = "http://localhost:4730";
export async function mainFetch(path = "", options = {}) {
    const response = await fetch(API_BASE_URL + path, options);
    return response.json();
}
//Alle Bücher laden
export async function fetchAllBooks() {
    return mainFetch("/books");
}
// Buch anhand der isben laden
export async function fetchBookByIsbn(isbn) {
    return mainFetch(`/books/${encodeURIComponent(isbn)}`);
}
//Buch erstellen
export async function createBook(payload) {
    return mainFetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}
//Buch aktualisieren per isbn
export async function updateBookByIsbn(isbn, fullBookObject) {
    return mainFetch(`/books/${encodeURIComponent(isbn)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullBookObject),
    });
}
//Buch löschen
export async function deleteBookByIsbn(isbn) {
    const targetUrl = `${API_BASE_URL}/books/${encodeURIComponent(isbn)}`;
    const response = await fetch(targetUrl, { method: "DELETE" });
    return response.ok;
}
//# sourceMappingURL=api.js.map