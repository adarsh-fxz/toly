import { z } from "zod";

export const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const VALIDITY_OPTIONS = [
  { value: "", label: "Until it's used" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 14:00")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalInt = (min: number, max: number, message: string) =>
  z
    .union([
      z.literal("").transform(() => undefined),
      z.coerce.number().int().min(min, message).max(max, message),
    ])
    .optional();

export const dealInputSchema = z
  .object({
    title: z.string().trim().min(4, "Give the deal a short name").max(80),
    description: z.string().trim().max(500).default(""),
    includes: z
      .array(z.string().trim().min(1).max(80))
      .min(1, "List at least one thing that's included")
      .max(10),
    partySize: z.coerce
      .number()
      .int()
      .min(2, "Groups need at least 2 people")
      .max(10, "Keep groups to 10 or fewer"),
    basePrice: z.coerce
      .number()
      .int("Use whole rupees")
      .min(50, "Enter the regular menu price"),
    groupPrice: z.coerce
      .number()
      .int("Use whole rupees")
      .min(1, "Enter the group price"),
    priceAttested: z.literal(true, {
      error: "Confirm the regular price is your real menu price",
    }),
    availableDays: z
      .array(z.coerce.number().int().min(0).max(6))
      .min(1, "Pick at least one day"),
    availableFrom: time,
    availableUntil: time,
    formationHours: z.coerce.number().int().min(1).max(72).default(24),
    validityDays: optionalInt(1, 365, "Pick how long the voucher lasts"),
    dailyCap: optionalInt(1, 500, "Use a number between 1 and 500"),
    terms: z.string().trim().max(800).default(""),
  })
  .refine((d) => d.groupPrice < d.basePrice, {
    message: "The group price must be lower than the regular price",
    path: ["groupPrice"],
  })
  .refine((d) => !d.availableFrom === !d.availableUntil, {
    message: "Set both a start and end time, or leave both empty",
    path: ["availableUntil"],
  })
  .refine(
    (d) =>
      !d.availableFrom ||
      !d.availableUntil ||
      d.availableFrom < d.availableUntil,
    {
      message: "End time must be after the start time",
      path: ["availableUntil"],
    },
  );

export type DealInput = z.input<typeof dealInputSchema>;

export function describeDays(days: number[]): string {
  const sorted = [...new Set(days)].sort();
  if (sorted.length === 7) return "Every day";
  if (sorted.join() === "1,2,3,4,5") return "Weekdays";
  if (sorted.join() === "0,6") return "Weekends";
  return sorted.map((d) => WEEKDAYS[d]).join(", ");
}

export function describeValidity(validityDays: number | null): string {
  return validityDays
    ? `Use within ${validityDays} days of unlocking`
    : "No expiry. Use it whenever you're ready";
}
