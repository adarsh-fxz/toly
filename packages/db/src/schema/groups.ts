import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
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
import { deals } from "./deals";
import { merchants } from "./merchants";

export const groupStatus = pgEnum("group_status", [
  "forming",
  "unlocked",
  "expired",
  "cancelled",
]);

/** The deal terms a toly was started with. Later edits to the deal never change it. */
export type DealSnapshot = {
  dealSlug: string;
  title: string;
  includes: string[];
  basePricePaisa: number;
  groupPricePaisa: number;
  availableDays: number[];
  availableFrom: string | null;
  availableUntil: string | null;
  validityDays: number | null;
  terms: string;
  merchantName: string;
  merchantSlug: string;
  merchantArea: string;
  merchantAddress: string;
};

export const groups = pgTable(
  "groups",
  {
    id: uuid().primaryKey().defaultRandom(),
    dealId: uuid()
      .notNull()
      .references(() => deals.id),
    merchantId: uuid()
      .notNull()
      .references(() => merchants.id),
    organizerId: text()
      .notNull()
      .references(() => user.id),
    status: groupStatus().notNull().default("forming"),
    partySize: smallint().notNull(),
    snapshot: jsonb().$type<DealSnapshot>().notNull(),
    // Optional "when are we going" hint for the venue; never required.
    plannedFor: date(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    unlockedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index().on(t.status, t.expiresAt),
    index().on(t.organizerId, t.status),
    index().on(t.merchantId, t.createdAt),
  ],
);

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: uuid()
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.groupId, t.userId] }), index().on(t.userId)],
);

export const voucherKind = pgEnum("voucher_kind", ["group", "spin"]);
export const voucherStatus = pgEnum("voucher_status", [
  "issued",
  "redeemed",
  "void",
]);

export type VoucherDetails = {
  /** Whole-bill price for group vouchers. */
  groupPricePaisa?: number;
  basePricePaisa?: number;
  partySize?: number;
  includes?: string[];
  /** Spin vouchers: percent off, optionally limited to one item and capped. */
  percentOff?: number;
  appliesTo?: string | null;
  maxDiscountPaisa?: number | null;
  terms?: string;
};

export const vouchers = pgTable(
  "vouchers",
  {
    id: uuid().primaryKey().defaultRandom(),
    // Short manual-entry fallback for when a camera can't scan.
    code: text().notNull().unique(),
    kind: voucherKind().notNull(),
    merchantId: uuid()
      .notNull()
      .references(() => merchants.id),
    holderId: text()
      .notNull()
      .references(() => user.id),
    groupId: uuid()
      .unique()
      .references(() => groups.id),
    title: text().notNull(),
    details: jsonb().$type<VoucherDetails>().notNull(),
    status: voucherStatus().notNull().default("issued"),
    expiresAt: timestamp({ withTimezone: true }),
    redeemedAt: timestamp({ withTimezone: true }),
    redeemedById: text().references(() => user.id),
    billAmountPaisa: integer(),
    createdAt: createdAt(),
  },
  (t) => [
    index().on(t.holderId, t.status),
    index().on(t.merchantId, t.redeemedAt),
    check(
      "vouchers_redeemed_consistent",
      sql`(${t.status} = 'redeemed') = (${t.redeemedAt} is not null)`,
    ),
  ],
);
