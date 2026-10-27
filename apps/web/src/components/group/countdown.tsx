"use client";

import { useEffect, useState } from "react";
import { timeLeft } from "@/lib/dates";

export function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return <span className="tabular">{timeLeft(until, now)}</span>;
}
