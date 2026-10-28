"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
      <h1 className="text-h1 font-semibold max-sm:text-[36px]">
        Something went wrong on our side.
      </h1>
      <p className="text-lg text-muted-foreground">
        Your tolys and vouchers are safe. Try again, and if it keeps happening,
        come back in a few minutes.
        {error.digest ? (
          <span className="mt-2 block text-sm">Reference: {error.digest}</span>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className={buttonVariants({ size: "lg", variant: "outline" })}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
