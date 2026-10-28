"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";

export function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <time
      dateTime={until}
      suppressHydrationWarning
      className="inline-flex rounded-full bg-accent px-2.5 py-1 text-sm font-semibold text-accent-foreground tabular-nums"
    >
      {formatCountdown(new Date(until).getTime() - now)}
    </time>
  );
}
