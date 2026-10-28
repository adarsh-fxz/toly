import { formatRs } from "@/lib/money";

type Details = {
  groupPricePaisa?: number;
  partySize?: number;
  percentOff?: number;
  appliesTo?: string | null;
  maxDiscountPaisa?: number | null;
};

/** One line that tells staff exactly what to charge. */
export function describeOffer(details: Details): string {
  if (details.groupPricePaisa) {
    return `${formatRs(details.groupPricePaisa)} for ${details.partySize ?? "the"} people, one bill`;
  }
  if (details.percentOff) {
    const cap = details.maxDiscountPaisa
      ? `, up to ${formatRs(details.maxDiscountPaisa)} off`
      : "";
    if (details.percentOff === 100) {
      return `${details.appliesTo ?? "Whole bill"} free${cap}`;
    }
    return `${details.percentOff}% off ${details.appliesTo ?? "the whole bill"}${cap}`;
  }
  return "Voucher";
}

export function formatCode(code: string) {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
