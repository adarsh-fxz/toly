import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./columns";
import { merchants } from "./merchants";

export const dealStatus = pgEnum("deal_status", [
  "draft",
  "live",
  "paused",
  "ended",
]);

export const deals = pgTable(
  "deals",
  {
    id: uuid().primaryKey().defaultRandom(),
    merchantId: uuid()
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    slug: text().notNull().unique(),
    title: text().notNull(),
    description: text().notNull().default(""),
    includes: jsonb().$type<string[]>().notNull().default([]),
    partySize: smallint().notNull(),
    basePricePaisa: integer().notNull(),
    groupPricePaisa: integer().notNull(),
    // 0 = Sunday … 6 = Saturday, in Asia/Kathmandu.
    availableDays: jsonb()
      .$type<number[]>()
      .notNull()
      .default([0, 1, 2, 3, 4, 5, 6]),
    availableFrom: text(),
    availableUntil: text(),
    formationHours: smallint().notNull().default(24),
    // Null means the voucher stays valid until it is used.
    validityDays: smallint(),
    dailyCap: smallint(),
    terms: text().notNull().default(""),
    status: dealStatus().notNull().default("draft"),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index().on(t.merchantId, t.status),
    index().on(t.status, t.publishedAt),
    check("deals_party_size", sql`${t.partySize} between 2 and 10`),
    check(
      "deals_prices",
      sql`${t.groupPricePaisa} > 0 and ${t.groupPricePaisa} < ${t.basePricePaisa}`,
    ),
  ],
);
