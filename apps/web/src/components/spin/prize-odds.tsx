import { Info } from "lucide-react";
import type { Prize } from "@/components/toly/types";
import { wheelColor } from "@/lib/spin-view";

/** "Prizes and chances": every prize, its offer line, its exact chance, shown BEFORE paying. */
export function PrizeOdds({ prizes }: { prizes: Prize[] }) {
  return (
    <section aria-labelledby="odds-h">
      <h2
        id="odds-h"
        className="font-display text-2xl font-semibold tracking-[-0.025em]"
      >
        Prizes and chances
      </h2>
      <ul className="mt-4 overflow-hidden rounded-[28px] bg-card shadow-1">
        {prizes.map((p, i) => (
          <li
            key={p.id}
            className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-border px-5 py-3.5 last:border-b-0 max-sm:px-4"
          >
            <span
              className="size-5 rounded-[7px] shadow-[inset_0_0_0_1px_var(--input)]"
              style={{ background: wheelColor(i, p.hot) }}
              aria-hidden="true"
            />
            <div>
              <b className="font-semibold">{p.name}</b>
              <div className="text-sm text-ink-2">
                {p.offer}
                {p.limited && (
                  <span className="font-semibold text-accent-foreground">
                    {" "}
                    · while today&apos;s stock lasts
                  </span>
                )}
              </div>
            </div>
            <span className="text-right font-display text-[22px] font-semibold tracking-[-0.02em] tabular-nums max-sm:text-[19px]">
              {Math.round(p.chance * 1000) / 10}%
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-start gap-3.5 rounded-[18px] bg-secondary px-[18px] py-4 text-sm">
        <Info
          className="mt-0.5 size-[18px] shrink-0 text-ink-2"
          aria-hidden="true"
        />
        <p>
          The prize is drawn on our server when you spin, using these chances.
          When a limited prize runs out for the day, its chance moves to the
          others. The spin fee is paid to Toly and isn&apos;t refundable once
          you&apos;ve spun.
        </p>
      </div>
    </section>
  );
}
