import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createdAt, updatedAt } from "./columns";
import { vouchers } from "./groups";
import { merchants } from "./merchants";

export const spinWheels = pgTable(
  "spin_wheels",
  {
    merchantId: uuid()
      .primaryKey()
      .references(() => merchants.id, { onDelete: "cascade" }),
    enabled: boolean().notNull().default(false),
    pricePaisa: integer().notNull(),
    dailyLimitPerUser: smallint().notNull().default(3),
    // Null means prize vouchers stay valid until used.
    validityDays: smallint(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("spin_wheels_price", sql`${t.pricePaisa} between 1000 and 50000`),
  ],
);

export const spinPrizes = pgTable(
  "spin_prizes",
  {
    id: uuid().primaryKey().defaultRandom(),
    merchantId: uuid()
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    label: text().notNull(),
    percentOff: smallint().notNull(),
    // Null means the discount applies to the whole bill.
    appliesTo: text(),
    maxDiscountPaisa: integer(),
    weight: integer().notNull(),
    // Null means unlimited; otherwise the most that can be won per day.
    dailyStock: integer(),
    active: boolean().notNull().default(true),
    sortOrder: smallint().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index().on(t.merchantId, t.active),
    check("spin_prizes_percent", sql`${t.percentOff} between 1 and 100`),
    check("spin_prizes_weight", sql`${t.weight} > 0`),
  ],
);

/** How many of a prize were won on a Kathmandu calendar day, for daily stock. */
export const spinPrizeDays = pgTable(
  "spin_prize_days",
  {
    prizeId: uuid()
      .notNull()
      .references(() => spinPrizes.id, { onDelete: "cascade" }),
    day: date().notNull(),
    awarded: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.prizeId, t.day] })],
);

export const spinStatus = pgEnum("spin_status", [
  "pending",
  "paid",
  "spun",
  "failed",
]);

export const spins = pgTable(
  "spins",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id),
    merchantId: uuid()
      .notNull()
      .references(() => merchants.id),
    pricePaisa: integer().notNull(),
    status: spinStatus().notNull().default("pending"),
    provider: text().notNull(),
    providerRef: text().unique(),
    prizeId: uuid().references(() => spinPrizes.id),
    voucherId: uuid()
      .unique()
      .references(() => vouchers.id),
    paidAt: timestamp({ withTimezone: true }),
    spunAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index().on(t.userId, t.merchantId, t.createdAt),
    index().on(t.merchantId, t.status),
  ],
);
