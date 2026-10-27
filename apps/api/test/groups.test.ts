import { count, eq, schema } from "@toly/db";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import type { ApiError } from "../src/lib/errors";
import { getGroupView, joinGroup, startGroup } from "../src/services/groups";
import {
  createLiveDeal,
  createUsers,
  hasDatabase,
  resetDatabase,
} from "./helpers";

describe.skipIf(!hasDatabase)("groups", () => {
  beforeEach(resetDatabase);

  it("fills the last seat exactly once under concurrent joins", async () => {
    const [organizer, ...friends] = await createUsers(30);
    if (!organizer) throw new Error("no users");
    const { deal } = await createLiveDeal(organizer, 4);
    const group = await startGroup(organizer, deal.slug, null);

    const results = await Promise.allSettled(
      friends.map((id) => joinGroup(id, group.id)),
    );
    const joined = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(joined).toHaveLength(3);
    for (const r of rejected) {
      expect((r.reason as ApiError).code).toBe("GROUP_CLOSED");
    }

    const [members] = await db
      .select({ total: count() })
      .from(schema.groupMembers)
      .where(eq(schema.groupMembers.groupId, group.id));
    const issued = await db
      .select()
      .from(schema.vouchers)
      .where(eq(schema.vouchers.groupId, group.id));

    expect(members?.total).toBe(4);
    expect(issued).toHaveLength(1);
    expect(issued[0]?.holderId).toBe(organizer);
    expect(issued[0]?.expiresAt).toBeNull();
  });

  it("treats a repeated join as a no-op", async () => {
    const [organizer, friend] = await createUsers(2);
    if (!organizer || !friend) throw new Error("no users");
    const { deal } = await createLiveDeal(organizer, 3);
    const group = await startGroup(organizer, deal.slug, null);

    await Promise.all([
      joinGroup(friend, group.id),
      joinGroup(friend, group.id),
    ]);
    const view = await getGroupView(group.id, friend);
    expect(view.members).toHaveLength(2);
    expect(view.status).toBe("forming");
  });

  it("refuses joins after the formation window closes", async () => {
    const [organizer, friend] = await createUsers(2);
    if (!organizer || !friend) throw new Error("no users");
    const { deal } = await createLiveDeal(organizer, 2);
    const group = await startGroup(organizer, deal.slug, null);
    await db
      .update(schema.groups)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.groups.id, group.id));

    await expect(joinGroup(friend, group.id)).rejects.toMatchObject({
      code: "GROUP_EXPIRED",
    });
    const view = await getGroupView(group.id, friend);
    expect(view.status).toBe("expired");
  });

  it("only shows first names to people with the link", async () => {
    const [organizer] = await createUsers(1);
    if (!organizer) throw new Error("no users");
    await db
      .update(schema.user)
      .set({ name: "Aarati Shrestha" })
      .where(eq(schema.user.id, organizer));
    const { deal } = await createLiveDeal(organizer, 4);
    const group = await startGroup(organizer, deal.slug, null);

    const view = await getGroupView(group.id, null);
    expect(view.members).toEqual([
      { name: "Aarati", isOrganizer: true, isYou: false },
    ]);
    expect(JSON.stringify(view)).not.toContain("+977");
  });
});
