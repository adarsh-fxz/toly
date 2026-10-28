// Shared view-model types for the Toly UI kit. Map your API/DB shapes onto these
// in the page (server component) and pass plain props down.

export type Category =
  | "cafe"
  | "restaurant"
  | "desserts"
  | "bar"
  | "karaoke"
  | "games"
  | "activity";

export const CATEGORY_LABEL: Record<Category, string> = {
  cafe: "Café",
  restaurant: "Restaurant",
  desserts: "Desserts and bakery",
  bar: "Bar and lounge",
  karaoke: "Karaoke",
  games: "Board games and gaming",
  activity: "Activity and experience",
};

export interface Member {
  id: string;
  /** first name only, as shown to the group */
  firstName: string;
  avatarUrl?: string | null;
  isYou?: boolean;
  isOrganiser?: boolean;
}

export interface DealSummary {
  slug: string;
  title: string;
  venueName: string;
  area: string;
  category: Category;
  partySize: number;
  /** e.g. "Weekdays · 14:00 to 17:30" (build with formatDays + formatHours) */
  whenLabel: string;
  groupPrice: number;
  regularPrice: number;
}

export type TolyStatus = "forming" | "unlocked" | "expired" | "cancelled";

export interface Prize {
  id: string;
  /** customer-facing name, e.g. "Milk tea free" or "10% off" */
  name: string;
  /** full offer line, e.g. "10% off the whole bill, up to Rs 200 off" */
  offer: string;
  /** big wheel text: "10%" or "FREE" */
  big: string;
  /** small wheel text: "Bill", "Milk tea" */
  small: string;
  /** probability 0..1 as computed by the server for display */
  chance: number;
  /** true when limited per-day stock */
  limited?: boolean;
  /** rare jackpot segment, drawn in solid marigold */
  hot?: boolean;
}
