// Toly · lib/format.ts
// Every number, price, phone and time the UI shows goes through these helpers.
// Rules from the brief: "Rs 1,200", Nepali grouping "Rs 1,50,000", "+977 984-123-4567",
// Kathmandu time "14:00 to 17:30", "Oct 27, 11:21 AM". Pair with font-variant-numeric: tabular-nums.

export const TZ = "Asia/Kathmandu";

/** Nepali digit grouping: last 3 digits, then groups of 2. 150000 -> "1,50,000". */
export function groupNepali(n: number): string {
  const neg = n < 0;
  const [int = "0", dec] = Math.abs(n).toFixed(0).split(".");
  let out = int;
  if (int.length > 3) {
    const last3 = int.slice(-3);
    let rest = int.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    out = `${parts.join(",")},${last3}`;
  }
  return (neg ? "-" : "") + out + (dec ? `.${dec}` : "");
}

/** formatRs(1200) -> "Rs 1,200"; formatRs(150000) -> "Rs 1,50,000". */
export function formatRs(amount: number): string {
  return `Rs ${groupNepali(Math.round(amount))}`;
}

/** Whole-number percent saved, rounded DOWN so we never overstate a discount. */
export function percentOff(regular: number, group: number): number {
  if (regular <= 0 || group >= regular) return 0;
  return Math.floor((1 - group / regular) * 100);
}

/** "+977 984-123-4567" for mobiles; landlines "+977 01-5521234". Input may include +977 or spaces. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^977/, "");
  if (/^9[78]\d{8}$/.test(d))
    return `+977 ${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  if (/^0\d{7,8}$/.test(d)) return `+977 ${d.slice(0, 2)}-${d.slice(2)}`;
  return raw;
}

/** NTC/Ncell mobile check used by sign-in and staff invites. */
export function isNepaliMobile(raw: string): boolean {
  return /^9[78]\d{8}$/.test(raw.replace(/\D/g, "").replace(/^977/, ""));
}

const timeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  weekday: "long",
  month: "short",
  day: "numeric",
});

/** "14:00" (24-hour, Kathmandu). */
export const formatTime = (d: Date | string | number) =>
  timeFmt.format(new Date(d));
/** "Oct 27, 11:21 AM" (Kathmandu). */
export const formatDateTime = (d: Date | string | number) =>
  dateTimeFmt.format(new Date(d)).replace(" at ", ", ");
/** "Nov 26, 2026". */
export const formatDate = (d: Date | string | number) =>
  dateFmt.format(new Date(d));
/** "Thursday, Oct 29" for planned days. */
export const formatDay = (d: Date | string | number) =>
  dayFmt.format(new Date(d));

/** "14:00 to 17:30" from "HH:MM" strings; null/undefined -> "Any time the venue is open". */
export function formatHours(
  from?: string | null,
  until?: string | null,
): string {
  if (!from && !until) return "Any time the venue is open";
  return `${from ?? "Opening"} to ${until ?? "closing"}`;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
/** days: 0 = Sunday. [0..5] -> "Sun to Fri"; all -> "Every day"; [6] -> "Sat"; gaps -> "Sun, Tue, Thu". */
export function formatDays(days: number[]): string {
  const d = [...new Set(days)].sort((a, b) => a - b);
  if (d.length === 0) return "No days set";
  if (d.length === 7) return "Every day";
  const consecutive = d.every((v, i) => i === 0 || v === (d[i - 1] ?? -1) + 1);
  if (consecutive && d.length > 1)
    return `${DAY_NAMES[d[0] ?? 0]} to ${DAY_NAMES[d[d.length - 1] ?? 0]}`;
  return d.map((i) => DAY_NAMES[i]).join(", ");
}

/** Real time left to fill a toly: "21h 14m", "3h 40m", "12m", "Less than a minute". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Closed";
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return "Less than a minute";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Backup code "K7Q2MX9P" -> "K7Q2-MX9P"; tolerant of lowercase, spaces and dashes when typed. */
export function formatVoucherCode(raw: string): string {
  const c = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
}

/** "2 in. 2 seats left." headline for a forming toly. */
export function seatsHeadline(filled: number, size: number): string {
  const left = size - filled;
  if (left <= 0) return "Unlocked. Enjoy!";
  return `${filled} in. ${left} seat${left === 1 ? "" : "s"} left.`;
}
