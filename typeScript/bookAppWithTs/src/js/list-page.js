import { fetchAllBooks } from "./api.js";
//Dom referenezen streng typisieren
const booksTableBodyElement = document.getElementById("books-tbody");
const booksCountElement = document.getElementById("books-count");
//später für filter
const titleSearchInputElement = document.getElementById("search");
const publisherFilterSelectElement = document.getElementById("by-publisher");
//Globale Datenquelle, klar typisiert
let allBooksArray = [];
//Einstiegspunkt Bücher laden und minimal rendern
initializeListPage();
async function initializeListPage() {
    if (!booksTableBodyElement || !booksCountElement)
        return;
    //Daten von der Api holen
    allBooksArray = await fetchAllBooks();
    //Publisher optionen aus den Daten ableiten und select füllen
    const uniquePublisherNames = deriveUniquePublisherNames(allBooksArray);
    populatePublisherFilterOptions(uniquePublisherNames);
    //Initialen Filterlauf(leer Titel, "-" Publisher) rendert & zählt
    applyTitleAndPublisherFilters();
}
//Baut die Tabellenzeilen zusammen und setzt sie ins <tbody>
function renderBookTable(books) {
    if (!booksTableBodyElement)
        return;
    const rowsHtml = books
        .map((book) => `
    <tr>
      <td class="fav-col"></td>
      <td class="title-col">${book.title}</td>
      <td>${book.isbn}</td>
      <td>${book.author}</td>
      <td>${book.publisher}</td>
      <td class="detail-col">
        <a class="button" href="detail.html?isbn=${encodeURIComponent(book.isbn)}">Detail</a>
      </td>
    </tr>
  `)
        .join("");
    booksTableBodyElement.innerHTML = rowsHtml;
}
//Zeigt die Anzahl der aktuell dargestellten Bücher
function updateBooksCount(numberOfBooks) {
    if (!booksCountElement)
        return;
    booksCountElement.textContent = String(numberOfBooks);
}
//Filtert nach Titel case-insensitive. leer kein filter
function filterBooksByTitle(books, rawSearchTerm) {
    const normalizedSearchTerm = String(rawSearchTerm || "")
        .trim()
        .toLowerCase();
    if (normalizedSearchTerm === "")
        return books;
    return books.filter((singleBook) => String(singleBook.title || "")
        .toLowerCase()
        .includes(normalizedSearchTerm));
}
//Filtert nach Publischer
function filterBooksBySelectedPublisher(books, rawSelectedPublisher) {
    const normalizedSelectedPublisher = String(rawSelectedPublisher || "")
        .trim()
        .toLocaleLowerCase();
    if (normalizedSelectedPublisher === "" || normalizedSelectedPublisher === "-")
        return books;
    return books.filter((singleBook) => String(singleBook.publisher || "")
        .trim()
        .toLowerCase() === normalizedSelectedPublisher);
}
//Eindeutige publisher namen ohne leerstring, alphabetisch sortiert
function deriveUniquePublisherNames(books) {
    const publisherNameSet = new Set(books
        .map((book) => String(book.publisher || "").trim())
        .filter((name) => name.length > 0));
    return Array.from(publisherNameSet).sort((a, b) => a.localeCompare(b));
}
//<select mit Optionen befüllen (erste Option ist "-")
function populatePublisherFilterOptions(uniquePublisherNames) {
    if (!publisherFilterSelectElement)
        return;
    const optionsHtml = [
        `<option value="-">-</option>`,
        ...uniquePublisherNames.map((name) => `<option value="${name}">${name}</option>`),
    ].join("");
    publisherFilterSelectElement.innerHTML = optionsHtml;
}
//Liest UI-Werte , wendet beide Filter an, rendert und aktualisiert die Anzahl
function applyTitleAndPublisherFilters() {
    if (!booksTableBodyElement || !booksCountElement)
        return;
    const currentTitleSearchTerm = titleSearchInputElement?.value ?? "";
    const currentSelectedPublisher = publisherFilterSelectElement?.value ?? "-";
    let filteredBooks = filterBooksByTitle(allBooksArray, currentTitleSearchTerm);
    filteredBooks = filterBooksBySelectedPublisher(filteredBooks, currentSelectedPublisher);
    renderBookTable(filteredBooks);
    updateBooksCount(filteredBooks.length);
}
//Filter Erreignisse verdrahten
titleSearchInputElement?.addEventListener("input", applyTitleAndPublisherFilters);
publisherFilterSelectElement?.addEventListener("change", applyTitleAndPublisherFilters);
//# sourceMappingURL=list-page.js.map