import {
  and,
  count,
  desc,
  eq,
  inArray,
  lt,
  schema,
  sql,
  type Tx,
} from "@toly/db";
import type { DealSnapshot } from "@toly/db/schema";
import { db } from "../db";
import { voucherCode } from "../lib/codes";
import { ApiError, conflict, notFound } from "../lib/errors";

const { deals, groups, groupMembers, merchants, vouchers, user } = schema;

const MAX_FORMING_PER_USER = 5;

export async function startGroup(
  userId: string,
  dealSlug: string,
  plannedFor: string | null,
) {
  const [deal] = await db
    .select({ deal: deals, merchant: merchants })
    .from(deals)
    .innerJoin(merchants, eq(merchants.id, deals.merchantId))
    .where(eq(deals.slug, dealSlug))
    .limit(1);
  if (deal?.deal.status !== "live" || deal.merchant.status !== "approved") {
    throw conflict(
      "DEAL_UNAVAILABLE",
      "This deal isn't taking new tolys right now",
    );
  }

  const snapshot: DealSnapshot = {
    dealSlug: deal.deal.slug,
    title: deal.deal.title,
    includes: deal.deal.includes,
    basePricePaisa: deal.deal.basePricePaisa,
    groupPricePaisa: deal.deal.groupPricePaisa,
    availableDays: deal.deal.availableDays,
    availableFrom: deal.deal.availableFrom,
    availableUntil: deal.deal.availableUntil,
    validityDays: deal.deal.validityDays,
    terms: deal.deal.terms,
    merchantName: deal.merchant.name,
    merchantSlug: deal.merchant.slug,
    merchantArea: deal.merchant.area,
    merchantAddress: deal.merchant.address,
  };

  return db.transaction(async (tx) => {
    // Serialise starts per user so the open-toly limit can't be raced.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`group-start:${userId}`}))`,
    );
    const [open] = await tx
      .select({ total: count() })
      .from(groupMembers)
      .innerJoin(groups, eq(groups.id, groupMembers.groupId))
      .where(
        and(
          eq(groupMembers.userId, userId),
          eq(groups.status, "forming"),
          sql`${groups.expiresAt} > now()`,
        ),
      );
    if ((open?.total ?? 0) >= MAX_FORMING_PER_USER) {
      throw conflict(
        "TOO_MANY_OPEN",
        `You can be in up to ${MAX_FORMING_PER_USER} open tolys at once`,
      );
    }

    const [group] = await tx
      .insert(groups)
      .values({
        dealId: deal.deal.id,
        merchantId: deal.merchant.id,
        organizerId: userId,
        partySize: deal.deal.partySize,
        snapshot,
        plannedFor,
        expiresAt: sql`now() + make_interval(hours => ${deal.deal.formationHours})`,
      })
      .returning({ id: groups.id });
    if (!group) throw new Error("Group insert returned no row");
    await tx.insert(groupMembers).values({ groupId: group.id, userId });
    return group;
  });
}

async function issueGroupVoucher(tx: Tx, group: typeof groups.$inferSelect) {
  const { snapshot } = group;
  for (let attempt = 0; attempt < 5; attempt++) {
    const inserted = await tx
      .insert(vouchers)
      .values({
        code: voucherCode(),
        kind: "group",
        merchantId: group.merchantId,
        holderId: group.organizerId,
        groupId: group.id,
        title: snapshot.title,
        details: {
          groupPricePaisa: snapshot.groupPricePaisa,
          basePricePaisa: snapshot.basePricePaisa,
          partySize: group.partySize,
          includes: snapshot.includes,
          terms: snapshot.terms,
        },
        expiresAt: snapshot.validityDays
          ? sql`now() + make_interval(days => ${snapshot.validityDays})`
          : null,
      })
      .onConflictDoNothing({ target: vouchers.code })
      .returning({ id: vouchers.id });
    if (inserted.length > 0) return;
  }
  throw new Error("Could not generate a unique voucher code");
}

/**
 * Joins under a row lock on the group, so concurrent joins for the last seat resolve to exactly one
 * winner and exactly one voucher.
 */
export async function joinGroup(userId: string, groupId: string) {
  return db.transaction(async (tx) => {
    const [group] = await tx
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .for("update")
      .limit(1);
    if (!group) throw notFound("This toly doesn't exist");

    const [existing] = await tx
      .select({ userId: groupMembers.userId })
      .from(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
      )
      .limit(1);
    if (existing) return { status: group.status };

    if (group.status === "forming" && group.expiresAt <= new Date()) {
      await tx
        .update(groups)
        .set({ status: "expired" })
        .where(eq(groups.id, groupId));
      throw conflict(
        "GROUP_EXPIRED",
        "This toly ran out of time before it filled",
      );
    }
    if (group.status !== "forming") {
      throw conflict("GROUP_CLOSED", "This toly isn't taking new members");
    }

    const [{ total } = { total: 0 }] = await tx
      .select({ total: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));
    if (total >= group.partySize)
      throw conflict("GROUP_FULL", "This toly is already full");

    await tx.insert(groupMembers).values({ groupId, userId });

    if (total + 1 === group.partySize) {
      await tx
        .update(groups)
        .set({ status: "unlocked", unlockedAt: new Date() })
        .where(eq(groups.id, groupId));
      await issueGroupVoucher(tx, group);
      return { status: "unlocked" as const };
    }
    return { status: "forming" as const };
  });
}

export async function leaveGroup(userId: string, groupId: string) {
  return db.transaction(async (tx) => {
    const [group] = await tx
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .for("update")
      .limit(1);
    if (!group) throw notFound("This toly doesn't exist");
    if (group.status !== "forming")
      throw conflict(
        "GROUP_CLOSED",
        "You can only leave while the toly is filling",
      );

    if (group.organizerId === userId) {
      await tx
        .update(groups)
        .set({ status: "cancelled" })
        .where(eq(groups.id, groupId));
      return { status: "cancelled" as const };
    }
    const removed = await tx
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
      )
      .returning({ userId: groupMembers.userId });
    if (removed.length === 0)
      throw new ApiError(400, "NOT_MEMBER", "You're not in this toly");
    return { status: "forming" as const };
  });
}

/** Marks overdue forming tolys as expired. Idempotent, safe to run from several instances. */
export async function expireOverdueGroups() {
  const expired = await db
    .update(groups)
    .set({ status: "expired" })
    .where(and(eq(groups.status, "forming"), lt(groups.expiresAt, sql`now()`)))
    .returning({ id: groups.id });
  return expired.length;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "Friend";
}

/** Anyone with the link can see a toly, but only first names, never phone numbers. */
export async function getGroupView(groupId: string, viewerId: string | null) {
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);
  if (!group) throw notFound("This toly doesn't exist");

  const status =
    group.status === "forming" && group.expiresAt <= new Date()
      ? ("expired" as const)
      : group.status;

  const members = await db
    .select({
      userId: groupMembers.userId,
      name: user.name,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(user, eq(user.id, groupMembers.userId))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(groupMembers.joinedAt);

  const isMember = viewerId
    ? members.some((m) => m.userId === viewerId)
    : false;
  const [voucher] =
    isMember && status === "unlocked"
      ? await db
          .select({ id: vouchers.id })
          .from(vouchers)
          .where(eq(vouchers.groupId, groupId))
          .limit(1)
      : [];

  return {
    id: group.id,
    status,
    partySize: group.partySize,
    plannedFor: group.plannedFor,
    expiresAt: group.expiresAt,
    unlockedAt: group.unlockedAt,
    deal: group.snapshot,
    members: members.map((m) => ({
      name: firstName(m.name),
      isOrganizer: m.userId === group.organizerId,
      isYou: m.userId === viewerId,
    })),
    viewer: {
      signedIn: Boolean(viewerId),
      isMember,
      isOrganizer: viewerId === group.organizerId,
    },
    voucherId: voucher?.id ?? null,
  };
}

export async function listMyGroups(userId: string) {
  const rows = await db
    .select({
      id: groups.id,
      status: groups.status,
      partySize: groups.partySize,
      expiresAt: groups.expiresAt,
      plannedFor: groups.plannedFor,
      title: sql<string>`${groups.snapshot}->>'title'`,
      merchantName: sql<string>`${groups.snapshot}->>'merchantName'`,
      createdAt: groups.createdAt,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groups.createdAt))
    .limit(50);
  if (rows.length === 0) return [];

  const counts = await db
    .select({ groupId: groupMembers.groupId, total: count() })
    .from(groupMembers)
    .where(
      inArray(
        groupMembers.groupId,
        rows.map((r) => r.id),
      ),
    )
    .groupBy(groupMembers.groupId);
  const filled = new Map(counts.map((c) => [c.groupId, c.total]));
  const now = new Date();

  return rows.map((r) => ({
    ...r,
    status:
      r.status === "forming" && r.expiresAt <= now
        ? ("expired" as const)
        : r.status,
    filled: filled.get(r.id) ?? 0,
  }));
}
