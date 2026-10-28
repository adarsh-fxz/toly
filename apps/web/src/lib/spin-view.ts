import type { Prize } from "@/components/toly/types";
import type { PublicWheel } from "@/lib/types";
import { describeOffer } from "@/lib/voucher";

export const WHEEL_COLORS = [
  "var(--seg-a)",
  "var(--seg-b)",
  "var(--seg-c)",
  "var(--seg-b)",
  "var(--seg-d)",
  "var(--seg-b)",
  "var(--seg-a)",
  "var(--seg-c)",
];
export function wheelColor(index: number, hot = false) {
  return hot ? "var(--seg-e)" : WHEEL_COLORS[index % WHEEL_COLORS.length];
}
export function prizeView(prize: PublicWheel["prizes"][number]): Prize {
  return {
    id: prize.id,
    name: prize.label,
    offer: describeOffer(prize),
    big: prize.percentOff === 100 ? "FREE" : `${prize.percentOff}%`,
    small: prize.appliesTo || "Bill",
    chance: prize.odds / 100,
    limited: prize.limited,
    hot: prize.percentOff === 100 && !prize.appliesTo,
  };
}

export function segmentLabel(prize: {
  percentOff: number;
  appliesTo?: string | null;
}) {
  const item = prize.appliesTo?.trim();
  return {
    hot: prize.percentOff === 100 && !item,
    short: prize.percentOff === 100 ? "FREE" : `${prize.percentOff}%`,
    sub: item ? (item.length > 12 ? `${item.slice(0, 11)}…` : item) : "Bill",
  };
}
