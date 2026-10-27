import { describeDays } from "./deal";

type Window = {
  availableDays: number[];
  availableFrom: string | null;
  availableUntil: string | null;
};

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kathmandu",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Weekday (0–6) and HH:MM for an instant, in Kathmandu time. */
export function kathmanduClock(at: Date) {
  const map = Object.fromEntries(
    parts.formatToParts(at).map((p) => [p.type, p.value]),
  );
  return {
    day: DAY_INDEX[map.weekday ?? "Sun"] ?? 0,
    time: `${map.hour}:${map.minute}`,
  };
}

export function isAvailableAt(window: Window, at: Date): boolean {
  const { day, time } = kathmanduClock(at);
  if (!window.availableDays.includes(day)) return false;
  if (!window.availableFrom || !window.availableUntil) return true;
  return time >= window.availableFrom && time < window.availableUntil;
}

export function describeWindow(window: Window): string {
  const days = describeDays(window.availableDays);
  return window.availableFrom && window.availableUntil
    ? `${days}, ${window.availableFrom} to ${window.availableUntil}`
    : days;
}
