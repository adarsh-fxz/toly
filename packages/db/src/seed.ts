// Demo data for local development: `pnpm db:seed`. Sign in with any seeded number; codes print in the API log.
import { eq } from "drizzle-orm";
import { seedDemoWheel } from "./demo-wheel";
import { createDb } from "./index";
import { deals, merchantMembers, merchants, user } from "./schema";

for (const file of ["../../.env"]) {
  try {
    process.loadEnvFile(file);
  } catch {}
}
if (process.env.NODE_ENV === "production")
  throw new Error("Refusing to seed a production database");
const url = process.env.DATABASE_URI;
if (!url) throw new Error("DATABASE_URI is not set");

const db = createDb(url, { max: 1 });

const owner = {
  id: "demo-owner",
  name: "Sunita Maharjan",
  phone: "+9779800000001",
};
const customers = [
  { id: "demo-customer-1", name: "Aayush Shrestha", phone: "+9779800000002" },
  { id: "demo-customer-2", name: "Pema Sherpa", phone: "+9779800000003" },
];

const venues = [
  {
    slug: "chiya-ghar-jhamsikhel",
    name: "Chiya Ghar",
    category: "cafe" as const,
    area: "Jhamsikhel",
    address: "Jhamsikhel Road, Lalitpur",
    description:
      "Masala chiya, sel roti and the best window seats on the street.",
    deals: [
      {
        slug: "afternoon-chiya-set-for-four",
        title: "Afternoon chiya set for four",
        description:
          "Four masala chiyas and two plates of sel roti, for slow weekday afternoons.",
        includes: [
          "4 masala chiya",
          "2 plates of sel roti",
          "1 bowl of aloo achar",
        ],
        partySize: 4,
        basePricePaisa: 112_000,
        groupPricePaisa: 84_000,
        availableDays: [1, 2, 3, 4, 5],
        availableFrom: "14:00",
        availableUntil: "17:30",
        terms: "Dine-in only. One voucher per table.",
      },
    ],
  },
  {
    slug: "momo-adda-thamel",
    name: "Momo Adda",
    category: "restaurant" as const,
    area: "Thamel",
    address: "Chaksibari Marg, Thamel, Kathmandu",
    description: "Jhol momo since 2009. Buff, chicken and veg.",
    deals: [
      {
        slug: "jhol-momo-for-three",
        title: "Jhol momo for three",
        description: "Three plates of jhol momo and a pot of tea.",
        includes: ["3 plates of jhol momo (any filling)", "1 pot of tea"],
        partySize: 3,
        basePricePaisa: 135_000,
        groupPricePaisa: 99_000,
        availableDays: [0, 1, 2, 3, 4, 5, 6],
        availableFrom: null,
        availableUntil: null,
        terms: "Not valid on public holidays.",
      },
    ],
  },
];

await db
  .insert(user)
  .values(
    [owner, ...customers].map((u) => ({
      id: u.id,
      name: u.name,
      email: `${u.phone.slice(1)}@phone.toly.invalid`,
      phoneNumber: u.phone,
      phoneNumberVerified: true,
    })),
  )
  .onConflictDoNothing();

for (const venue of venues) {
  const { deals: venueDeals, ...fields } = venue;
  const [existing] = await db
    .select({ id: merchants.id, createdById: merchants.createdById })
    .from(merchants)
    .where(eq(merchants.slug, venue.slug));
  if (existing) {
    if (existing.createdById === owner.id) await seedDemoWheel(db, existing.id);
    continue;
  }

  const [merchant] = await db
    .insert(merchants)
    .values({
      ...fields,
      phone: owner.phone,
      status: "approved",
      createdById: owner.id,
      reviewedAt: new Date(),
    })
    .returning({ id: merchants.id });
  if (!merchant) continue;
  await db
    .insert(merchantMembers)
    .values({ merchantId: merchant.id, userId: owner.id, role: "owner" });
  await db.insert(deals).values(
    venueDeals.map((d) => ({
      ...d,
      merchantId: merchant.id,
      status: "live" as const,
      publishedAt: new Date(),
    })),
  );

  await seedDemoWheel(db, merchant.id);
}

console.log(`Seeded ${venues.length} venues. Owner phone: ${owner.phone}`);
process.exit(0);
