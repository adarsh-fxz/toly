import { and, desc, eq, inArray, or, schema } from "@toly/db";
import { db } from "../db";
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
