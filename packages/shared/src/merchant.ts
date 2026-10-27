import { z } from "zod";
import { normalizeNepaliPhone } from "./phone";

export const MERCHANT_CATEGORIES = {
  cafe: "Café",
  restaurant: "Restaurant",
  dessert: "Desserts and bakery",
  bar: "Bar and lounge",
  karaoke: "Karaoke",
  games: "Board games and gaming",
  activity: "Activity and experience",
  other: "Something else",
} as const;

export type MerchantCategory = keyof typeof MERCHANT_CATEGORIES;

const categoryKeys = Object.keys(MERCHANT_CATEGORIES) as [
  MerchantCategory,
  ...MerchantCategory[],
];

export const merchantApplicationSchema = z.object({
  name: z.string().trim().min(2, "Add your business name").max(80),
  category: z.enum(categoryKeys, { error: "Pick the closest category" }),
  area: z
    .string()
    .trim()
    .min(2, "Add the neighbourhood, like Jhamsikhel")
    .max(60),
  address: z
    .string()
    .trim()
    .min(5, "Add a street address customers can find")
    .max(160),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const phone = normalizeNepaliPhone(v);
      if (!phone) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a Nepali mobile number for the counter",
        });
        return z.NEVER;
      }
      return phone;
    }),
  panNumber: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "PAN numbers have 9 digits")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: z
    .string()
    .trim()
    .max(400, "Keep it under 400 characters")
    .default(""),
});

export type MerchantApplication = z.input<typeof merchantApplicationSchema>;

export const merchantReviewSchema = z.object({
  decision: z.enum(["approved", "rejected", "suspended"]),
  note: z.string().trim().max(400).optional(),
});
