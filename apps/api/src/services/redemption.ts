import { and, count, desc, eq, schema, sql, type Tx } from "@toly/db";
import { describeWindow, isAvailableAt } from "@toly/shared/availability";
import { db } from "../db";
import { audit } from "../lib/audit";
import { normalizeVoucherCode } from "../lib/codes";
import { ApiError } from "../lib/errors";
import { verifyVoucherToken } from "../lib/voucher-token";
import { requireMembership } from "./merchants";

const { vouchers, groups, deals, user } = schema;

export type VoucherRef = { token: string } | { code: string };

const notHere = () =>
  new ApiError(404, "NOT_VALID_HERE", "This code isn't valid at your venue");

async function resolveVoucherId(merchantId: string, ref: VoucherRef) {
  if ("token" in ref) {
    const check = verifyVoucherToken(ref.token);
    if (!check.ok) {
      throw check.reason === "TOKEN_EXPIRED"
        ? new ApiError(
            410,
            "TOKEN_EXPIRED",
            "This QR has expired. Ask them to reopen the voucher and scan again.",
          )
        : notHere();
    }
    return check.voucherId;
  }
  const [row] = await db
    .select({ id: vouchers.id })
    .from(vouchers)
    .where(
      and(
        eq(vouchers.code, normalizeVoucherCode(ref.code)),
        eq(vouchers.merchantId, merchantId),
      ),
    )
    .limit(1);
  if (!row) throw notHere();
  return row.id;
}

type Snapshot = (typeof groups.$inferSelect)["snapshot"];

async function loadVoucher(
  tx: Tx | typeof db,
  merchantId: string,
  voucherId: string,
  lock = false,
) {
  const query = tx
    .select({
      voucher: vouchers,
      holderName: user.name,
      snapshot: groups.snapshot,
      dealId: groups.dealId,
    })
    .from(vouchers)
    .innerJoin(user, eq(user.id, vouchers.holderId))
    .leftJoin(groups, eq(groups.id, vouchers.groupId))
    .where(and(eq(vouchers.id, voucherId), eq(vouchers.merchantId, merchantId)))
    .limit(1);
  const [row] = lock
    ? await query.for("update", { of: vouchers })
    : await query;
  if (!row) throw notHere();
  return row;
}

function problems(row: Awaited<ReturnType<typeof loadVoucher>>, now: Date) {
  const { voucher, snapshot } = row;
  if (voucher.status === "redeemed")
    return { code: "ALREADY_REDEEMED", message: "Already redeemed" };
  if (voucher.status === "void")
    return { code: "VOID", message: "This voucher was cancelled" };
  if (voucher.expiresAt && voucher.expiresAt <= now)
    return { code: "EXPIRED", message: "This voucher has expired" };
  if (snapshot && !isAvailableAt(snapshot, now)) {
    return {
      code: "OUTSIDE_HOURS",
      message: `Only valid ${describeWindow(snapshot)}`,
    };
  }
  return null;
}

function present(
  row: Awaited<ReturnType<typeof loadVoucher>>,
  now = new Date(),
) {
  const { voucher } = row;
  const problem = problems(row, now);
  return {
    id: voucher.id,
    code: voucher.code,
    kind: voucher.kind,
    title: voucher.title,
    details: voucher.details,
    holderName: row.holderName.trim().split(/\s+/)[0] || "Customer",
    status: voucher.status,
    redeemedAt: voucher.redeemedAt,
    expiresAt: voucher.expiresAt,
    window: row.snapshot ? describeWindow(row.snapshot as Snapshot) : null,
    canRedeem: problem === null,
    problem,
  };
}

/** Read-only check so staff can confirm the order before taking payment. */
export async function lookupVoucher(
  userId: string,
  merchantId: string,
  ref: VoucherRef,
) {
  await requireMembership(userId, merchantId);
  const voucherId = await resolveVoucherId(merchantId, ref);
  return present(await loadVoucher(db, merchantId, voucherId));
}

/**
 * Single-use redemption under a row lock. Retrying or scanning twice returns ALREADY_REDEEMED, never a
 * second redemption. Daily caps are counted under a per-deal lock so parallel counters can't overshoot.
 */
export async function redeemVoucher(
  userId: string,
  merchantId: string,
  voucherId: string,
  billAmountPaisa: number | null,
) {
  await requireMembership(userId, merchantId);
  return db.transaction(async (tx) => {
    const row = await loadVoucher(tx, merchantId, voucherId, true);
    const now = new Date();
    const problem = problems(row, now);
    if (problem) throw new ApiError(409, problem.code, problem.message);

    if (row.dealId) {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${`deal-cap:${row.dealId}`}))`,
      );
      const [deal] = await tx
        .select({ dailyCap: deals.dailyCap })
        .from(deals)
        .where(eq(deals.id, row.dealId));
      if (deal?.dailyCap) {
        const [used] = await tx
          .select({ total: count() })
          .from(vouchers)
          .innerJoin(groups, eq(groups.id, vouchers.groupId))
          .where(
            and(
              eq(groups.dealId, row.dealId),
              eq(vouchers.status, "redeemed"),
              sql`(${vouchers.redeemedAt} at time zone 'Asia/Kathmandu')::date = (now() at time zone 'Asia/Kathmandu')::date`,
            ),
          );
        if ((used?.total ?? 0) >= deal.dailyCap) {
          throw new ApiError(
            409,
            "DAILY_CAP",
            "Today's limit for this deal is used up. It resets at midnight.",
          );
        }
      }
    }

    const [updated] = await tx
      .update(vouchers)
      .set({
        status: "redeemed",
        redeemedAt: now,
        redeemedById: userId,
        billAmountPaisa,
      })
      .where(and(eq(vouchers.id, voucherId), eq(vouchers.status, "issued")))
      .returning({ id: vouchers.id, redeemedAt: vouchers.redeemedAt });
    if (!updated)
      throw new ApiError(409, "ALREADY_REDEEMED", "Already redeemed");

    await audit(
      {
        actorId: userId,
        action: "voucher.redeem",
        targetType: "voucher",
        targetId: voucherId,
        meta: billAmountPaisa ? { billAmountPaisa } : {},
      },
      tx,
    );
    return updated;
  });
}

export async function recentRedemptions(userId: string, merchantId: string) {
  await requireMembership(userId, merchantId);
  return db
    .select({
      id: vouchers.id,
      title: vouchers.title,
      redeemedAt: vouchers.redeemedAt,
      billAmountPaisa: vouchers.billAmountPaisa,
      staffName: user.name,
    })
    .from(vouchers)
    .leftJoin(user, eq(user.id, vouchers.redeemedById))
    .where(
      and(eq(vouchers.merchantId, merchantId), eq(vouchers.status, "redeemed")),
    )
    .orderBy(desc(vouchers.redeemedAt))
    .limit(10);
}
