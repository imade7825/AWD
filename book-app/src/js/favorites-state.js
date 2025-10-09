//Konstante für localStorage key
const FAVORITES_STORAGE_KEY = "itlib:favorites";

//Lesen/Schreiben der kompltten Liste
export function loadFavoriteIsbnArray() {
  const storedJsonString = localStorage.getItem(FAVORITES_STORAGE_KEY);
  if (!storedJsonString) return []; //speicher leer

  //sicher parsen, ohne einen fehler bezeichner zu werden
  let parsedStoredValue;

  try {
    parsedStoredValue = JSON.parse(storedJsonString);
  } catch {
    return [];
  }

  //In string umwandeln, trimmen, leere rausfiltern
  const cleanedIsbnArray = parsedStoredValue
    .map((value) => String(value ?? "").trim())
    .filter((isbn) => isbn.length > 0);

  return Array.from(new Set(cleanedIsbnArray));
}
export function saveFavoriteIsbnArray(favoriteIsbnArray) {
  const cleanedIsbnArray = favoriteIsbnArray
    .map((value) => String(value ?? "").trim())
    .filter((isbn) => isbn.length > 0);
  const uniqueIsbnArray = Array.from(new Set(cleanedIsbnArray));

  //in json umwandeln und speichern
  const jsonString = JSON.stringify(uniqueIsbnArray);
  localStorage.setItem(FAVORITES_STORAGE_KEY, jsonString);
}

//Abfragen und Mutationen
export function isIsbnMarkedAsFavorite(isbn) {
  //Aktuelle favoritenliste aus dem local storage lesen
  const favoriteIsbnArray = loadFavoriteIsbnArray();

  //isben in einen sauberen string verwandeln
  const normalizedIsbn = String(isbn ?? "").trim();
  //prüfe ob die isbn in der liste vorkommt
  return favoriteIsbnArray.includes(normalizedIsbn);
}
export function addIsbnToFavorites(isbn) {
  //aktuelle favoriten liste laden
  const currentFavoriteIsbnArray = loadFavoriteIsbnArray();
  const normalizedIsbn = String(isbn ?? "").trim();

  if (currentFavoriteIsbnArray.includes(normalizedIsbn)) return;
  const nextFavoriteIsbnArray = [...currentFavoriteIsbnArray, normalizedIsbn];
  saveFavoriteIsbnArray(nextFavoriteIsbnArray);
}
export function removeIsbnFromFavorites(isbn) {
  const currentFavoriteIsbnArray = loadFavoriteIsbnArray();
  const normalizedIsbn = String(isbn ?? "").trim();

  //neue liste ohne die angegebene isbn bilden
  const nextFavoriteIsbnArray = currentFavoriteIsbnArray.filter(
    (storedIsbn) => storedIsbn != normalizedIsbn
  );

  //nur speichern wenn sich etwas geändert hat
  if (nextFavoriteIsbnArray.length !== currentFavoriteIsbnArray.length) {
    saveFavoriteIsbnArray(nextFavoriteIsbnArray);
  }
}
export function toggleIsbnFavoriteStatus(isbn) {
  const normalizedIsbn = String(isbn ?? "").trim();
  if (isIsbnMarkedAsFavorite(normalizedIsbn)) {
    removeIsbnFromFavorites(normalizedIsbn);
  } else {
    addIsbnToFavorites(normalizedIsbn);
  }
}

//Metadaten
export function getFavoriteBooksCount() {
  // Liste aus dem localStorage laden
  const favoriteIsbnArray = loadFavoriteIsbnArray();
  // Anzahl zurückgeben (wichtig: wirklich return!)
  return favoriteIsbnArray.length;
}
