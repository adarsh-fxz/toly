import Link from "next/link";
import { SeatDots } from "@/components/brand/seat-dots";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-24">
      <SeatDots filled={0} total={4} size="lg" />
      <h1 className="text-5xl font-extrabold md:text-6xl">
        Nobody's sitting here.
      </h1>
      <p className="text-lg text-muted-foreground">
        This page doesn't exist, or the link has expired. Deals and tolys that
        ended may have been removed.
      </p>
      <Link
        href="/"
        className={buttonVariants({ size: "lg", className: "w-fit" })}
      >
        Browse deals
      </Link>
    </main>
  );
}
