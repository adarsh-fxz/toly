const rupees = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** Formats integer paisa as "Rs 1,200" (Nepali grouping: 1,00,000). */
export function formatRs(paisa: number): string {
  return `Rs ${rupees.format(paisa / 100)}`;
}

export function toPaisa(rupeesAmount: number): number {
  return Math.round(rupeesAmount * 100);
}

/** Whole-number percentage saved, rounded down so we never overstate a discount. */
export function percentOff(basePaisa: number, pricePaisa: number): number {
  if (basePaisa <= 0 || pricePaisa >= basePaisa) return 0;
  return Math.floor(((basePaisa - pricePaisa) / basePaisa) * 100);
}
