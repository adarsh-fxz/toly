import { schema, sql } from "@toly/db";
import { runMigrations } from "@toly/db/migrate";
import { db } from "../src/db";

export const hasDatabase = Boolean(process.env.TEST_DATABASE_URI);

export async function resetDatabase() {
  await runMigrations(db);
  await db.execute(
    sql`truncate table spin_prize_days, spins, spin_prizes, spin_wheels, vouchers, group_members, groups, deals, merchant_members, merchants, audit_logs, "user" cascade`,
  );
}

export async function createUsers(count: number) {
  const rows = Array.from({ length: count }, (_, i) => ({
    id: `user-${i}-${crypto.randomUUID()}`,
    name: `Friend ${i}`,
    email: `friend${i}-${crypto.randomUUID()}@test.invalid`,
    phoneNumber: `+97798${String(10_000_000 + i).slice(-8)}`,
    phoneNumberVerified: true,
  }));
  await db.insert(schema.user).values(rows);
  return rows.map((r) => r.id);
}

export async function createLiveDeal(ownerId: string, partySize = 4) {
  const [merchant] = await db
    .insert(schema.merchants)
    .values({
      slug: `venue-${crypto.randomUUID().slice(0, 8)}`,
      name: "Test Café",
      category: "cafe",
      area: "Jhamsikhel",
      address: "Jhamsikhel Road",
      phone: "+9779800000000",
      status: "approved",
      createdById: ownerId,
    })
    .returning();
  if (!merchant) throw new Error("no merchant");
  await db
    .insert(schema.merchantMembers)
    .values({ merchantId: merchant.id, userId: ownerId, role: "owner" });
  const [deal] = await db
    .insert(schema.deals)
    .values({
      merchantId: merchant.id,
      slug: `deal-${crypto.randomUUID().slice(0, 8)}`,
      title: "Momo for the table",
      includes: ["Momo"],
      partySize,
      basePricePaisa: 160_000,
      groupPricePaisa: 120_000,
      status: "live",
      publishedAt: new Date(),
    })
    .returning();
  if (!deal) throw new Error("no deal");
  return { merchant, deal };
}
