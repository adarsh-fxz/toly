import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { StartToly } from "./start-toly";

/** Picks the right first step: sign in, verify a number, or start. */
export async function StartTolyGate({ dealSlug }: { dealSlug: string }) {
  const user = await getCurrentUser();
  const next = encodeURIComponent(`/deals/${dealSlug}`);

  if (!user) {
    return (
      <Link
        href={`/sign-in?next=${next}`}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        Start a toly
      </Link>
    );
  }
  if (!user.phoneNumberVerified) {
    return (
      <div className="space-y-2">
        <Link
          href="/account"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Verify your number to start
        </Link>
        <p className="text-sm text-ink-2">
          Every seat belongs to a verified Nepali mobile number.
        </p>
      </div>
    );
  }
  return <StartToly dealSlug={dealSlug} />;
}
