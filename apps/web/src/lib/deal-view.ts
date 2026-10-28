import { describeDays } from "@toly/shared/deal";
import type { Category, DealSummary } from "@/components/toly/types";
import type { PublicDeal } from "@/lib/types";

export function dealCategory(category: string): Category {
  const categories: Record<string, Category> = {
    cafe: "cafe",
    restaurant: "restaurant",
    desserts: "desserts",
    dessert: "desserts",
    bakery: "desserts",
    bar: "bar",
    karaoke: "karaoke",
    games: "games",
    gaming: "games",
    activity: "activity",
    other: "activity",
  };
  return categories[category] ?? "activity";
}

export function dealSummary(deal: PublicDeal): DealSummary {
  return {
    slug: deal.slug,
    title: deal.title,
    venueName: deal.merchant.name,
    area: deal.merchant.area,
    category: dealCategory(deal.merchant.category),
    partySize: deal.partySize,
    whenLabel: describeDays(deal.availableDays),
    groupPrice: deal.groupPricePaisa / 100,
    regularPrice: deal.basePricePaisa / 100,
  };
}
