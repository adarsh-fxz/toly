import { eq } from "drizzle-orm";
import type { Db } from "./index";
import { merchants, spinPrizes, spinWheels } from "./schema";

/** Clockwise order, real chances and caps from the approved six-prize demo. */
const prizes = [
  { label: "10% off", percentOff: 10, maxDiscountPaisa: 20_000, weight: 20 },
  {
    label: "Milk tea free",
    percentOff: 100,
    appliesTo: "Milk tea",
    weight: 25,
    dailyStock: 20,
  },
  { label: "15% off", percentOff: 15, maxDiscountPaisa: 30_000, weight: 12 },
  {
    label: "Momo plate free",
    percentOff: 100,
    appliesTo: "Momo plate",
    weight: 12,
    dailyStock: 10,
  },
  { label: "5% off", percentOff: 5, maxDiscountPaisa: 10_000, weight: 30 },
  {
    label: "Whole bill free",
    percentOff: 100,
    maxDiscountPaisa: 150_000,
    weight: 1,
    dailyStock: 1,
  },
];

/** Only called for seed-owned venues. Keep existing prize IDs so past spins stay linked. */
export async function seedDemoWheel(db: Db, merchantId: string) {
  await db.transaction(async (tx) => {
    const [venue] = await tx
      .select({ slug: merchants.slug, createdById: merchants.createdById })
      .from(merchants)
      .where(eq(merchants.id, merchantId))
      .for("update");
    if (
      venue?.createdById !== "demo-owner" ||
      !["chiya-ghar-jhamsikhel", "momo-adda-thamel"].includes(venue.slug)
    )
      return;
    const current = await tx
      .select()
      .from(spinPrizes)
      .where(eq(spinPrizes.merchantId, merchantId))
      .for("update");
    const original = [
      {
        label: "10% off the bill",
        percentOff: 10,
        appliesTo: null,
        maxDiscountPaisa: 20_000,
        weight: 70,
        dailyStock: null,
        sortOrder: 0,
      },
      {
        label: "Free milk tea",
        percentOff: 100,
        appliesTo: "Milk tea",
        maxDiscountPaisa: null,
        weight: 25,
        dailyStock: 20,
        sortOrder: 1,
      },
      {
        label: "Whole bill on us",
        percentOff: 100,
        appliesTo: null,
        maxDiscountPaisa: 150_000,
        weight: 5,
        dailyStock: 1,
        sortOrder: 2,
      },
    ];
    const untouched =
      current.length === 3 &&
      original.every((expected) =>
        current.some(
          (row) =>
            row.active &&
            Object.entries(expected).every(
              ([key, value]) => row[key as keyof typeof row] === value,
            ),
        ),
      );
    // A seed rerun must never overwrite a merchant's customised wheel.
    if (current.length && !untouched) return;
    await tx
      .insert(spinWheels)
      .values({ merchantId, enabled: true, pricePaisa: 4900, validityDays: 30 })
      .onConflictDoNothing();
    for (const [sortOrder, prize] of prizes.entries()) {
      const values = {
        merchantId,
        label: prize.label,
        percentOff: prize.percentOff,
        appliesTo: prize.appliesTo ?? null,
        maxDiscountPaisa: prize.maxDiscountPaisa ?? null,
        weight: prize.weight,
        dailyStock: prize.dailyStock ?? null,
        active: true,
        sortOrder,
      };
      const old = current.find(
        (row) =>
          row.percentOff === values.percentOff &&
          row.appliesTo === values.appliesTo,
      );
      if (old)
        await tx
          .update(spinPrizes)
          .set(values)
          .where(eq(spinPrizes.id, old.id));
      else await tx.insert(spinPrizes).values(values);
    }
  });
}
