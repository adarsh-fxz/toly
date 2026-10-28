import Link from "next/link";
import { LogoLink } from "@/components/brand/logo";
import { Container } from "@/components/layout/container";

const LINKS = [
  { href: "/#deals", label: "Deals" },
  { href: "/me", label: "My tolys" },
  { href: "/merchant", label: "For venues" },
  { href: "/account", label: "Account and security" },
];

/** L2 footer: wordmark, one honest sentence, links, and the Devanagari name. */
export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border max-sm:mt-22">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8 pb-8 pt-[52px]">
          <div>
            <LogoLink className="text-[32px]" />
            <p className="mt-4 max-w-[26em] text-[15px] text-ink-2">
              Group deals and discount spins at local venues in Kathmandu
              Valley. You always pay the venue directly.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink-2 hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-border pb-10 pt-5 text-[13px] text-muted-foreground">
          <span lang="ne" className="font-nepali">
            टोली
          </span>
          <span>Prices in Nepali rupees. Times in Kathmandu time.</span>
        </div>
      </Container>
    </footer>
  );
}
