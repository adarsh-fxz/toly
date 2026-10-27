import { z } from "zod";

const optionalInt = (min: number, max: number, message: string) =>
  z
    .union([
      z.literal("").transform(() => undefined),
      z.null().transform(() => undefined),
      z.coerce.number().int().min(min, message).max(max, message),
    ])
    .optional();

export const prizeInputSchema = z.object({
  id: z.uuid().optional(),
  label: z
    .string()
    .trim()
    .min(2, "Name the prize")
    .max(40, "Keep it under 40 characters"),
  percentOff: z.coerce
    .number()
    .int()
    .min(1, "At least 1%")
    .max(100, "At most 100%"),
  appliesTo: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => v || undefined),
  maxDiscount: optionalInt(
    10,
    100_000,
    "Use a cap between Rs 10 and Rs 1,00,000",
  ),
  weight: z.coerce.number().int().min(1, "Weight must be 1 or more").max(1000),
  dailyStock: optionalInt(1, 1000, "Use a number between 1 and 1000"),
});

export const wheelInputSchema = z
  .object({
    enabled: z.boolean(),
    price: z.coerce
      .number()
      .int()
      .min(10, "Spins cost at least Rs 10")
      .max(500, "Spins cost at most Rs 500"),
    dailyLimitPerUser: z.coerce.number().int().min(1).max(10),
    validityDays: optionalInt(1, 365, "Pick how long prizes last"),
    prizes: z
      .array(prizeInputSchema)
      .min(3, "Add at least 3 prizes")
      .max(8, "Use 8 prizes or fewer"),
  })
  .refine((w) => w.prizes.some((p) => p.dailyStock === undefined), {
    message:
      "Give at least one prize unlimited stock so every spin wins something",
    path: ["prizes"],
  });

export type WheelInput = z.input<typeof wheelInputSchema>;

type Weighted = { weight: number };

/** Each prize's chance as a whole-number percentage, largest remainder so they add up to 100. */
export function oddsPercent<T extends Weighted>(prizes: T[]): number[] {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  if (total === 0) return prizes.map(() => 0);
  const exact = prizes.map((p) => (p.weight / total) * 100);
  const floors = exact.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((v, i) => [v - Math.floor(v), i] as const)
    .sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    left--;
  }
  return floors;
}

/** Picks an index by weight given a uniform random integer in [0, totalWeight). */
export function pickWeighted<T extends Weighted>(
  prizes: T[],
  roll: number,
): number {
  let cursor = roll;
  for (let i = 0; i < prizes.length; i++) {
    cursor -= prizes[i]?.weight ?? 0;
    if (cursor < 0) return i;
  }
  return prizes.length - 1;
}
