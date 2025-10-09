import * as readLine from "node:readline";

//Stelle eine Frage und gibt die Antwort als Promise<string> zurück
function askConsoleQuestion(
  consoleInterface: readLine.Interface,
  promptText: string
): Promise<string> {
  return new Promise((resolve) =>
    consoleInterface.question(promptText, resolve)
  );
}

//Fragt den Trinkgeld-Prozentsatz ab
async function askForPercentage(
  consoleInterface: readLine.Interface,
  promptText = "Welchen Prozentsatz Trinkgeld gibst du?",
  options: { max?: number } = {}
): Promise<number> {
  const { max } = options;
  //allowZero auf true, prozent darf 0 sein
  const percentage = await askForNumber(consoleInterface, `${promptText} `, {
    allowZero: true,
    min: 0,
  });
  if (typeof max === "number" && percentage > max) {
    console.log(`Der Prozentsatz darf maximal ${max} sein.`);
    return askForPercentage(consoleInterface, promptText, options);
  }
  return percentage;
}

/** Fragt eine Ja/Nein-Antwort ab; akzeptiert de/en-Varianten und Abkürzungen. */
async function askForYesNo(
  consoleInterface: readLine.Interface,
  promptText = "Soll die Rechnung geteilt werden? (ja/nein)"
): Promise<boolean> {
  // Wiederholt fragen, bis eine klare Ja/Nein-Antwort vorliegt
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rawAnswer = await askConsoleQuestion(
      consoleInterface,
      `${promptText} `
    );
    const normalized = rawAnswer.trim().toLowerCase();

    const yesValues = new Set(["j", "ja", "y", "yes", "true"]);
    const noValues = new Set(["n", "nein", "no", "false"]);

    if (yesValues.has(normalized)) return true;
    if (noValues.has(normalized)) return false;

    console.log("Bitte mit „ja“ oder „nein“ antworten (j/ja/y/yes sind ok).");
  }
}

/** Fragt eine ganze Zahl ab, z. B. die Anzahl Personen (>= min). */
async function askForInteger(
  consoleInterface: readLine.Interface,
  promptText: string,
  options: { min?: number } = {}
): Promise<number> {
  const { min } = options;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const rawAnswer = await askConsoleQuestion(
      consoleInterface,
      `${promptText} `
    );
    const trimmed = rawAnswer.trim();

    // Nur Ganzzahlen erlauben (optional führendes +), keine Dezimalstellen
    if (!/^[\s+]*\d+\s*$/.test(trimmed)) {
      console.log("Bitte eine ganze Zahl eingeben (z. B. 2, 3, 4).");
      continue;
    }

    const integerValue = Number(trimmed);

    if (!Number.isInteger(integerValue)) {
      console.log("Bitte eine ganze Zahl eingeben.");
      continue;
    }
    if (typeof min === "number" && integerValue < min) {
      console.log(`Der Wert muss mindestens ${min} sein.`);
      continue;
    }
    return integerValue;
  }
}

/** Ergebnisstruktur der Berechnung. */
type CalculationResult = {
  tipAmount: number;
  totalAmount: number;
  amountPerPerson?: number;
};
//test ts
/** Rechnet Trinkgeld, Gesamt und ggf. pro Person. Keine I/O hier drin. */
function calculateBillSummary(
  billAmount: number,
  tipPercentage: number,
  options: { numberOfPeople?: number } = {}
): CalculationResult {
  const { numberOfPeople } = options;

  // Basismathe – keine Rundung hier erzwingen, wir formatieren erst bei der Ausgabe.
  const tipAmount = (billAmount * tipPercentage) / 100;
  const totalAmount = billAmount + tipAmount;

  const result: CalculationResult = { tipAmount, totalAmount };

  if (typeof numberOfPeople === "number" && numberOfPeople >= 2) {
    result.amountPerPerson = totalAmount / numberOfPeople;
  }
  return result;
}

/** Formatiert Geldbeträge konsistent (z. B. EUR, de-DE). */
function formatCurrency(
  amount: number,
  currency: string = "EUR",
  locale: string = "de-DE"
): string {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

//Interpetiert Nutzereingaben als Zahl, unterstützt deutschsprachiges Komma
function parseDecimalFromUserInput(inputText: string): number | null {
  const trimmed = inputText.trim();
  const normalized = trimmed.replace(",", ".");
  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? numericValue : null;
}

//Fragt wiederholt nach einer gültigen Zahl gemäß regeln
async function askForNumber(
  consoleInterface: readLine.Interface,
  label: string,
  options: { min?: number; allowZero?: boolean } = {}
): Promise<number> {
  const { min, allowZero } = options;

  while (true) {
    const rawAnswer = await askConsoleQuestion(consoleInterface, `${label}`);
    const parsedNumber = parseDecimalFromUserInput(rawAnswer);
    const zeroIsAllowed = Boolean(allowZero);

    if (parsedNumber == null) {
      console.log("Bitte eine Zahl eingeben!");
      continue;
    }
    if (!zeroIsAllowed && parsedNumber <= 0) {
      console.log("Der Wert muss größer als 0 sein.");
      continue;
    }
    if (typeof min === "number" && parsedNumber < min) {
      console.log(`Der Wert muss mindestens ${min} sein.`);
      continue;
    }
    return parsedNumber;
  }
}

//Programmstart

async function runInteractiveCli(): Promise<void> {
  const consoleInterface = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const handleSigint = () => {
    consoleInterface.close();
    process.stdout.write("\nAbbruch. Tschüss!\n");
    process.exit(0);
  };
  process.once("SIGINT", handleSigint);

  try {
    console.log("Willkommen zum Tip Calculator:");
    const billAmount = await askForNumber(
      consoleInterface,
      "Wie hoch ist die Rechnung?",
      { allowZero: false }
    );
    console.log(`Eingelesener Betrag: ${billAmount}`);
    const tipPercentage = await askForPercentage(
      consoleInterface,
      "Welchen Prozentsatz Trinkgeld gibst du? (z. B. 15 für 15%)",
      { max: 100 } // falls du eine Obergrenze möchtest
    );

    console.log(`Eingelesener Prozentsatz: ${tipPercentage}%`);

    const shouldSplit = await askForYesNo(
      consoleInterface,
      "Soll die Rechnung unter mehreren Personen geteilt werden? (ja/nein)"
    );
    console.log(`Split aktiv: ${shouldSplit ? "ja" : "nein"}`);

    let numberOfPeople: number | undefined = undefined;
    if (shouldSplit) {
      numberOfPeople = await askForInteger(
        consoleInterface,
        "Wie viele Personen teilen die Rechnung?",
        { min: 2 }
      );
      console.log(`Personenanzahl: ${numberOfPeople}`);
    }
    // --- Berechnung ---
    const summary = calculateBillSummary(
      billAmount,
      tipPercentage,
      numberOfPeople !== undefined ? { numberOfPeople } : {}
    );

    // --- Ausgabe (klar strukturiert) ---
    console.log("\nErgebnis:");
    console.log(`  Rechnung:          ${formatCurrency(billAmount)}`);
    console.log(
      `  Trinkgeld (${tipPercentage}%): ${formatCurrency(summary.tipAmount)}`
    );
    console.log(`  Gesamt:            ${formatCurrency(summary.totalAmount)}`);
    if (typeof summary.amountPerPerson === "number") {
      console.log(
        `  Pro Person (${numberOfPeople}): ${formatCurrency(
          summary.amountPerPerson
        )}`
      );
    }
  } finally {
    consoleInterface.close();
    process.removeListener("SIGINT", handleSigint);
  }
}

runInteractiveCli().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error("Unerwarteter Fehler:", error.message);
    console.error(error.stack);
  } else {
    console.error("Unerwarteter Fehler:", error);
  }
  process.exit(1);
});
