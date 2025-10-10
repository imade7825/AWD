import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // lädt variablen aus der env-datei in process.env

//Definiert einen typ für eine farbe im rgb-format
type RgbColor = { red: number; green: number; blue: number };

//Erstellt eine neue Express-Anwendung
const application = express(); //Hauptobjekt, über das wir Routen und Middleware definieren

application.use(express.static("public")); //stellt Dateien aus /public bereit
application.use(cors()); // cors aktivieren (hilfreich, wenn frontend auf anderem Port läuft)

//Farb-Hilffunktionen

function getRandomIntegerInclusive(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function createRandomRgbColor(): RgbColor {
  return {
    red: getRandomIntegerInclusive(0, 255),
    green: getRandomIntegerInclusive(0, 255),
    blue: getRandomIntegerInclusive(0, 255),
  };
}

function convertRgbToHexadecimal(rgb: RgbColor): string {
  const convertChannelToHex = (value: number) =>
    value.toString(16).padStart(2, "0"); //Einzel kanal in 2-stellige Hexzahl
  //Alle drei Kanäle zu einem String zusammensetzen
  const hexString = `#${convertChannelToHex(rgb.red)}${convertChannelToHex(
    rgb.green
  )}${convertChannelToHex(rgb.blue)}`;
  return hexString.toUpperCase();
}

//Wandelt Rgb in Hsl Werte um (Farbton, Sättigung, Helligkeit)
function convertRgbToHsl(rgb: RgbColor): {
  hue: number;
  saturation: number;
  lightness: number;
} {
  // Gibt ein Objekt mit HSL-Werten zurück
  const normalizedRed = rgb.red / 255; // Rotanteil auf Bereich 0..1 normieren
  const normalizedGreen = rgb.green / 255; // Grünanteil auf Bereich 0..1 normieren
  const normalizedBlue = rgb.blue / 255; // Blauanteil auf Bereich 0..1 normieren

  const maximum = Math.max(normalizedRed, normalizedGreen, normalizedBlue); // Größter der drei normierten Werte
  const minimum = Math.min(normalizedRed, normalizedGreen, normalizedBlue); // Kleinster der drei normierten Werte
  const difference = maximum - minimum; // Differenz zur Bestimmung der Sättigung und des Farbtons

  let hue = 0; // Initialisiert den Farbton (Winkel in Grad, 0..360)
  if (difference !== 0) {
    // Wenn alle Kanäle gleich sind, gibt es keinen Farbton (Grauwerte)
    if (maximum === normalizedRed) {
      // Fall: Rot ist der größte Kanal
      hue = ((normalizedGreen - normalizedBlue) / difference) % 6; // Formel für Rot-Maximum
    } else if (maximum === normalizedGreen) {
      // Fall: Grün ist der größte Kanal
      hue = (normalizedBlue - normalizedRed) / difference + 2; // Formel für Grün-Maximum
    } else {
      // Fall: Blau ist der größte Kanal
      hue = (normalizedRed - normalizedGreen) / difference + 2; // Formel für Blau-Maximum
    }
    hue *= 60; // Umrechnung von Sektoren in Grad
    if (hue < 0) hue += 360; // Sicherstellen, dass der Winkel nicht negativ ist
  }

  const lightness = (maximum + minimum) / 2; // Helligkeit ist der Mittelwert von max und min
  const saturation =
    difference === 0 ? 0 : difference / (1 - Math.abs(2 * lightness - 1)); // Sättigung basierend auf Differenz und Helligkeit

  return {
    hue: Math.round(hue), // Auf ganze Grad runden für einfache Lesbarkeit
    saturation: Math.round(saturation * 100), // In Prozent umrechnen und runden
    lightness: Math.round(lightness * 100), // In Prozent umrechnen und runden
  };
}

//Formatiert eine Rgb-Struktur als Css-String wie "rgb(12, 34, 56"
function formatRgbCssString(rgb: RgbColor): string {
  return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
}

//Formatiert eine Hsl-Struktur als Css-String wie "hsl(210, 50%, 40%"
function formatHslCssString(hsl: {
  hue: number;
  saturation: number;
  lightness: number;
}): string {
  return `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%)`;
}

//Erzeugen auf einen Schlag alle drei Ausgabeformate(hex, rgb, hsl)
function createRandomColorResponse() {
  const RgbColor = createRandomRgbColor();
  const hexadecimal = convertRgbToHexadecimal(RgbColor);
  const hsl = convertRgbToHsl(RgbColor);

  return {
    hex: hexadecimal,
    rgb: formatRgbCssString(RgbColor),
    hsl: formatHslCssString(hsl),
  }; //Das Objekt entspricht den json-format
}

//Routen der API

//Haupt endpunkt: jede Anfrage liefert eine neue Zufallsfarbe in deri Formaten
//definiert eine Get-Route unter /api/random-color
application.get("/api/random-color", (request, response) => {
  const colorPayload = createRandomColorResponse(); //erzeugt die farbdaten für die antwort
  response.json(colorPayload); //sendet die Daten als json zurück
});

//liest den Port aus der Umgebung oder verwendet 3000 als Standard
const portNumber = Number(process.env.PORT) || 3000; //Portnummer bestimmen

//Startet den Http-server und gibt eine Meldung in der konsole aus
application.listen(portNumber, () => {
  console.log(`Random Color API is running at http://localhost:${portNumber}`); // Startmeldung
});
