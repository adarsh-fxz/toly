import { describeDays, describeValidity } from "@toly/shared/deal";
import { CalendarDays, Clock3, Hourglass, MapPin } from "lucide-react";
import type { PublicDeal } from "@/lib/types";

export function DealFacts({ deal }: { deal: PublicDeal }) {
  const hours =
    deal.availableFrom && deal.availableUntil
      ? `${deal.availableFrom} to ${deal.availableUntil}`
      : "Any time the venue is open";

  const facts = [
    {
      icon: CalendarDays,
      label: "Days",
      value: describeDays(deal.availableDays),
    },
    { icon: Clock3, label: "Hours", value: hours },
    {
      icon: Hourglass,
      label: "Voucher",
      value: describeValidity(deal.validityDays),
    },
    {
      icon: MapPin,
      label: "Where",
      value: `${deal.merchant.name}, ${deal.merchant.address}`,
    },
  ];

  return (
    <dl className="grid gap-5 sm:grid-cols-2">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex gap-3">
          <Icon
            className="mt-0.5 size-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
