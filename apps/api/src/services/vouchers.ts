import { and, desc, eq, inArray, or, schema, type Tx } from "@toly/db";
import { db } from "../db";
import { voucherCode } from "../lib/codes";
import { notFound } from "../lib/errors";

const { vouchers, groupMembers, merchants } = schema;

/** A voucher is visible to its holder and, for group vouchers, to everyone in the toly. */
function visibleTo(userId: string) {
  return or(
    eq(vouchers.holderId, userId),
    inArray(
      vouchers.groupId,
      db
        .select({ id: groupMembers.groupId })
        .from(groupMembers)
        .where(eq(groupMembers.userId, userId)),
    ),
  );
}

const voucherColumns = {
  id: vouchers.id,
  code: vouchers.code,
  kind: vouchers.kind,
  title: vouchers.title,
  details: vouchers.details,
  status: vouchers.status,
  expiresAt: vouchers.expiresAt,
  redeemedAt: vouchers.redeemedAt,
  createdAt: vouchers.createdAt,
  groupId: vouchers.groupId,
  merchant: {
    name: merchants.name,
    slug: merchants.slug,
    area: merchants.area,
    address: merchants.address,
  },
};

export async function listMyVouchers(userId: string) {
  return db
    .select(voucherColumns)
    .from(vouchers)
    .innerJoin(merchants, eq(merchants.id, vouchers.merchantId))
    .where(visibleTo(userId))
    .orderBy(desc(vouchers.createdAt))
    .limit(50);
}

export async function getMyVoucher(userId: string, voucherId: string) {
  const [voucher] = await db
    .select(voucherColumns)
    .from(vouchers)
    .innerJoin(merchants, eq(merchants.id, vouchers.merchantId))
    .where(and(eq(vouchers.id, voucherId), visibleTo(userId)))
    .limit(1);
  if (!voucher) throw notFound("Voucher not found");
  return voucher;
}

/** Expiry for a voucher valid for `days`, or null when it stays valid until used. */
export function daysFromNow(days: number | null) {
  return days ? new Date(Date.now() + days * 86_400_000) : null;
}

type NewVoucher = Omit<typeof vouchers.$inferInsert, "id" | "code">;

/** Inserts a voucher with a fresh random code, retrying on the rare code collision. */
export async function insertVoucher(tx: Tx, values: NewVoucher) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const [row] = await tx
      .insert(vouchers)
      .values({ ...values, code: voucherCode() })
      .onConflictDoNothing({ target: vouchers.code })
      .returning({ id: vouchers.id });
    if (row) return row;
  }
  throw new Error("Could not generate a unique voucher code");
}
