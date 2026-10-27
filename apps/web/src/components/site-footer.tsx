import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

const links = [
  { href: "/", label: "Deals" },
  { href: "/me", label: "My tolys" },
  { href: "/merchant", label: "For venues" },
  { href: "/account", label: "Account and security" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t pb-24 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm space-y-2">
          <Wordmark />
          <p className="text-sm text-muted-foreground">
            Group deals and discount spins at local venues in Kathmandu Valley.
            You always pay the venue directly.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
