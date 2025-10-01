// Wie viele Fehlversuche sind erlaubt, bevor das Spiel verloren ist?
const MAX_INCORRECT_GUESSES = 10;

// Wortquelle als Textblock (statt Array). Jedes Wort ist durch Leerzeichen/Zeilenumbruch getrennt.
const WORDS_TEXT = `
javascript variable funktion callback entwickler
interface algorithmus internet protokoll datenbank
tastatur hangman framework selector iterator
closure boolean asynchron promise runtime
`;

// Das Alphabet als String – daraus bauen wir die Bildschirm-Tastatur (a bis z).
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

/* === Hilfsfunktionen ============================================ */

// Aus dem Textblock eine echte Wortliste (Array) machen.
// trim() entfernt Leerzeichen am Anfang/Ende, split(/\s+/) trennt an jedem Leerzeichen/Zeilenumbruch.
function getWordList() {
  return WORDS_TEXT.trim().split(/\s+/);
}

// Kleiner Buzz-/Brummton bei Fehlversuch (optional).
let audioContext;
function playBuzz(durationMs = 140) {
  // AudioContext (Safari braucht webkitAudioContext). Nur einmal anlegen.
  if (!audioContext) audioContext = new window.AudioContext();

  // Tonquelle (Oszillator) + Lautstärkeregelung (Gain) erzeugen
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Rechteckwelle klingt „buzzer“-artig, 50 Hz = tiefer Ton
  osc.type = "square";
  osc.frequency.value = 50;

  // Signalfluss: Oszillator -> Gain -> Lautsprecher
  osc.connect(gain);
  gain.connect(audioContext.destination);

  // Ton starten und nach durationMs (Millisekunden) stoppen
  osc.start();
  osc.stop(audioContext.currentTime + durationMs / 1000);
}

/* === Spielzustand (wird bei jedem neuen Spiel zurückgesetzt) ===== */

let secretWord = ""; // Das zufällig ausgewählte Geheimwort (z. B. "internet")
let revealedLetters = []; // Sichtbarkeits-Flags je Position: true = Buchstabe gezeigt
let incorrectGuessCount = 0; // Anzahl aktueller Fehlversuche
let isGameOver = false; // true, wenn gewonnen/verloren (Spiel vorbei)
const guessedLettersSet = new Set(); // Merkt alle bereits geratenen Buchstaben (um Doppelraten zu verhindern)

/* === DOM-Elemente (Verbindungen ins HTML) ======================= */

// Elemente aus index.html holen, die wir beschreiben/aktualisieren
const gameStatusElement = document.querySelector(".game-status"); // "ACTIVE", "WINNER", "GAME OVER"
const mistakeCounterElement = document.getElementById("mistakeCounter"); // "FAILS: x/10"
const currentWordListElement = document.getElementById("currentWord"); // UL für das Wort (Kästchen)
const onScreenKeyboardElement = document.getElementById("onScreenKeyboard"); // UL für die Tasten
const gameResultElement = document.getElementById("gameResult"); // Gewinn-/Verlust-Banner
const newGameButtonElement = document.getElementById("newGameButton"); // "NEW GAME"-Button

/* === Rendering (Bildschirm aktualisieren) ======================= */

// Bildschirm-Tastatur aufbauen: UL leeren, für jeden Buchstaben ein LI>BUTTON erzeugen.
function renderKeyboard() {
  onScreenKeyboardElement.innerHTML = ""; // Alte Tasten entfernen

  for (const letter of ALPHABET) {
    // Für jeden Buchstaben a..z
    const keyItemElement = document.createElement("li"); // Listenpunkt
    const keyButtonElement = document.createElement("button"); // Button im Listenpunkt

    keyButtonElement.type = "button"; // Sicherstellen, dass es kein Submit-Button ist
    keyButtonElement.textContent = letter; // Beschriftung: der Buchstabe
    keyButtonElement.dataset.letter = letter; // Im data-Attribut merken (praktisch zum Wiederfinden)

    // Beim Klick: Rateversuch auslösen
    keyButtonElement.addEventListener("click", () =>
      handleGuess(letter, keyButtonElement)
    );

    // Button ins LI, dann LI in die UL
    keyItemElement.append(keyButtonElement);
    onScreenKeyboardElement.append(keyItemElement);
  }
}

// Wortanzeige aktualisieren: Für jede Position im Geheimwort ein LI anlegen.
// Wenn die Stelle schon aufgedeckt ist, Buchstabe zeigen, sonst leer (Unterstrich kommt aus CSS).
function renderWord() {
  currentWordListElement.innerHTML = ""; // Alte Anzeige entfernen

  for (let position = 0; position < secretWord.length; position++) {
    const letterItemElement = document.createElement("li"); // Ein Kästchen
    letterItemElement.textContent = revealedLetters[position]
      ? secretWord[position] // aufgedeckt: Buchstabe
      : ""; // verdeckt: leer (Linie durch CSS)
    currentWordListElement.append(letterItemElement); // an die UL anhängen
  }
}

// Fehlversuche x/10 anzeigen
function renderMistakes() {
  mistakeCounterElement.textContent = `FAILS: ${incorrectGuessCount}/${MAX_INCORRECT_GUESSES}`;
}

// Status-Text oben links setzen
function setGameStatus(text) {
  gameStatusElement.textContent = text;
}

/* === Ablaufsteuerung (Spiel starten/beenden) ==================== */

// Neues Spiel starten: Wort wählen, Zustand zurücksetzen, UI initial aufbauen.
function startNewGame() {
  const list = getWordList(); // Wortliste aus dem Text bauen
  secretWord = list[Math.floor(Math.random() * list.length)].toLowerCase(); // Zufälliges Wort wählen
  revealedLetters = Array(secretWord.length).fill(false); // Alle Positionen zunächst verdecken
  incorrectGuessCount = 0; // Fehlversuche auf 0
  isGameOver = false; // Spiel aktiv
  guessedLettersSet.clear(); // Bereits geratene Buchstaben vergessen

  renderKeyboard(); // Tasten zeichnen
  renderWord(); // Wort-Kästchen zeichnen
  renderMistakes(); // Fehlversuche anzeigen
  setGameStatus("ACTIVE"); // Status zurücksetzen
  gameResultElement.className = "game-result"; // Banner verstecken (ohne show/win/lose)
  gameResultElement.textContent = ""; // Bannertext löschen
}

// Spiel beenden: Gewinn/Verlust-Banner anzeigen und Tasten sperren.
function finishGame(didWin) {
  isGameOver = true; // Ab jetzt keine Eingaben mehr

  // Alle Tasten deaktivieren, damit nicht weiter geraten werden kann
  for (const keyButton of onScreenKeyboardElement.querySelectorAll("button")) {
    keyButton.disabled = true;
  }

  // Banner einblenden + passende Farbe (win/lose)
  gameResultElement.className = "game-result show " + (didWin ? "win" : "lose");

  if (didWin) {
    gameResultElement.textContent = "You win! 🎉"; // Glückwunsch
    setGameStatus("WINNER"); // Status umschalten
  } else {
    // Bei Niederlage: alle Buchstaben zeigen, damit man die Lösung sieht
    revealedLetters = revealedLetters.map(() => true);
    renderWord();
    gameResultElement.textContent = `Game Over – word was "${secretWord}".`; // Lösungstext
    setGameStatus("GAME OVER"); // Status umschalten
  }
}

/* === Eingabelogik (Buchstaben raten) ============================ */

// Wird aufgerufen, wenn ein Buchstabe geraten wird – per Klick auf Button oder per Tastatur.
function handleGuess(guessedLetter, sourceButtonElement) {
  // Wenn Spiel vorbei oder der Buchstabe schon versucht wurde: nichts tun
  if (isGameOver || guessedLettersSet.has(guessedLetter)) return;

  // Diesen Buchstaben merken, damit er nicht doppelt geraten werden kann
  guessedLettersSet.add(guessedLetter);

  // Button-Element bestimmen: entweder der geklickte Button oder per Selektor finden (bei Tastatur-Eingabe)
  const keyButton =
    sourceButtonElement ||
    onScreenKeyboardElement.querySelector(`[data-letter="${guessedLetter}"]`);

  // Button deaktivieren (ein Tipp pro Buchstabe)
  if (keyButton) keyButton.disabled = true;

  // Prüfen, ob der Buchstabe im Geheimwort vorkommt – an allen Positionen
  let isCorrect = false;
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === guessedLetter) {
      revealedLetters[i] = true; // an Position i aufdecken
      isCorrect = true; // Treffer merken
    }
  }

  // Button optisch markieren: grün (good) bei Treffer, rot (bad) bei Fehlversuch
  if (keyButton) keyButton.classList.add(isCorrect ? "good" : "bad");

  if (!isCorrect) {
    // Fehlversuch: Zähler erhöhen, Buzz abspielen, Anzeige aktualisieren
    incorrectGuessCount++;
    playBuzz();
    renderMistakes();

    // Wenn Maximalzahl erreicht: Spiel verloren
    if (incorrectGuessCount >= MAX_INCORRECT_GUESSES) return finishGame(false);
  } else {
    // Richtiger Tipp: Wortanzeige aktualisieren
    renderWord();

    // Sind alle Positionen aufgedeckt? Dann ist das Spiel gewonnen.
    if (revealedLetters.every(Boolean)) return finishGame(true);
  }
}

/* === Event-Handling (Tastatur + Buttons) ======================== */

// Reagiere auf echte Tastatur-Eingaben
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); // Taste in Kleinbuchstaben umwandeln

  if (key >= "a" && key <= "z") handleGuess(key); // a..z als Rateversuch werten

  if (event.key === "Enter" && isGameOver) startNewGame(); // Nach Spielende: Enter startet neue Runde
});

// Klick auf "NEW GAME" startet sofort eine neue Runde
newGameButtonElement.addEventListener("click", startNewGame);

/* === Initialstart ============================================== */

// Beim Laden der Seite automatisch ein neues Spiel starten
startNewGame();
