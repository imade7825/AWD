import { createBook } from "./api.js";

//DOM referenzen (form und felder)
//Formular
const addBookFormElement = document.getElementById("add-book-form");

//Einzelne eingaben
const titleInputElement = document.getElementById("title");
const isbnInputElement = document.getElementById("isbn");
const authorInputElement = document.getElementById("author");
const publisherInputElement = document.getElementById("publisher");
const subtitleInputElement = document.getElementById("subtitle");
const abstractInputElement = document.getElementById("abstract");
const pagesInputElement = document.getElementById("pages");
const coverInputElement = document.getElementById("cover");

//Submit-handler registrieren
addBookFormElement.addEventListener("submit", async (event) => {
  //Standard verhalten (seiten reload verhindern)
  event.preventDefault();

  //Werte aus dem Formular einsammeln und Datensatz aufbauen
  const newBookObject = {
    //Pflichtfelder
    title: String(titleInputElement.value || "").trim(),
    isbn: String(isbnInputElement.value || "").trim(),
    author: String(authorInputElement.value || ""),
    publisher: String(publisherInputElement.value || "").trim(),

    //optional (leere Strings sind ok)
    subtitle: String(subtitleInputElement.value || "").trim(),
    abstract: String(abstractInputElement.value || "").trim(),
    pages: pagesInputElement.value
      ? Number(pagesInputElement.value)
      : undefined,
    cover: String(coverInputElement.value || "").trim(),
  };

  //Neues Buch anlegen
  const createdBook = await createBook(newBookObject);

  //Nach Erfolg zur Detailseite des neuen Buchs navigieren
  //isbn als Identifier wie bei detail links
  location.href = `detail.html?isbn=${encodeURIComponent(
    createdBook.isbn || newBookObject.isbn
  )}`;
});
