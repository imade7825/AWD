import { fetchBookByIsbn } from "./api.js";
import {
  loadFavoriteIsbnArray,
  removeIsbnFromFavorites,
  getFavoriteBooksCount,
} from "./favorites-state.js";

//DOM
const favoritesTableBodyElement = document.getElementById("favorites-tbody");
const favoritesPageCountElement = document.getElementById(
  "favorites-page-count"
);
const favoritesCountBadgeElement = document.getElementById("favorites-count");

//Seite initialisieren
initializeFavoritesPage();

function initializeFavoritesPage() {
  //Gespeicherte favoriten isbns aus dem browser lesen
  const favoriteIsbnArray = loadFavoriteIsbnArray();

  if (favoriteIsbnArray.length === 0) {
    renderFavoritesTableRows([]);
    updateCounts(0);
    return;
  }

  //Zu jeder isbn die buchdaten parallel laden
  Promise.all(favoriteIsbnArray.map((isbn) => fetchBookByIsbn(isbn))).then(
    (favoriteBooksArray) => {
      renderFavoritesTableRows(favoriteBooksArray);
      updateCounts(favoriteBooksArray.length);
    }
  );
}

//Tabelle rendern
function renderFavoritesTableRows(favoriteBooksArray) {
  //Pro Buch eine Tabellenzeile bauen mit remove button
  const tableRowsHtml = favoriteBooksArray
    .map(
      (book) => `
        <tr data-isbn="${book.isbn}">
            <td class="fav-col">
                <button 
                    class="button button-outline remove-favorite-button"
                    data-isbn="${book.isbn}"
                    title="Remove from favorites"
                >Remove</button>
                </td>
                <td class="title-col">${book.title}</td>
                <td class="isbn-col">${book.isbn}</td>
                <td class="author-col">${book.author}</td>
                <td class="publisher-col">${book.publisher}</td>
                <td class="detail-col">
                    <a class="button" href="detail.html?isbn=${encodeURIComponent(
                      book.isbn
                    )}">Detail</a>
                </td>
        </tr>
        `
    )
    .join("");
  favoritesTableBodyElement.innerHTML = tableRowsHtml;
}

//Klick auf "Remove" Event auf dem tbody
favoritesTableBodyElement.addEventListener("click", (event) => {
  //prüfe ob ein remove button gecklickt wurde
  const clickedRemoveButton = event.target.closest(".remove-favorite-button");
  if (!clickedRemoveButton) return;

  //isbn aus dem button lesen
  const isbnToRemove = clickedRemoveButton.dataset.isbn;

  //Aus dem favoriten state entfernen
  removeIsbnFromFavorites(isbnToRemove);

  //Tabellenzeile aus dem dom entfernen
  const tableRowElement = clickedRemoveButton.closest("tr");
  if (tableRowElement) tableRowElement.remove();

  //Zähler auf der seite im header aktualisieren
  
  const currentRowCount = favoritesTableBodyElement.rows.length;
  updateCounts(currentRowCount);
});

//Zähler aktualisieren
function updateCounts(currentFavoritesOnPage) {
  //Zahl im Seitentitle aktualisieren
  favoritesPageCountElement.textContent = String(currentFavoritesOnPage);

  // Badge im header mit globaler anzahl aus dem state aktualisieren
  favoritesCountBadgeElement.textContent = String(getFavoriteBooksCount());
}
