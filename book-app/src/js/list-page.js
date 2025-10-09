import { fetchAllBooks } from "./api.js";
import {
  isIsbnMarkedAsFavorite,
  toggleIsbnFavoriteStatus,
  getFavoriteBooksCount,
} from "./favorites-state.js";

const booksTableBodyElement = document.getElementById("books-tbody");
const booksCountElement = document.getElementById("books-count");
const titleSearchInputElement = document.getElementById("search");
const publisherFilterSelectElement = document.getElementById("by-publisher");
const favoritesCountBadgeElement = document.getElementById("favorites-count");

let allBooksArray = []; //Globale datenqulle

//Listner setzen
booksTableBodyElement.addEventListener("click", onFavoritesToggleCllick);
titleSearchInputElement.addEventListener(
  "input",
  applyTitleAndPublisherFilters
);
publisherFilterSelectElement.addEventListener(
  "change",
  applyTitleAndPublisherFilters
);

//Seite initialisieren
fetchAllBooks().then((loadedBooksArray) => {
  console.log('[List] Loaded books count:', loadedBooksArray.length);
  allBooksArray = loadedBooksArray;

  const uniquePublisherNamesArray = deriveUniquePublisherNames(allBooksArray);
  const initiallyFilteredBooks = filterBooksByTitle(allBooksArray, "");
  populatePublisherFilterOptions(uniquePublisherNamesArray);
  applyTitleAndPublisherFilters();
  renderBookTable(initiallyFilteredBooks);
  updateBooksCount(initiallyFilteredBooks.length);
  renderFavoritesCountBadge();
});

//hilfsfunktion zum rendern
function renderBookTable(booksArray) {
  //html für jede tebellenzeile erzeugen inkl. favoriten toggle
  const bookRowsHtml = booksArray
    .map((singleBook) => {
      //prüfe ob buch schon favorit ist
      const isFavorite = isIsbnMarkedAsFavorite(singleBook.isbn);

      return `
       <tr>
      <td class="fav-col">
      <button
            class="button button-clear favorite-toggle-button"
            data-isbn="${singleBook.isbn}"
            aria-pressed="${isFavorite}"
            title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
          >
            ${isFavorite ? "★" : "☆"}
          </button>
      </td> 
      <td class="title-col">${singleBook.title}</td>
      <td>${singleBook.isbn}</td>
      <td>${singleBook.author}</td>
      <td>${singleBook.publisher}</td>
      <td class="detail-col">
      <a class="button" href="detail.html?isbn=${encodeURIComponent(
        singleBook.isbn
      )}">
          Detail
        </a> 
      </td> 
    </tr>
  `;
    })
    .join("");

  booksTableBodyElement.innerHTML = bookRowsHtml;

  renderFavoritesCountBadge();
}

function filterBooksByTitle(booksArray, searchTerm) {
  const normalizedSearchTerm = String(searchTerm || "")
    .trim()
    .toLowerCase();
  if (normalizedSearchTerm === "") return booksArray;
  return booksArray.filter((singleBook) =>
    String(singleBook.title || "")
      .toLowerCase()
      .includes(normalizedSearchTerm)
  );
}

function filterBooksBySelectedPublisher(booksArray, selectedPublisherName) {
  const normalizedSelectedPublisher = String(selectedPublisherName || "")
    .trim()
    .toLowerCase();

  if (
    normalizedSelectedPublisher === "" ||
    normalizedSelectedPublisher === "-"
  ) {
    return booksArray; //kein filter benutzen
  }
  return booksArray.filter(
    (singleBook) =>
      (singleBook.publisher || "")
        .trim()
        .toLowerCase() === normalizedSelectedPublisher
  );
}

function applyTitleAndPublisherFilters() {
  const currentTitleSearchTerm = titleSearchInputElement.value;
  const currentSelectedPublisher = publisherFilterSelectElement.value;

  let filteredBooksArray = filterBooksByTitle(
    allBooksArray,
    currentTitleSearchTerm
  );
  filteredBooksArray = filterBooksBySelectedPublisher(
    filteredBooksArray,
    currentSelectedPublisher
  );
  renderBookTable(filteredBooksArray);
  updateBooksCount(filteredBooksArray.length);
}

function deriveUniquePublisherNames(booksArray) {
  const publisherNameSet = new Set(
    booksArray
      .map((singleBook) => String(singleBook.publisher || "").trim())
      .filter((publisherName) => publisherName.length > 0)
  );
  return Array.from(publisherNameSet).sort((a, b) => a.localeCompare(b));
}

function populatePublisherFilterOptions(uniquePublisherNamesArray) {
  publisherFilterSelectElement.innerHTML = `<option value="-">-</option>${uniquePublisherNamesArray
    .map(
      (publisherName) =>
        `<option value="${publisherName}">${publisherName}</option>`
    )
    .join("")}`;
}

function updateBooksCount(numberOfBooks) {
  if (booksCountElement) booksCountElement.textContent = String(numberOfBooks);
}

//Aktualisiert die zahl der favoriten
function renderFavoritesCountBadge() {
  favoritesCountBadgeElement.textContent = String(getFavoriteBooksCount());
}

function onFavoritesToggleCllick(event) {
  const clickedToggleButton = event.target.closest(".favorite-toggle-button");
  if (!clickedToggleButton) return;
  const isbnFromButton = clickedToggleButton.dataset.isbn;
  toggleIsbnFavoriteStatus(isbnFromButton);
  const nowFavorite = isIsbnMarkedAsFavorite(isbnFromButton);
  clickedToggleButton.innerHTML = nowFavorite ? "★" : "☆";
  clickedToggleButton.setAttribute("aria-pressed", String(nowFavorite));
  clickedToggleButton.title = nowFavorite
    ? "Remove from favorites"
    : "Add to favorites";
  renderFavoritesCountBadge();
}
