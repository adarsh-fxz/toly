import { and, desc, eq, schema, sql } from "@toly/db";
import type { dealInputSchema } from "@toly/shared/deal";
import { toPaisa } from "@toly/shared/money";
import { slugify } from "@toly/shared/slug";
import type { z } from "zod";
import { db } from "../db";
import { audit } from "../lib/audit";
import { ApiError, notFound } from "../lib/errors";
import { requireMembership } from "./merchants";

const { deals, merchants } = schema;

type DealInput = z.output<typeof dealInputSchema>;
export type DealStatus = (typeof schema.dealStatus.enumValues)[number];

function toColumns(input: DealInput) {
  return {
    title: input.title,
    description: input.description,
    includes: input.includes,
    partySize: input.partySize,
    basePricePaisa: toPaisa(input.basePrice),
    groupPricePaisa: toPaisa(input.groupPrice),
    availableDays: [...new Set(input.availableDays)].sort(),
    availableFrom: input.availableFrom ?? null,
    availableUntil: input.availableUntil ?? null,
    formationHours: input.formationHours,
    validityDays: input.validityDays ?? null,
    dailyCap: input.dailyCap ?? null,
    terms: input.terms,
  };
}

const publicDealColumns = {
  id: deals.id,
  slug: deals.slug,
  title: deals.title,
  description: deals.description,
  includes: deals.includes,
  partySize: deals.partySize,
  basePricePaisa: deals.basePricePaisa,
  groupPricePaisa: deals.groupPricePaisa,
  availableDays: deals.availableDays,
  availableFrom: deals.availableFrom,
  availableUntil: deals.availableUntil,
  formationHours: deals.formationHours,
  validityDays: deals.validityDays,
  terms: deals.terms,
  status: deals.status,
  merchant: {
    id: merchants.id,
    slug: merchants.slug,
    name: merchants.name,
    category: merchants.category,
    area: merchants.area,
    address: merchants.address,
  },
};

const isPublic = and(
  eq(deals.status, "live"),
  eq(merchants.status, "approved"),
);

export async function listLiveDeals(filters: {
  category?: string;
  area?: string;
}) {
  return db
    .select(publicDealColumns)
    .from(deals)
    .innerJoin(merchants, eq(merchants.id, deals.merchantId))
    .where(
      and(
        isPublic,
        filters.category
          ? eq(
              merchants.category,
              filters.category as (typeof schema.merchantCategory.enumValues)[number],
            )
          : undefined,
        filters.area
          ? sql`lower(${merchants.area}) = lower(${filters.area})`
          : undefined,
      ),
    )
    .orderBy(desc(deals.publishedAt))
    .limit(60);
}

/** Shared links keep working after a deal ends, so the page can explain what happened. */
export async function getPublicDeal(slug: string) {
  const [deal] = await db
    .select(publicDealColumns)
    .from(deals)
    .innerJoin(merchants, eq(merchants.id, deals.merchantId))
    .where(and(eq(deals.slug, slug), eq(merchants.status, "approved")))
    .limit(1);
  if (!deal || deal.status === "draft")
    throw notFound("This deal doesn't exist");
  return deal;
}

export async function getVenue(slug: string) {
  const [merchant] = await db
    .select({
      id: merchants.id,
      slug: merchants.slug,
      name: merchants.name,
      category: merchants.category,
      area: merchants.area,
      address: merchants.address,
      description: merchants.description,
    })
    .from(merchants)
    .where(and(eq(merchants.slug, slug), eq(merchants.status, "approved")))
    .limit(1);
  if (!merchant) throw notFound("This venue isn't on Toly");

  const venueDeals = await db
    .select(publicDealColumns)
    .from(deals)
    .innerJoin(merchants, eq(merchants.id, deals.merchantId))
    .where(and(isPublic, eq(deals.merchantId, merchant.id)))
    .orderBy(desc(deals.publishedAt));
  return { ...merchant, deals: venueDeals };
}

export async function listMerchantDeals(userId: string, merchantId: string) {
  await requireMembership(userId, merchantId);
  return db
    .select()
    .from(deals)
    .where(eq(deals.merchantId, merchantId))
    .orderBy(desc(deals.createdAt));
}

export async function getMerchantDeal(
  userId: string,
  merchantId: string,
  dealId: string,
) {
  await requireMembership(userId, merchantId);
  const [deal] = await db
    .select()
    .from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.merchantId, merchantId)))
    .limit(1);
  if (!deal) throw notFound("Deal not found");
  return deal;
}

export async function createDeal(
  userId: string,
  merchantId: string,
  input: DealInput,
) {
  await requireMembership(userId, merchantId, ["owner"]);
  const slug = `${slugify(input.title) || "deal"}-${crypto.randomUUID().slice(0, 5)}`;
  const [deal] = await db
    .insert(deals)
    .values({ ...toColumns(input), merchantId, slug })
    .returning();
  if (!deal) throw new Error("Deal insert returned no row");
  await audit({
    actorId: userId,
    action: "deal.create",
    targetType: "deal",
    targetId: deal.id,
  });
  return deal;
}

// Groups snapshot the terms they were started with, so editing a live deal never changes an existing toly.
export async function updateDeal(
  userId: string,
  merchantId: string,
  dealId: string,
  input: DealInput,
) {
  await requireMembership(userId, merchantId, ["owner"]);
  const [deal] = await db
    .update(deals)
    .set(toColumns(input))
    .where(and(eq(deals.id, dealId), eq(deals.merchantId, merchantId)))
    .returning();
  if (!deal) throw notFound("Deal not found");
  await audit({
    actorId: userId,
    action: "deal.update",
    targetType: "deal",
    targetId: deal.id,
  });
  return deal;
}

export async function setDealStatus(
  userId: string,
  merchantId: string,
  dealId: string,
  status: Exclude<DealStatus, "draft">,
) {
  const { merchant } = await requireMembership(userId, merchantId, ["owner"]);
  if (status === "live" && merchant.status !== "approved") {
    throw new ApiError(
      409,
      "VENUE_NOT_APPROVED",
      "Your venue needs to be approved before deals go live",
    );
  }
  const [deal] = await db
    .update(deals)
    .set({
      status,
      publishedAt:
        status === "live"
          ? sql`coalesce(${deals.publishedAt}, now())`
          : undefined,
    })
    .where(and(eq(deals.id, dealId), eq(deals.merchantId, merchantId)))
    .returning({ id: deals.id, status: deals.status });
  if (!deal) throw notFound("Deal not found");
  await audit({
    actorId: userId,
    action: `deal.${status}`,
    targetType: "deal",
    targetId: deal.id,
  });
  return deal;
}

export async function adminSetDealStatus(
  adminId: string,
  dealId: string,
  status: "paused" | "ended",
) {
  const [deal] = await db
    .update(deals)
    .set({ status })
    .where(eq(deals.id, dealId))
    .returning({ id: deals.id, status: deals.status });
  if (!deal) throw notFound("Deal not found");
  await audit({
    actorId: adminId,
    action: `deal.admin_${status}`,
    targetType: "deal",
    targetId: dealId,
  });
  return deal;
}
