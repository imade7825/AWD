import type { Book, Isbn, CreateBookPayload, UpdateBookPayload, books } from "../types/book";

export const API_BASE_URL: string = "http://localhost:4730";

export async function mainFetch<TResponse>(
  path: string = "",
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(API_BASE_URL + path, options);
  return response.json() as Promise<TResponse>;
}

//Alle Bücher laden
export async function fetchAllBooks(): Promise<Book[]> {
  return mainFetch<Book[]>("/books");
}

// Buch anhand der isben laden
export async function fetchBookByIsbn(isbn: Isbn) {
  return mainFetch<Book>(`/books/${encodeURIComponent(isbn)}`);
}
//Buch erstellen
export async function createBook(payload: CreateBookPayload): Promise<Book> {
  return mainFetch<Book>("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

//Buch aktualisieren per isbn
export async function updateBookByIsbn(
  isbn: Isbn,
  fullBookObject: UpdateBookPayload
): Promise<Book> {
  return mainFetch<Book>(`/books/${encodeURIComponent(isbn)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullBookObject),
  });
}

//Buch löschen
export async function deleteBookByIsbn(isbn: Isbn): Promise<boolean> {
  const targetUrl = `${API_BASE_URL}/books/${encodeURIComponent(isbn)}`;
  const response = await fetch(targetUrl, { method: "DELETE" });
  return response.ok;
}
