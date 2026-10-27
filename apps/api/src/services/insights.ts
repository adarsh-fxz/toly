import { and, desc, eq, gte, inArray, schema, sql } from "@toly/db";
import { db } from "../db";
import { notFound } from "../lib/errors";
import { requireMembership } from "./merchants";

const { deals, dealDailyViews, groups, vouchers, spins } = schema;

const today = sql`(now() at time zone 'Asia/Kathmandu')::date`;
const localDay = (column: unknown) =>
  sql`(${column} at time zone 'Asia/Kathmandu')::date`;
const int = (expr: ReturnType<typeof sql>) => sql<number>`(${expr})::int`;

export async function recordDealView(slug: string) {
  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.slug, slug), eq(deals.status, "live")))
    .limit(1);
  if (!deal) throw notFound();
  await db
    .insert(dealDailyViews)
    .values({ dealId: deal.id, day: today, views: 1 })
    .onConflictDoUpdate({
      target: [dealDailyViews.dealId, dealDailyViews.day],
      set: { views: sql`${dealDailyViews.views} + 1` },
    });
}

type Suggestion = { dealId: string; message: string };

/** Plain-language nudges computed only from this venue's own numbers. */
function suggest(
  rows: {
    id: string;
    title: string;
    views: number;
    started: number;
    unlocked: number;
    redeemed: number;
    partySize: number;
  }[],
) {
  const tips: Suggestion[] = [];
  for (const d of rows) {
    if (d.views >= 20 && d.started === 0) {
      tips.push({
        dealId: d.id,
        message: `${d.views} people looked at “${d.title}” but nobody started a toly. A clearer bundle or a slightly better group price usually helps.`,
      });
    } else if (d.started >= 3 && d.unlocked / d.started < 0.4) {
      tips.push({
        dealId: d.id,
        message: `Most tolys for “${d.title}” don't fill in time. Try ${d.partySize > 2 ? `${d.partySize - 1} people` : "a longer fill window"} instead.`,
      });
    } else if (d.unlocked >= 3 && d.redeemed / d.unlocked < 0.5) {
      tips.push({
        dealId: d.id,
        message: `Groups unlock “${d.title}” but many haven't visited yet. Check the hours fit when they'd actually come in.`,
      });
    }
  }
  return tips;
}

export async function getInsights(
  userId: string,
  merchantId: string,
  days: number,
) {
  await requireMembership(userId, merchantId, ["owner"]);
  const since = sql`now() - make_interval(days => ${days})`;
  const sinceDay = sql`${today} - ${days}::int`;

  const venueDeals = await db
    .select({
      id: deals.id,
      title: deals.title,
      slug: deals.slug,
      status: deals.status,
      partySize: deals.partySize,
    })
    .from(deals)
    .where(eq(deals.merchantId, merchantId))
    .orderBy(desc(deals.createdAt));
  const dealIds = venueDeals.map((d) => d.id);

  const [views, groupCounts, redeemedByDeal, totals, spinTotals, daily, hours] =
    await Promise.all([
      dealIds.length
        ? db
            .select({
              dealId: dealDailyViews.dealId,
              views: int(sql`sum(${dealDailyViews.views})`),
            })
            .from(dealDailyViews)
            .where(
              and(
                inArray(dealDailyViews.dealId, dealIds),
                gte(dealDailyViews.day, sinceDay),
              ),
            )
            .groupBy(dealDailyViews.dealId)
        : [],
      db
        .select({
          dealId: groups.dealId,
          started: int(sql`count(*)`),
          unlocked: int(
            sql`count(*) filter (where ${groups.status} = 'unlocked')`,
          ),
        })
        .from(groups)
        .where(
          and(eq(groups.merchantId, merchantId), gte(groups.createdAt, since)),
        )
        .groupBy(groups.dealId),
      db
        .select({ dealId: groups.dealId, redeemed: int(sql`count(*)`) })
        .from(vouchers)
        .innerJoin(groups, eq(groups.id, vouchers.groupId))
        .where(
          and(
            eq(vouchers.merchantId, merchantId),
            eq(vouchers.status, "redeemed"),
            gte(vouchers.redeemedAt, since),
          ),
        )
        .groupBy(groups.dealId),
      db
        .select({
          redeemed: int(sql`count(*)`),
          spinRedeemed: int(
            sql`count(*) filter (where ${vouchers.kind} = 'spin')`,
          ),
          billTotalPaisa: int(
            sql`coalesce(sum(${vouchers.billAmountPaisa}), 0)`,
          ),
          billCount: int(sql`count(${vouchers.billAmountPaisa})`),
        })
        .from(vouchers)
        .where(
          and(
            eq(vouchers.merchantId, merchantId),
            eq(vouchers.status, "redeemed"),
            gte(vouchers.redeemedAt, since),
          ),
        ),
      db
        .select({ spins: int(sql`count(*)`) })
        .from(spins)
        .where(
          and(
            eq(spins.merchantId, merchantId),
            inArray(spins.status, ["paid", "spun"]),
            gte(spins.paidAt, since),
          ),
        ),
      db
        .select({
          day: sql<string>`${localDay(vouchers.redeemedAt)}::text`,
          count: int(sql`count(*)`),
        })
        .from(vouchers)
        .where(
          and(
            eq(vouchers.merchantId, merchantId),
            eq(vouchers.status, "redeemed"),
            sql`${localDay(vouchers.redeemedAt)} > ${today} - 14`,
          ),
        )
        .groupBy(localDay(vouchers.redeemedAt)),
      db
        .select({
          hour: int(
            sql`extract(hour from ${vouchers.redeemedAt} at time zone 'Asia/Kathmandu')`,
          ),
          count: int(sql`count(*)`),
        })
        .from(vouchers)
        .where(
          and(
            eq(vouchers.merchantId, merchantId),
            eq(vouchers.status, "redeemed"),
            gte(vouchers.redeemedAt, since),
          ),
        )
        .groupBy(sql`1`),
    ]);

  const viewMap = new Map(views.map((v) => [v.dealId, v.views]));
  const groupMap = new Map(groupCounts.map((g) => [g.dealId, g]));
  const redeemMap = new Map(redeemedByDeal.map((r) => [r.dealId, r.redeemed]));

  const perDeal = venueDeals.map((d) => ({
    ...d,
    views: viewMap.get(d.id) ?? 0,
    started: groupMap.get(d.id)?.started ?? 0,
    unlocked: groupMap.get(d.id)?.unlocked ?? 0,
    redeemed: redeemMap.get(d.id) ?? 0,
  }));

  // Fill every one of the last 14 days so the chart has no gaps.
  const counts = new Map(daily.map((d) => [d.day, d.count]));
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(Date.now() + 5.75 * 3_600_000 - (13 - i) * 86_400_000)
      .toISOString()
      .slice(0, 10);
    return { day, count: counts.get(day) ?? 0 };
  });

  const total = totals[0] ?? {
    redeemed: 0,
    spinRedeemed: 0,
    billTotalPaisa: 0,
    billCount: 0,
  };
  return {
    days,
    funnel: {
      views: perDeal.reduce((s, d) => s + d.views, 0),
      started: perDeal.reduce((s, d) => s + d.started, 0),
      unlocked: perDeal.reduce((s, d) => s + d.unlocked, 0),
      redeemed: total.redeemed,
    },
    spins: { paid: spinTotals[0]?.spins ?? 0, redeemed: total.spinRedeemed },
    bills: { totalPaisa: total.billTotalPaisa, count: total.billCount },
    daily: last14,
    busiestHours: [...hours].sort((a, b) => b.count - a.count).slice(0, 3),
    deals: perDeal,
    suggestions: suggest(perDeal),
  };
}
