const TZ = "Asia/Kathmandu";

/** YYYY-MM-DD for a day offset from today, in Kathmandu time. */
export function kathmanduDate(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, 6));
  if (isoDate === kathmanduDate()) return "Today";
  if (isoDate === kathmanduDate(1)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-NP", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export { formatDateTime } from "@/lib/format";

export function timeLeft(until: string | Date, now = Date.now()): string {
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return "closed";
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  if (hours >= 1) return `${hours}h ${minutes % 60}m`;
  return `${Math.max(minutes, 1)}m`;
}
