"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, readError } from "@/lib/api";
import { formatDay, kathmanduDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

type When = "unsure" | "today" | "tomorrow" | "pick";

export function StartToly({ dealSlug }: { dealSlug: string }) {
  const id = useId();
  const router = useRouter();
  const [when, setWhen] = useState<When>("unsure");
  const [picked, setPicked] = useState(kathmanduDate(2));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plannedFor =
    when === "today"
      ? kathmanduDate()
      : when === "tomorrow"
        ? kathmanduDate(1)
        : when === "pick"
          ? picked
          : null;

  async function start() {
    setPending(true);
    setError(null);
    const res = await api.api.v1.groups.$post({
      json: { dealSlug, plannedFor },
    });
    if (!res.ok) {
      setPending(false);
      setError((await readError(res)).message);
      return;
    }
    const group = await res.json();
    router.push(`/g/${group.id}`);
  }

  const options: { value: When; label: string }[] = [
    { value: "unsure", label: "Not sure yet" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "pick", label: "Pick a day" },
  ];

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm text-ink-2">
          When are you thinking of going? You can use the voucher any eligible
          day.
        </legend>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={when === o.value}
              onClick={() => setWhen(o.value)}
              className={cn(
                "h-11 rounded-full border border-input px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:border-border",
                when === o.value
                  ? "border-foreground bg-foreground text-background"
                  : "hover:border-foreground/60",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        {when === "pick" ? (
          <div className="pt-2">
            <label htmlFor={`${id}-day`} className="sr-only">
              Day
            </label>
            <input
              id={`${id}-day`}
              type="date"
              min={kathmanduDate()}
              max={kathmanduDate(59)}
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
              className="h-11 rounded-lg border border-input bg-transparent px-3 text-base "
            />
            <span className="ml-3 text-sm text-ink-2">{formatDay(picked)}</span>
          </div>
        ) : null}
      </fieldset>
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-card px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : null}
      <Button
        size="lg"
        className="w-full"
        onClick={start}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Starting…" : "Start a toly"}
      </Button>
    </div>
  );
}
