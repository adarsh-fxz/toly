import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createdAt, updatedAt } from "./columns";

export const merchantCategory = pgEnum("merchant_category", [
  "cafe",
  "restaurant",
  "dessert",
  "bar",
  "karaoke",
  "games",
  "activity",
  "other",
]);

export const merchantStatus = pgEnum("merchant_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

export const merchantRole = pgEnum("merchant_role", ["owner", "staff"]);

export const merchants = pgTable(
  "merchants",
  {
    id: uuid().primaryKey().defaultRandom(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    category: merchantCategory().notNull(),
    area: text().notNull(),
    address: text().notNull(),
    phone: text().notNull(),
    panNumber: text(),
    description: text().notNull().default(""),
    status: merchantStatus().notNull().default("pending"),
    reviewNote: text(),
    reviewedAt: timestamp({ withTimezone: true }),
    createdById: text()
      .notNull()
      .references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index().on(t.status, t.createdAt)],
);

export const merchantMembers = pgTable(
  "merchant_members",
  {
    merchantId: uuid()
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: merchantRole().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.merchantId, t.userId] }),
    index().on(t.userId),
  ],
);

// Append-only record of privileged actions (approvals, suspensions, redemptions…).
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid().primaryKey().defaultRandom(),
    actorId: text().references(() => user.id, { onDelete: "set null" }),
    action: text().notNull(),
    targetType: text().notNull(),
    targetId: text().notNull(),
    meta: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
  },
  (t) => [index().on(t.targetType, t.targetId)],
);
