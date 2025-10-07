askNumber(prompt): Promise<number>
askYesNo(prompt): Promise<boolean>
askInt(prompt, min): Promise<number>

computeTotals(bill: number, tipPercent: number, people?: number):
  { tip: number; total: number; perPerson?: number }

formatMoney(amount: number, currency?: string, locale?: string): string
