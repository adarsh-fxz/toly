import { DealCard } from "@/components/toly/deal-card";
import { dealSummary } from "@/lib/deal-view";
import type { PublicDeal } from "@/lib/types";

export function DealRow({ deal }: { deal: PublicDeal }) {
  return <DealCard deal={dealSummary(deal)} />;
}
