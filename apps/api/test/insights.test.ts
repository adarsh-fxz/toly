import { eq, schema } from "@toly/db";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { joinGroup, startGroup } from "../src/services/groups";
import { getInsights, recordDealView } from "../src/services/insights";
import { redeemVoucher } from "../src/services/redemption";
import {
  createLiveDeal,
  createUsers,
  hasDatabase,
  resetDatabase,
} from "./helpers";

describe.skipIf(!hasDatabase)("insights", () => {
  beforeEach(resetDatabase);

  it("counts the funnel from views to redemptions", async () => {
    const [owner, a, b, c] = await createUsers(4);
    if (!owner || !a || !b || !c) throw new Error("no users");
    const { merchant, deal } = await createLiveDeal(owner, 2);

    await Promise.all([
      recordDealView(deal.slug),
      recordDealView(deal.slug),
      recordDealView(deal.slug),
    ]);
    const filled = await startGroup(a, deal.slug, null);
    await joinGroup(b, filled.id);
    await startGroup(c, deal.slug, null);
    const [voucher] = await db
      .select()
      .from(schema.vouchers)
      .where(eq(schema.vouchers.groupId, filled.id));
    if (!voucher) throw new Error("no voucher");
    await redeemVoucher(owner, merchant.id, voucher.id, 130_000);

    const insights = await getInsights(owner, merchant.id, 30);
    expect(insights.funnel).toEqual({
      views: 3,
      started: 2,
      unlocked: 1,
      redeemed: 1,
    });
    expect(insights.bills).toEqual({ totalPaisa: 130_000, count: 1 });
    expect(insights.daily).toHaveLength(14);
    expect(insights.daily.at(-1)?.count).toBe(1);
  });

  it("is only visible to the venue owner", async () => {
    const [owner, staff] = await createUsers(2);
    if (!owner || !staff) throw new Error("no users");
    const { merchant } = await createLiveDeal(owner, 2);
    await db
      .insert(schema.merchantMembers)
      .values({ merchantId: merchant.id, userId: staff, role: "staff" });
    await expect(getInsights(staff, merchant.id, 30)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
