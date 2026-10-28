import Link from "next/link";
import { LogoLink } from "@/components/brand/logo";
import { EmptyTable } from "@/components/feedback/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-5 py-20 text-center">
      <LogoLink />
      <EmptyTable className="mt-8" />
      <h1 className="text-h1 font-semibold max-sm:text-[36px]">
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
