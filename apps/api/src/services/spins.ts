import { randomInt } from "node:crypto";
import {
  and,
  asc,
  count,
  eq,
  inArray,
  notInArray,
  schema,
  sql,
} from "@toly/db";
import {
  oddsPercent,
  pickWeighted,
  type wheelInputSchema,
} from "@toly/shared/spin";
import type { z } from "zod";
import { db } from "../db";
import { env } from "../env";
import { audit } from "../lib/audit";
import { ApiError, conflict, notFound } from "../lib/errors";
import { payments } from "../lib/payments";
import { requireMembership } from "./merchants";
import { daysFromNow, insertVoucher } from "./vouchers";

const { spinWheels, spinPrizes, spinPrizeDays, spins, merchants } = schema;

type WheelInput = z.output<typeof wheelInputSchema>;
type Spinner = { id: string; name: string; phoneNumber?: string | null };

const kathmanduToday = sql`(now() at time zone 'Asia/Kathmandu')::date`;

async function activePrizes(merchantId: string) {
  return db
    .select()
    .from(spinPrizes)
    .where(
      and(eq(spinPrizes.merchantId, merchantId), eq(spinPrizes.active, true)),
    )
    .orderBy(asc(spinPrizes.sortOrder));
}

export async function getPublicWheel(slug: string) {
  const [row] = await db
    .select({ merchant: merchants, wheel: spinWheels })
    .from(merchants)
    .innerJoin(spinWheels, eq(spinWheels.merchantId, merchants.id))
    .where(
      and(
        eq(merchants.slug, slug),
        eq(merchants.status, "approved"),
        eq(spinWheels.enabled, true),
      ),
    )
    .limit(1);
  if (!row) throw notFound("This venue doesn't have Toly Spin");

  const prizes = await activePrizes(row.merchant.id);
  const odds = oddsPercent(prizes);
  return {
    merchant: {
      id: row.merchant.id,
      slug: row.merchant.slug,
      name: row.merchant.name,
      area: row.merchant.area,
    },
    pricePaisa: row.wheel.pricePaisa,
    dailyLimitPerUser: row.wheel.dailyLimitPerUser,
    validityDays: row.wheel.validityDays,
    prizes: prizes.map((p, i) => ({
      id: p.id,
      label: p.label,
      percentOff: p.percentOff,
      appliesTo: p.appliesTo,
      maxDiscountPaisa: p.maxDiscountPaisa,
      limited: p.dailyStock !== null,
      odds: odds[i] ?? 0,
    })),
  };
}

export async function getOwnerWheel(userId: string, merchantId: string) {
  await requireMembership(userId, merchantId, ["owner"]);
  const [wheel] = await db
    .select()
    .from(spinWheels)
    .where(eq(spinWheels.merchantId, merchantId))
    .limit(1);
  const prizes = await activePrizes(merchantId);
  return { wheel: wheel ?? null, prizes };
}

/** Removed prizes are deactivated rather than deleted, so past spins keep their history. */
export async function saveWheel(
  userId: string,
  merchantId: string,
  input: WheelInput,
) {
  const { merchant } = await requireMembership(userId, merchantId, ["owner"]);
  if (input.enabled && merchant.status !== "approved") {
    throw new ApiError(
      409,
      "VENUE_NOT_APPROVED",
      "Your venue needs to be approved before the wheel goes live",
    );
  }

  await db.transaction(async (tx) => {
    const wheel = {
      enabled: input.enabled,
      pricePaisa: input.price * 100,
      dailyLimitPerUser: input.dailyLimitPerUser,
      validityDays: input.validityDays ?? null,
    };
    await tx
      .insert(spinWheels)
      .values({ merchantId, ...wheel })
      .onConflictDoUpdate({ target: spinWheels.merchantId, set: wheel });

    const keep = input.prizes.flatMap((p) => (p.id ? [p.id] : []));
    await tx
      .update(spinPrizes)
      .set({ active: false })
      .where(
        and(
          eq(spinPrizes.merchantId, merchantId),
          keep.length ? notInArray(spinPrizes.id, keep) : undefined,
        ),
      );

    for (const [index, prize] of input.prizes.entries()) {
      const values = {
        label: prize.label,
        percentOff: prize.percentOff,
        appliesTo: prize.appliesTo ?? null,
        maxDiscountPaisa: prize.maxDiscount ? prize.maxDiscount * 100 : null,
        weight: prize.weight,
        dailyStock: prize.dailyStock ?? null,
        active: true,
        sortOrder: index,
      };
      if (prize.id) {
        await tx
          .update(spinPrizes)
          .set(values)
          .where(
            and(
              eq(spinPrizes.id, prize.id),
              eq(spinPrizes.merchantId, merchantId),
            ),
          );
      } else {
        await tx.insert(spinPrizes).values({ ...values, merchantId });
      }
    }
    await audit(
      {
        actorId: userId,
        action: "spin.wheel_save",
        targetType: "merchant",
        targetId: merchantId,
        meta: wheel,
      },
      tx,
    );
  });
  return getOwnerWheel(userId, merchantId);
}

export async function startSpin(spinner: Spinner, merchantSlug: string) {
  const wheel = await getPublicWheel(merchantSlug);
  const merchantId = wheel.merchant.id;

  const [ready] = await db
    .select({ id: spins.id })
    .from(spins)
    .where(
      and(
        eq(spins.userId, spinner.id),
        eq(spins.merchantId, merchantId),
        eq(spins.status, "paid"),
      ),
    )
    .limit(1);
  if (ready) return { spinId: ready.id, paymentUrl: null };

  const [today] = await db
    .select({ total: count() })
    .from(spins)
    .where(
      and(
        eq(spins.userId, spinner.id),
        eq(spins.merchantId, merchantId),
        inArray(spins.status, ["paid", "spun"]),
        sql`(${spins.createdAt} at time zone 'Asia/Kathmandu')::date = ${kathmanduToday}`,
      ),
    );
  if ((today?.total ?? 0) >= wheel.dailyLimitPerUser) {
    throw conflict(
      "DAILY_LIMIT",
      `You've used today's ${wheel.dailyLimitPerUser} spins here. Come back tomorrow.`,
    );
  }

  const [spin] = await db
    .insert(spins)
    .values({
      userId: spinner.id,
      merchantId,
      pricePaisa: wheel.pricePaisa,
      provider: payments.name,
    })
    .returning({ id: spins.id });
  if (!spin) throw new Error("Spin insert returned no row");

  const { ref, paymentUrl } = await payments.initiate({
    orderId: spin.id,
    orderName: `Toly Spin at ${wheel.merchant.name}`,
    amountPaisa: wheel.pricePaisa,
    returnUrl: `${env.WEB_URL}/spin/return?spin=${spin.id}`,
    customer: { name: spinner.name, phone: spinner.phoneNumber ?? null },
  });
  await db.update(spins).set({ providerRef: ref }).where(eq(spins.id, spin.id));
  return { spinId: spin.id, paymentUrl };
}

async function ownSpin(userId: string, spinId: string) {
  const [spin] = await db
    .select()
    .from(spins)
    .where(and(eq(spins.id, spinId), eq(spins.userId, userId)))
    .limit(1);
  if (!spin) throw notFound("Spin not found");
  return spin;
}

/** Asks the payment provider directly. A spin becomes playable only when the provider confirms the exact amount. */
export async function confirmSpin(userId: string, spinId: string) {
  const spin = await ownSpin(userId, spinId);
  if (spin.status !== "pending" || !spin.providerRef)
    return { status: spin.status };

  const result = await payments.lookup(spin.providerRef);
  if (result.status === "completed" && result.amountPaisa === spin.pricePaisa) {
    await db
      .update(spins)
      .set({ status: "paid", paidAt: new Date() })
      .where(and(eq(spins.id, spinId), eq(spins.status, "pending")));
    return { status: "paid" as const };
  }
  if (
    result.status === "failed" ||
    (result.status === "completed" && result.amountPaisa !== spin.pricePaisa)
  ) {
    await db
      .update(spins)
      .set({ status: "failed" })
      .where(and(eq(spins.id, spinId), eq(spins.status, "pending")));
    return { status: "failed" as const };
  }
  return { status: "pending" as const };
}

/**
 * Draws the prize on the server with a CSPRNG. The spin row is locked, so replays return the original result,
 * and daily stock is counted under a per-venue lock so limited prizes can't be over-awarded.
 */
export async function playSpin(userId: string, spinId: string) {
  return db.transaction(async (tx) => {
    const [spin] = await tx
      .select()
      .from(spins)
      .where(and(eq(spins.id, spinId), eq(spins.userId, userId)))
      .for("update")
      .limit(1);
    if (!spin) throw notFound("Spin not found");

    if (spin.status === "spun" && spin.prizeId && spin.voucherId) {
      return { prizeId: spin.prizeId, voucherId: spin.voucherId };
    }
    if (spin.status !== "paid")
      throw new ApiError(409, "NOT_PAID", "This spin hasn't been paid for");

    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`spin-stock:${spin.merchantId}`}))`,
    );
    const candidates = await tx
      .select({
        prize: spinPrizes,
        awarded: sql<number>`coalesce(${spinPrizeDays.awarded}, 0)`,
      })
      .from(spinPrizes)
      .leftJoin(
        spinPrizeDays,
        and(
          eq(spinPrizeDays.prizeId, spinPrizes.id),
          eq(spinPrizeDays.day, kathmanduToday),
        ),
      )
      .where(
        and(
          eq(spinPrizes.merchantId, spin.merchantId),
          eq(spinPrizes.active, true),
        ),
      )
      .orderBy(asc(spinPrizes.sortOrder));
    const eligible = candidates
      .filter(
        ({ prize, awarded }) =>
          prize.dailyStock === null || Number(awarded) < prize.dailyStock,
      )
      .map(({ prize }) => prize);
    if (eligible.length === 0)
      throw new Error(`No eligible prizes for merchant ${spin.merchantId}`);

    const totalWeight = eligible.reduce((sum, p) => sum + p.weight, 0);
    const prize = eligible[pickWeighted(eligible, randomInt(totalWeight))];
    if (!prize) throw new Error("Weighted pick returned nothing");

    await tx
      .insert(spinPrizeDays)
      .values({ prizeId: prize.id, day: kathmanduToday, awarded: 1 })
      .onConflictDoUpdate({
        target: [spinPrizeDays.prizeId, spinPrizeDays.day],
        set: { awarded: sql`${spinPrizeDays.awarded} + 1` },
      });

    const [wheel] = await tx
      .select()
      .from(spinWheels)
      .where(eq(spinWheels.merchantId, spin.merchantId));
    const voucher = await insertVoucher(tx, {
      kind: "spin",
      merchantId: spin.merchantId,
      holderId: userId,
      title: prize.label,
      details: {
        percentOff: prize.percentOff,
        appliesTo: prize.appliesTo,
        maxDiscountPaisa: prize.maxDiscountPaisa,
      },
      expiresAt: daysFromNow(wheel?.validityDays ?? null),
    });

    await tx
      .update(spins)
      .set({
        status: "spun",
        spunAt: new Date(),
        prizeId: prize.id,
        voucherId: voucher.id,
      })
      .where(eq(spins.id, spinId));
    await audit(
      {
        actorId: userId,
        action: "spin.play",
        targetType: "spin",
        targetId: spinId,
        meta: { prizeId: prize.id },
      },
      tx,
    );
    return { prizeId: prize.id, voucherId: voucher.id };
  });
}

export async function getSpin(userId: string, spinId: string) {
  const spin = await ownSpin(userId, spinId);
  const [merchant] = await db
    .select({ slug: merchants.slug })
    .from(merchants)
    .where(eq(merchants.id, spin.merchantId))
    .limit(1);
  return {
    id: spin.id,
    status: spin.status,
    merchantSlug: merchant?.slug ?? null,
    prizeId: spin.prizeId,
    voucherId: spin.voucherId,
  };
}
