import Link from "next/link";
import { HeroScene } from "@/components/brand/hero-scene";
import { LogoLink } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SeatRing } from "@/components/toly/seat-ring";

const demo = [
  { id: "auth-a", firstName: "Aashma" },
  { id: "auth-p", firstName: "Prabin" },
  { id: "auth-s", firstName: "Sujan" },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh min-[61.3125rem]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative isolate m-3 flex flex-col justify-between overflow-hidden rounded-[32px] px-8 pb-10 pt-7 max-[61.25rem]:hidden">
        <HeroScene idPrefix="auth" />
        <LogoLink />
        <div className="glass my-16 flex w-full max-w-[420px] flex-col items-center gap-3.5 self-center rounded-[28px] p-[26px] text-center">
          <div aria-hidden="true">
            <SeatRing members={demo} size={4} />
          </div>
          <h2 className="text-h3 font-semibold">Three in. One seat left.</h2>
          <p className="text-ink-2">
            Fill the toly and the group price unlocks. You pay the venue
            directly.
          </p>
        </div>
        <p className="text-sm text-ink-2">
          Group deals and discount spins in Kathmandu Valley.
        </p>
      </aside>
      <section className="flex min-w-0 flex-col px-10 py-8 max-sm:px-5">
        <div className="flex items-center justify-between">
          <span className="min-[61.3125rem]:invisible">
            <LogoLink />
          </span>
          <ThemeToggle />
        </div>
        <main
          id="main"
          className="mx-auto my-auto w-full max-w-[420px] py-12 max-sm:py-10"
        >
          {children}
        </main>
        <Link
          href="/"
          className="mx-auto inline-flex min-h-11 items-center text-sm text-ink-2"
        >
          Back to deals
        </Link>
      </section>
    </div>
  );
}
