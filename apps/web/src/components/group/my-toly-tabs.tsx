"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export function MyTolyTabs({
  ready,
  filling,
  past,
  children,
}: {
  ready: number;
  filling: number;
  past: number;
  children: ReactNode;
}) {
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: "All", count: ready + filling + past },
    { id: "ready", label: "Ready", count: ready },
    { id: "filling", label: "Filling up", count: filling },
    { id: "past", label: "Past", count: past },
  ];
  return (
    <div className="toly-filter mt-8" data-filter={tab}>
      <fieldset
        aria-label="Filter your tolys"
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-[24px] bg-secondary p-1.5"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium text-ink-2",
              tab === t.id && "bg-card text-foreground shadow-1",
            )}
          >
            {t.label}{" "}
            <span className="ml-1 tabular-nums text-muted-foreground">
              {t.count}
            </span>
          </button>
        ))}
      </fieldset>
      <div>{children}</div>
      {tabs.find((t) => t.id === tab)?.count === 0 ? (
        <p role="status" className="py-12 text-ink-2">
          Nothing here yet. Your next toly starts with a deal.
        </p>
      ) : null}
    </div>
  );
}
