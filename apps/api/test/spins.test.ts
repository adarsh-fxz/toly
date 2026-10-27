import { eq, schema } from "@toly/db";
import { wheelInputSchema } from "@toly/shared/spin";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { mockPayments } from "../src/lib/payments";
import {
  confirmSpin,
  playSpin,
  saveWheel,
  startSpin,
} from "../src/services/spins";
import {
  createLiveDeal,
  createUsers,
  hasDatabase,
  resetDatabase,
} from "./helpers";

async function wheelVenue(ownerId: string) {
  const { merchant } = await createLiveDeal(ownerId, 2);
  await saveWheel(
    ownerId,
    merchant.id,
    wheelInputSchema.parse({
      enabled: true,
      price: 49,
      dailyLimitPerUser: 10,
      prizes: [
        { label: "5% off", percentOff: 5, weight: 1 },
        {
          label: "Free momo",
          percentOff: 100,
          appliesTo: "Buff momo",
          weight: 1000,
          dailyStock: 1,
        },
        { label: "10% off", percentOff: 10, weight: 1, dailyStock: 3 },
      ],
    }),
  );
  return merchant;
}

async function paidSpin(userId: string, slug: string) {
  const { spinId } = await startSpin({ id: userId, name: "Tester" }, slug);
  const [spin] = await db
    .select()
    .from(schema.spins)
    .where(eq(schema.spins.id, spinId));
  if (!spin?.providerRef) throw new Error("no payment");
  mockPayments.settle(spin.providerRef, "completed");
  await confirmSpin(userId, spinId);
  return spinId;
}

describe.skipIf(!hasDatabase)("spins", () => {
  beforeEach(resetDatabase);

  it("only becomes playable after the provider confirms payment", async () => {
    const [owner, player] = await createUsers(2);
    if (!owner || !player) throw new Error("no users");
    const merchant = await wheelVenue(owner);

    const { spinId } = await startSpin(
      { id: player, name: "Player" },
      merchant.slug,
    );
    await expect(playSpin(player, spinId)).rejects.toMatchObject({
      code: "NOT_PAID",
    });
    expect(await confirmSpin(player, spinId)).toEqual({ status: "pending" });

    const [spin] = await db
      .select()
      .from(schema.spins)
      .where(eq(schema.spins.id, spinId));
    mockPayments.settle(spin?.providerRef ?? "", "failed");
    expect(await confirmSpin(player, spinId)).toEqual({ status: "failed" });
    await expect(playSpin(player, spinId)).rejects.toMatchObject({
      code: "NOT_PAID",
    });
  });

  it("returns the same prize when a spin is replayed", async () => {
    const [owner, player] = await createUsers(2);
    if (!owner || !player) throw new Error("no users");
    const merchant = await wheelVenue(owner);
    const spinId = await paidSpin(player, merchant.slug);

    const [first, second] = await Promise.all([
      playSpin(player, spinId),
      playSpin(player, spinId),
    ]);
    expect(second).toEqual(first);
    const issued = await db
      .select()
      .from(schema.vouchers)
      .where(eq(schema.vouchers.holderId, player));
    expect(issued).toHaveLength(1);
    expect(issued[0]?.kind).toBe("spin");
  });

  it("never awards a limited prize beyond its daily stock", async () => {
    const [owner, ...players] = await createUsers(31);
    if (!owner) throw new Error("no users");
    const merchant = await wheelVenue(owner);
    const spinIds = [];
    for (const player of players)
      spinIds.push({ player, spinId: await paidSpin(player, merchant.slug) });

    await Promise.all(
      spinIds.map(({ player, spinId }) => playSpin(player, spinId)),
    );

    const prizes = await db
      .select()
      .from(schema.spinPrizes)
      .where(eq(schema.spinPrizes.merchantId, merchant.id));
    const won = await db
      .select()
      .from(schema.spins)
      .where(eq(schema.spins.merchantId, merchant.id));
    const tally = (label: string) =>
      won.filter((s) => s.prizeId === prizes.find((p) => p.label === label)?.id)
        .length;

    expect(won.every((s) => s.status === "spun")).toBe(true);
    expect(tally("Free momo")).toBe(1);
    expect(tally("10% off")).toBeLessThanOrEqual(3);
    expect(tally("5% off") + tally("Free momo") + tally("10% off")).toBe(30);
  });

  it("enforces the per-person daily limit", async () => {
    const [owner, player] = await createUsers(2);
    if (!owner || !player) throw new Error("no users");
    const merchant = await wheelVenue(owner);
    await db
      .update(schema.spinWheels)
      .set({ dailyLimitPerUser: 1 })
      .where(eq(schema.spinWheels.merchantId, merchant.id));

    const spinId = await paidSpin(player, merchant.slug);
    await playSpin(player, spinId);
    await expect(
      startSpin({ id: player, name: "Player" }, merchant.slug),
    ).rejects.toMatchObject({
      code: "DAILY_LIMIT",
    });
  });
});
