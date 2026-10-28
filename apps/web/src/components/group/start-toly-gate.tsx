import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { frontendPreview } from "@/lib/frontend-preview";
import { getCurrentUser } from "@/lib/session";
import { StartToly } from "./start-toly";

/** Picks the right first step: sign in, verify a number, or start. */
export async function StartTolyGate({ dealSlug }: { dealSlug: string }) {
  if (frontendPreview)
    return (
      <p
        role="status"
        className="rounded-xl bg-secondary p-4 text-sm text-ink-2"
      >
        Sample deal. Creating a toly will be available when the interactive demo
        launches.
      </p>
    );
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
