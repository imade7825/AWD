import { fetchBookByIsbn, deleteBookByIsbn, updateBookByIsbn } from "./api.js";
import { removeIsbnFromFavorites } from "./favorites-state.js";

//DOM View Elemente
const detailTitleElement = document.getElementById("detail-title");
const detailAbstractElement = document.getElementById("detail-abstract");
const detailListElement = document.getElementById("detail-list");
const detailCoverElement = document.getElementById("detail-cover");

//DOM Buttons
const deleteBookButtonElement = document.getElementById("delete-book-button");
const editBookButtonElement = document.getElementById("edit-book-button");
const saveBookButtonElement = document.getElementById("save-book-button");
const cancelBookButtonElement = document.getElementById("cancel-edit-button");

//DOM Edit Form + Felder
const editFormElement = document.getElementById("edit-book-form");
const editTitleInput = document.getElementById("edit-title");
const editSubtitleInput = document.getElementById("edit-subtitle");
const editAuthorInput = document.getElementById("edit-author");
const editPublisherInput = document.getElementById("edit-publisher");
const editPagesInput = document.getElementById("edit-pages");
const editCoverInput = document.getElementById("edit-cover");
const editAbstractTextarea = document.getElementById("edit-abstract");
const editIsbnInput = document.getElementById("edit-isbn");

//State
let currentBookObject = null; //aktuell geladenes Buch
const currentIsbnFromUrl = getIsbnFromUrl();
let eventsWired = false; //verhindert doppeltes verdrahtens

//einstiegspunkt der seite
initializeBookDetailPage();

//Lädt das Buch, rendert View und füllt das Formular, leitet um falls kein usbn
function initializeBookDetailPage() {
  if (!currentIsbnFromUrl) {
    location.href = "index.html";
    return;
  }
  fetchBookByIsbn(currentIsbnFromUrl)
    .then((book) => {
      currentBookObject = book;
      renderReadView(book);
      fillEditFormFromBook(book);
      wireEventListenersOnce(); //Buttons/Events genau einmal verdrahten
    })
    .catch(handleBookDetailError);
}

//Helpers: url / events verdrahten

//Liest einmalig die isbn aus der url
function getIsbnFromUrl() {
  return new URLSearchParams(window.location.search).get("isbn");
}

//Verdrahtet Edit, Save, Cancel, Delete nur einmal
function wireEventListenersOnce() {
  if (eventsWired) return;
  eventsWired = true;

  if (deleteBookButtonElement) {
    deleteBookButtonElement.addEventListener("click", onDeleteBookClick);
  }

  if (editBookButtonElement) {
    editBookButtonElement.addEventListener("click", () => {
      enterEditMode();
      editTitleInput?.focus();
    });
  }

  if (cancelBookButtonElement) {
    cancelBookButtonElement.addEventListener("click", () => {
      exitEditMode();
    });
  }

  if (saveBookButtonElement) {
    saveBookButtonElement.addEventListener("click", onSaveBookClick);
  }
}

//View lesen und rendern

//Rendert die leseansicht (title, abstract, details, cover)
function renderReadView(book) {
  //Title + optionaler Untertitle
  detailTitleElement.innerHTML = `${book.title ?? ""}${
    book.subtitle ? `<br><small>${book.subtitle}</small>` : ""
  }`;
  //Abstract
  detailAbstractElement.textContent = book.abstract ?? "";

  //Deails
  detailListElement.innerHTML = `
    <li><strong>Author:</strong> ${book.author ?? "-"}</li>
    <li><strong>Publisher:</strong> ${book.publisher ?? "-"}</li>
    <li><strong>Pages:</strong> ${book.pages ?? "-"}</li>
    <li><strong>ISBN:</strong> ${book.isbn ?? "-"}</li>
  `;

  //Cover (api-feld "cover" bevorzugt, sonst fallback auf images/<isbn>.png)
  if (book.cover) {
    detailCoverElement.src = book.cover;
    detailCoverElement.alt = book.title ?? "Book cover";
  } else if (book.isbn) {
    detailCoverElement.src = `images/${book.isbn}.png`;
    detailCoverElement.alt = book.title ?? "Book cover";
  } else {
    detailCoverElement.src = "images/placeholder.png";
    detailCoverElement.alt = "No cover available!";
  }
}

//Befüllt das Formular mit den Buchdaten(für Edit-Modus)
function fillEditFormFromBook(book) {
  editTitleInput.value = String(book.title ?? "");
  editSubtitleInput.value = String(book.subtitle ?? "");
  editAuthorInput.value = String(book.author ?? "");
  editPublisherInput.value = String(book.publisher ?? "");
  editPagesInput.value = String(book.pages ?? "");
  editCoverInput.value = String(book.cover ?? "");
  editAbstractTextarea.value = String(book.abstract ?? "");
  editIsbnInput.value = String(book.isbn ?? "");
}

//Edit-Modus steuern

//Aktiviert den Edit-Modus (Form zeigen, Save/Cancel zeige, Edit verbergen)
function enterEditMode() {
  editFormElement.classList.remove("is-hidden");
  saveBookButtonElement.classList.remove("is-hidden");
  cancelBookButtonElement.classList.remove("is-hidden");
  editBookButtonElement.classList.add("is-hidden");
}

//Beendet den Edit-Modus ohne speichern
//(Form verstecken, Buttons zurücksetzen. View bleibt wie geladen)
function exitEditMode() {
  editFormElement.classList.add("is-hidden");
  saveBookButtonElement.classList.add("is-hidden");
  cancelBookButtonElement.classList.add("is-hidden");
  editBookButtonElement.classList.remove("is-hidden");

  //Formular wieder mit aktuellen Daten füllen (Änderungen verwerfen)
  if (currentBookObject) fillEditFormFromBook(currentBookObject);
}

//Liest die Wert aus dem Formular aus und baut das vorllständige Buchobjekt
//Für PUT(isbn bleibt unverändert)
function buildUpdateBookPayloadFromForm() {
  return {
    //Identifier nicht ändern
    isbn: currentBookObject.isbn,

    //Vollständige Felder für PUT
    title: String(editTitleInput.value || "").trim(),
    subtitle: String(editSubtitleInput.value || "").trim(),
    author: String(editAuthorInput.value || "").trim(),
    publisher: String(editPublisherInput.value || "").trim(),
    abstract: String(editAbstractTextarea.value || "").trim(),
    pages: editPagesInput.value ? Number(editPagesInput.value) : undefined,
    cover: String(editCoverInput.value || "").trim(),
  };
}

//Events: Save / Delete

//Speichert die Änderungen per PUT und lädt die Detailseite neu
async function onSaveBookClick() {
  //Mini-Validierung: Pflichtfelder nicht leer
  if (
    !editTitleInput.value.trim() ||
    !editAuthorInput.value.trim() ||
    !editPublisherInput.value.trim()
  ) {
    alert("Please fill in Title, Author and Publisher.");
    return;
  }

  //Vollständigen Objekt für PUT bauen
  const updatedPayLoad = buildUpdateBookPayloadFromForm();

  //PUT an die API (isbn bleibt die aus der URL)
  await updateBookByIsbn(currentIsbnFromUrl, updatedPayLoad);

  //Nach Erfolg die Seite auf die gleiche isbn neu laden(zeigt frische Daten)
  location.href = `detail.html?isbn=${encodeURIComponent(currentIsbnFromUrl)}`;
}

//Löscht das Buch nach Bestätigung, entfernt es aus Favoriten
//und geht zur Liste
async function onDeleteBookClick() {
  //Sicherheitsdialog
  const userConfirmed = confirm("Do you really want to delete this book?");
  if (!userConfirmed) return;

  //Server löschung durchführen
  const deleteBoockSucceeded = await deleteBookByIsbn(currentIsbnFromUrl);

  //Bei erfolg aus der favoritenliste im Browser entfernen
  if (deleteBoockSucceeded) {
    removeIsbnFromFavorites(currentIsbnFromUrl);
    //Navigiere zur Liste
    location.href = "index.html";
    return;
  }
  //Bei nicht erfolg
  alert("Deleting the book failed");
}

//Fehleranzeige
function handleBookDetailError(error) {
  console.error("Fehler beim Laden des Buch-Details:", error);
  detailTitleElement.textContent = "Book not found";
  detailAbstractElement.textContent = "";
  detailListElement.innerHTML = "";
  detailCoverElement.src = "images/placeholder.png";
  detailCoverElement.alt = "No cover available";
}
