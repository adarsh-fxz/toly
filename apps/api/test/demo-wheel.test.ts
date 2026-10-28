import { asc, eq, schema } from "@toly/db";
import { beforeEach, describe, expect, it } from "vitest";
import { seedDemoWheel } from "../../../packages/db/src/demo-wheel";
import { db } from "../src/db";
import {
  createLiveDeal,
  createUsers,
  hasDatabase,
  resetDatabase,
} from "./helpers";

async function demoVenue() {
  await db
    .insert(schema.user)
    .values({
      id: "demo-owner",
      name: "Demo owner",
      email: "demo@test.invalid",
    });
  const { merchant } = await createLiveDeal("demo-owner");
  await db
    .update(schema.merchants)
    .set({ slug: "momo-adda-thamel" })
    .where(eq(schema.merchants.id, merchant.id));
  return merchant.id;
}
const oldPrizes = [
  {
    label: "10% off the bill",
    percentOff: 10,
    maxDiscountPaisa: 20_000,
    weight: 70,
    sortOrder: 0,
  },
  {
    label: "Free milk tea",
    percentOff: 100,
    appliesTo: "Milk tea",
    weight: 25,
    dailyStock: 20,
    sortOrder: 1,
  },
  {
    label: "Whole bill on us",
    percentOff: 100,
    maxDiscountPaisa: 150_000,
    weight: 5,
    dailyStock: 1,
    sortOrder: 2,
  },
];
const rows = (merchantId: string) =>
  db
    .select()
    .from(schema.spinPrizes)
    .where(eq(schema.spinPrizes.merchantId, merchantId))
    .orderBy(asc(schema.spinPrizes.sortOrder));

describe.skipIf(!hasDatabase)("demo wheel reconciliation", () => {
  beforeEach(resetDatabase);
  it("creates six demo prizes with the kit's chances and stays idempotent", async () => {
    const id = await demoVenue();
    await seedDemoWheel(db, id);
    const first = await rows(id);
    expect(first.map((p) => p.label)).toEqual([
      "10% off",
      "Milk tea free",
      "15% off",
      "Momo plate free",
      "5% off",
      "Whole bill free",
    ]);
    expect(first.map((p) => p.weight)).toEqual([20, 25, 12, 12, 30, 1]);
    expect(first.reduce((total, p) => total + p.weight, 0)).toBe(100);
    await seedDemoWheel(db, id);
    expect(await rows(id)).toEqual(first);
  });
  it("upgrades the untouched three-prize seed while preserving referenced prize IDs", async () => {
    const id = await demoVenue();
    const original = await db
      .insert(schema.spinPrizes)
      .values(oldPrizes.map((p) => ({ ...p, merchantId: id })))
      .returning();
    await seedDemoWheel(db, id);
    const upgraded = await rows(id);
    expect(upgraded).toHaveLength(6);
    for (const old of original)
      expect(upgraded.find((p) => p.id === old.id)?.percentOff).toBe(
        old.percentOff,
      );
  });
  it("leaves a customised demo wheel unchanged", async () => {
    const id = await demoVenue();
    await db
      .insert(schema.spinPrizes)
      .values(
        oldPrizes.map((p) => ({ ...p, weight: p.weight + 1, merchantId: id })),
      );
    const before = await rows(id);
    await seedDemoWheel(db, id);
    expect(await rows(id)).toEqual(before);
  });
  it("does not seed prizes for a non-demo venue", async () => {
    const [owner] = await createUsers(1);
    if (!owner) throw new Error("No owner");
    const { merchant } = await createLiveDeal(owner);
    await seedDemoWheel(db, merchant.id);
    expect(await rows(merchant.id)).toHaveLength(0);
  });
});
