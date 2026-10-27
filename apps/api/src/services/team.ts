import { and, eq, schema } from "@toly/db";
import { db } from "../db";
import { audit } from "../lib/audit";
import { ApiError, conflict, notFound } from "../lib/errors";
import { requireMembership } from "./merchants";

const { merchantMembers, user } = schema;

export async function listTeam(userId: string, merchantId: string) {
  await requireMembership(userId, merchantId, ["owner"]);
  return db
    .select({
      userId: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: merchantMembers.role,
    })
    .from(merchantMembers)
    .innerJoin(user, eq(user.id, merchantMembers.userId))
    .where(eq(merchantMembers.merchantId, merchantId))
    .orderBy(merchantMembers.createdAt);
}

export async function addStaff(
  userId: string,
  merchantId: string,
  phoneNumber: string,
) {
  await requireMembership(userId, merchantId, ["owner"]);
  const [person] = await db
    .select({ id: user.id, verified: user.phoneNumberVerified })
    .from(user)
    .where(eq(user.phoneNumber, phoneNumber))
    .limit(1);
  if (!person?.verified) {
    throw new ApiError(
      404,
      "NO_ACCOUNT",
      "No Toly account uses this number yet. Ask them to sign in once with it, then add them again.",
    );
  }
  const added = await db
    .insert(merchantMembers)
    .values({ merchantId, userId: person.id, role: "staff" })
    .onConflictDoNothing()
    .returning({ userId: merchantMembers.userId });
  if (added.length === 0)
    throw conflict("ALREADY_MEMBER", "They're already on your team");
  await audit({
    actorId: userId,
    action: "team.add",
    targetType: "merchant",
    targetId: merchantId,
    meta: { staffId: person.id },
  });
}

/** Access is checked per request against this table, so removal takes effect immediately. */
export async function removeStaff(
  userId: string,
  merchantId: string,
  staffId: string,
) {
  await requireMembership(userId, merchantId, ["owner"]);
  if (staffId === userId)
    throw new ApiError(400, "CANNOT_REMOVE_SELF", "You can't remove yourself");
  const removed = await db
    .delete(merchantMembers)
    .where(
      and(
        eq(merchantMembers.merchantId, merchantId),
        eq(merchantMembers.userId, staffId),
        eq(merchantMembers.role, "staff"),
      ),
    )
    .returning({ userId: merchantMembers.userId });
  if (removed.length === 0) throw notFound("Team member not found");
  await audit({
    actorId: userId,
    action: "team.remove",
    targetType: "merchant",
    targetId: merchantId,
    meta: { staffId },
  });
}
