import { and, desc, eq, schema } from "@toly/db";
import type {
  merchantApplicationSchema,
  merchantReviewSchema,
} from "@toly/shared/merchant";
import { slugify } from "@toly/shared/slug";
import type { z } from "zod";
import { db } from "../db";
import { audit } from "../lib/audit";
import { conflict, forbidden, notFound } from "../lib/errors";

const { merchants, merchantMembers } = schema;

type Application = z.output<typeof merchantApplicationSchema>;
type Review = z.output<typeof merchantReviewSchema>;
export type MerchantRole = (typeof schema.merchantRole.enumValues)[number];

async function uniqueSlug(name: string) {
  const base = slugify(name) || "venue";
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug =
      attempt === 0 ? base : `${base}-${crypto.randomUUID().slice(0, 4)}`;
    const [taken] = await db
      .select({ id: merchants.id })
      .from(merchants)
      .where(eq(merchants.slug, slug))
      .limit(1);
    if (!taken) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function applyForMerchant(userId: string, input: Application) {
  const [pending] = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(
      and(eq(merchants.createdById, userId), eq(merchants.status, "pending")),
    )
    .limit(1);
  if (pending) {
    throw conflict(
      "APPLICATION_PENDING",
      "You already have an application under review. We'll update you soon.",
    );
  }

  const slug = await uniqueSlug(input.name);
  return db.transaction(async (tx) => {
    const [merchant] = await tx
      .insert(merchants)
      .values({ ...input, slug, createdById: userId })
      .returning();
    if (!merchant) throw new Error("Merchant insert returned no row");
    await tx
      .insert(merchantMembers)
      .values({ merchantId: merchant.id, userId, role: "owner" });
    await audit(
      {
        actorId: userId,
        action: "merchant.apply",
        targetType: "merchant",
        targetId: merchant.id,
      },
      tx,
    );
    return merchant;
  });
}

export async function listMyMerchants(userId: string) {
  return db
    .select({
      id: merchants.id,
      slug: merchants.slug,
      name: merchants.name,
      area: merchants.area,
      category: merchants.category,
      status: merchants.status,
      reviewNote: merchants.reviewNote,
      role: merchantMembers.role,
    })
    .from(merchantMembers)
    .innerJoin(merchants, eq(merchants.id, merchantMembers.merchantId))
    .where(eq(merchantMembers.userId, userId))
    .orderBy(desc(merchants.createdAt));
}

/** Loads a merchant only if the user is a member with one of the given roles. */
export async function requireMembership(
  userId: string,
  merchantId: string,
  roles: MerchantRole[] = ["owner", "staff"],
) {
  const [row] = await db
    .select({ merchant: merchants, role: merchantMembers.role })
    .from(merchantMembers)
    .innerJoin(merchants, eq(merchants.id, merchantMembers.merchantId))
    .where(
      and(
        eq(merchantMembers.userId, userId),
        eq(merchantMembers.merchantId, merchantId),
      ),
    )
    .limit(1);
  if (!row) throw notFound("Venue not found");
  if (!roles.includes(row.role))
    throw forbidden("Only the venue owner can do this");
  return row;
}

export async function updateMerchant(
  userId: string,
  merchantId: string,
  input: Application,
) {
  await requireMembership(userId, merchantId, ["owner"]);
  const [merchant] = await db
    .update(merchants)
    .set(input)
    .where(eq(merchants.id, merchantId))
    .returning();
  return merchant;
}

export async function listMerchantsForReview(
  status: (typeof schema.merchantStatus.enumValues)[number],
) {
  return db
    .select({
      id: merchants.id,
      name: merchants.name,
      category: merchants.category,
      area: merchants.area,
      address: merchants.address,
      phone: merchants.phone,
      panNumber: merchants.panNumber,
      description: merchants.description,
      status: merchants.status,
      createdAt: merchants.createdAt,
      applicantName: schema.user.name,
    })
    .from(merchants)
    .innerJoin(schema.user, eq(schema.user.id, merchants.createdById))
    .where(eq(merchants.status, status))
    .orderBy(merchants.createdAt)
    .limit(100);
}

export async function reviewMerchant(
  adminId: string,
  merchantId: string,
  review: Review,
) {
  return db.transaction(async (tx) => {
    const [merchant] = await tx
      .update(merchants)
      .set({
        status: review.decision,
        reviewNote: review.note ?? null,
        reviewedAt: new Date(),
      })
      .where(eq(merchants.id, merchantId))
      .returning({ id: merchants.id, status: merchants.status });
    if (!merchant) throw notFound("Venue not found");
    await audit(
      {
        actorId: adminId,
        action: `merchant.${review.decision}`,
        targetType: "merchant",
        targetId: merchantId,
        meta: review.note ? { note: review.note } : {},
      },
      tx,
    );
    return merchant;
  });
}
