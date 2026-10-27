import Link from "next/link";
import { SeatDots } from "@/components/brand/seat-dots";
import { Wordmark } from "@/components/wordmark";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:grid-rows-1">
      <aside className="flex flex-col justify-between gap-6 bg-ink px-4 py-6 text-ink-foreground dark:border-b dark:bg-card dark:text-card-foreground md:dark:border-r md:dark:border-b-0 md:px-10 md:py-10">
        <Link
          href="/"
          aria-label="Toly home"
          className="-m-2 w-fit rounded-lg p-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Wordmark />
        </Link>
        <div className="space-y-3 md:space-y-6">
          <SeatDots filled={3} total={4} size="md" className="md:hidden" />
          <SeatDots
            filled={3}
            total={4}
            size="lg"
            className="hidden md:inline-flex"
          />
          <p className="max-w-sm font-display text-3xl font-extrabold leading-[0.95] font-condensed md:text-5xl lg:text-6xl">
            Three in. One seat left.
          </p>
          <p className="hidden max-w-sm text-lg text-ink-foreground/80 dark:text-muted-foreground md:block">
            Fill the toly and the group price unlocks. You pay the venue
            directly, the way you always do.
          </p>
        </div>
        <p className="hidden text-sm text-ink-foreground/70 dark:text-muted-foreground md:block">
          Made for Kathmandu Valley.
        </p>
      </aside>
      <section className="flex items-start justify-center px-4 py-10 md:items-center md:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
