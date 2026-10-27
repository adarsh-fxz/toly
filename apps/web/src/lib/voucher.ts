import { formatRs } from "@toly/shared/money";

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
    const target = details.appliesTo ? details.appliesTo : "the whole bill";
    const cap = details.maxDiscountPaisa
      ? `, up to ${formatRs(details.maxDiscountPaisa)} off`
      : "";
    return details.percentOff === 100
      ? `${target} free${cap}`
      : `${details.percentOff}% off ${target}${cap}`;
  }
  return "Voucher";
}

export function formatCode(code: string) {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}
