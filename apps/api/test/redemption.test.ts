import { eq, schema } from "@toly/db";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import {
  issueVoucherToken,
  verifyVoucherToken,
} from "../src/lib/voucher-token";
import { joinGroup, startGroup } from "../src/services/groups";
import { lookupVoucher, redeemVoucher } from "../src/services/redemption";
import {
  createLiveDeal,
  createUsers,
  hasDatabase,
  resetDatabase,
} from "./helpers";

async function unlockedVoucher(
  ownerId: string,
  organizer: string,
  friend: string,
  dailyCap?: number,
) {
  const { merchant, deal } = await createLiveDeal(ownerId, 2);
  if (dailyCap)
    await db
      .update(schema.deals)
      .set({ dailyCap })
      .where(eq(schema.deals.id, deal.id));
  const group = await startGroup(organizer, deal.slug, null);
  await joinGroup(friend, group.id);
  const [voucher] = await db
    .select()
    .from(schema.vouchers)
    .where(eq(schema.vouchers.groupId, group.id));
  if (!voucher) throw new Error("no voucher");
  return { merchant, deal, voucher };
}

describe("voucher tokens", () => {
  it("round-trips and expires", () => {
    const id = crypto.randomUUID();
    const { token } = issueVoucherToken(id, Date.now());
    expect(verifyVoucherToken(token)).toEqual({ ok: true, voucherId: id });
    expect(verifyVoucherToken(token, Date.now() + 120_000)).toEqual({
      ok: false,
      reason: "TOKEN_EXPIRED",
    });
  });

  it("rejects a token pointed at another voucher", () => {
    const { token } = issueVoucherToken(crypto.randomUUID());
    const forged = token.replace(
      /^toly1\.[0-9a-f-]{36}/,
      `toly1.${crypto.randomUUID()}`,
    );
    expect(verifyVoucherToken(forged)).toEqual({
      ok: false,
      reason: "BAD_SIGNATURE",
    });
  });
});

describe.skipIf(!hasDatabase)("redemption", () => {
  beforeEach(resetDatabase);

  it("redeems exactly once under concurrent scans", async () => {
    const [owner, a, b] = await createUsers(3);
    if (!owner || !a || !b) throw new Error("no users");
    const { merchant, voucher } = await unlockedVoucher(owner, a, b);

    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        redeemVoucher(owner, merchant.id, voucher.id, 120_000),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    for (const r of results.filter((r) => r.status === "rejected")) {
      expect((r as PromiseRejectedResult).reason.code).toBe("ALREADY_REDEEMED");
    }

    const [after] = await db
      .select()
      .from(schema.vouchers)
      .where(eq(schema.vouchers.id, voucher.id));
    expect(after?.status).toBe("redeemed");
    expect(after?.billAmountPaisa).toBe(120_000);
  });

  it("hides vouchers from other venues' staff", async () => {
    const [owner, otherOwner, a, b] = await createUsers(4);
    if (!owner || !otherOwner || !a || !b) throw new Error("no users");
    const { voucher } = await unlockedVoucher(owner, a, b);
    const { merchant: other } = await createLiveDeal(otherOwner, 2);

    await expect(
      lookupVoucher(otherOwner, other.id, { code: voucher.code }),
    ).rejects.toMatchObject({
      code: "NOT_VALID_HERE",
    });
    const { token } = issueVoucherToken(voucher.id);
    await expect(
      lookupVoucher(otherOwner, other.id, { token }),
    ).rejects.toMatchObject({ code: "NOT_VALID_HERE" });
  });

  it("accepts typed codes with dashes and look-alike letters", async () => {
    const [owner, a, b] = await createUsers(3);
    if (!owner || !a || !b) throw new Error("no users");
    const { merchant, voucher } = await unlockedVoucher(owner, a, b);
    const typed = `${voucher.code.slice(0, 4)}-${voucher.code.slice(4)}`
      .toLowerCase()
      .replace(/0/g, "o");

    const result = await lookupVoucher(owner, merchant.id, { code: typed });
    expect(result.id).toBe(voucher.id);
    expect(result.canRedeem).toBe(true);
  });

  it("enforces the deal's daily cap", async () => {
    const [owner, a, b, c, d] = await createUsers(5);
    if (!owner || !a || !b || !c || !d) throw new Error("no users");
    const first = await unlockedVoucher(owner, a, b, 1);
    const group = await startGroup(c, first.deal.slug, null);
    await joinGroup(d, group.id);
    const [second] = await db
      .select()
      .from(schema.vouchers)
      .where(eq(schema.vouchers.groupId, group.id));
    if (!second) throw new Error("no voucher");

    await redeemVoucher(owner, first.merchant.id, first.voucher.id, null);
    await expect(
      redeemVoucher(owner, first.merchant.id, second.id, null),
    ).rejects.toMatchObject({
      code: "DAILY_CAP",
    });
  });
});
