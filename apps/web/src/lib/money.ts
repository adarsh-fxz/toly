import { formatRs as formatRupees } from "@/lib/format";

export { percentOff, toPaisa } from "@toly/shared/money";

/** The API uses integer paisa. Convert only when displaying an amount. */
export function formatRs(paisa: number) {
  return formatRupees(paisa / 100);
}
