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
    <div className="grid min-h-dvh min-[981px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative isolate m-3 flex flex-col justify-between overflow-hidden rounded-[36px] p-10 max-[980px]:hidden">
        <HeroScene idPrefix="auth" />
        <LogoLink />
        <div className="glass my-16 max-w-[480px] self-center rounded-[32px] p-9">
          <p className="text-sm font-medium text-ink-2" lang="ne">
            टोली · Your crew of friends
          </p>
          <h2 className="mt-4 text-h2 font-semibold">
            Three in.
            <br />
            One seat left.
          </h2>
          <p className="mt-5 text-ink-2">
            Fill the toly and the group price unlocks. You pay the venue
            directly, the way you always do.
          </p>
          <div className="mt-7 flex justify-center" aria-hidden="true">
            <SeatRing members={demo} size={4} />
          </div>
        </div>
        <p className="text-sm text-ink-2">Made for Kathmandu Valley.</p>
      </aside>
      <section className="flex min-w-0 flex-col px-10 py-8 max-sm:px-5">
        <div className="flex items-center justify-between">
          <span className="min-[981px]:invisible">
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
