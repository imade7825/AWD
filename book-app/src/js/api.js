const API_BASE_URL = "http://localhost:4730";

export async function mainFetch(path = "", options = {}) {
  return fetch(API_BASE_URL + path, options).then((response) =>
    response.json()
  );
}

export async function fetchAllBooks() {
  const path = "/books";
  return mainFetch(path);
}

export async function fetchBookByIsbn(isbn) {
  return mainFetch(`/books/${encodeURIComponent(isbn)}`);
}

export async function createBook(newBookObject) {
  //Anfrage an den server schicken (json-body, post-mehode)
  const createdBook = await mainFetch("/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newBookObject),
  });

  return createdBook;
}

export async function deleteBookByIsbn(isbn) {
  //Ziel-url zusammensetzen
  const targetUrl = `${API_BASE_URL}/books/${encodeURIComponent(isbn)}`;

  //Delete-request ohne body
  const response = await fetch(targetUrl, { method: "DELETE" });
  //Erfolge zurückmelden
  return response.ok;
}

export async function updateBookByIsbn(isbn, fullBookObject) {
  const url = `${API_BASE_URL}/books/${encodeURIComponent(isbn)}`;

  const response = await fetch(url, {
    method: "PUT", //vollständiges ersetzen
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fullBookObject),
  });
  const updatedBook = await response.json();
  return updatedBook;
}
