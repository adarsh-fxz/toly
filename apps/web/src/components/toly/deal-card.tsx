import {
  ArrowRight,
  CakeSlice,
  CalendarDays,
  Coffee,
  Dices,
  type LucideIcon,
  Mic,
  Sparkles,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { formatRs, percentOff } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL, type Category, type DealSummary } from "./types";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  cafe: Coffee,
  restaurant: UtensilsCrossed,
  desserts: CakeSlice,
  bar: Wine,
  karaoke: Mic,
  games: Dices,
  activity: Sparkles,
};

const CATEGORY_TONE: Record<Category, string> = {
  cafe: "bg-tint-c",
  restaurant: "bg-tint-a",
  desserts: "bg-tint-b",
  bar: "bg-tint-c",
  karaoke: "bg-tint-b",
  games: "bg-tint-c",
  activity: "bg-tint-d",
};

/**
 * No-photo tile: pale category tint, category icon on a "table", and one seat dot per
 * person in the party, so a group of 8 visibly differs from a group of 2.
 */
export function DealTile({
  category,
  partySize,
  badge,
  large = false,
  className,
}: {
  category: Category;
  partySize: number;
  badge?: string;
  large?: boolean;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[category];
  const r = large ? 94 : 48;
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        large
          ? "h-[300px] rounded-[30px] max-sm:h-[220px]"
          : "mx-2 mt-2 h-[168px] rounded-[22px]",
        CATEGORY_TONE[category],
        className,
      )}
    >
      <span className="absolute left-3 top-3 rounded-full bg-glass px-[11px] py-[5px] text-[13px] font-medium text-ink-2 shadow-[inset_0_0_0_1px_var(--glass-line)]">
        {CATEGORY_LABEL[category]}
      </span>
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-glass px-[11px] py-[5px] text-[13px] font-semibold text-success shadow-[inset_0_0_0_1px_var(--glass-line)]">
          {badge}
        </span>
      )}
      <div className="tile-ring" aria-hidden="true">
        <span
          className={cn(
            "absolute grid place-items-center rounded-full bg-card text-foreground shadow-[0_6px_16px_-8px_rgb(23_22_28/.35)]",
            large
              ? "-left-11 -top-11 size-[88px]"
              : "-left-[27px] -top-[27px] size-[54px]",
          )}
        >
          <Icon
            className={large ? "size-9" : "size-[22px]"}
            strokeWidth={1.7}
          />
        </span>
        {Array.from({ length: partySize }, (_, i) => {
          const a = ((-90 + (i * 360) / partySize) * Math.PI) / 180;
          return (
            <i
              key={a}
              className={
                large ? "!-left-[15px] !-top-[15px] !size-[30px]" : undefined
              }
              style={{
                transform: `translate(${Math.round(r * Math.cos(a))}px, ${Math.round(r * Math.sin(a))}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function DealCard({ deal, href }: { deal: DealSummary; href?: string }) {
  const off = percentOff(deal.regularPrice, deal.groupPrice);
  return (
    <Link
      href={href ?? `/deals/${deal.slug}`}
      className="group flex flex-col overflow-hidden rounded-[28px] bg-card text-foreground no-underline shadow-1 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-2 focus-visible:-translate-y-1"
    >
      <DealTile
        category={deal.category}
        partySize={deal.partySize}
        badge={off > 0 ? `${off}% off together` : undefined}
      />
      <div className="flex flex-1 flex-col gap-1.5 px-[22px] pb-[22px] pt-[18px]">
        <p className="text-sm text-muted-foreground">
          {deal.venueName} · {deal.area}
        </p>
        <h3 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.025em]">
          {deal.title}
        </h3>
        <p className="mt-0.5 flex items-center gap-[7px] text-sm text-ink-2">
          <CalendarDays
            className="size-[15px] shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {deal.whenLabel}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <div>
              <span className="font-display text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                {formatRs(deal.groupPrice)}
              </span>
              <s className="ml-2 text-sm tabular-nums text-muted-foreground">
                <span className="sr-only">Regular price </span>
                {formatRs(deal.regularPrice)}
              </s>
            </div>
            <div className="mt-1.5 text-[13px] text-muted-foreground">
              for {deal.partySize} people, one bill
            </div>
          </div>
          <span
            className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary transition-[background-color,transform] duration-300 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-primary-foreground"
            aria-hidden="true"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
