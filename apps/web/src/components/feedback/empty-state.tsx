import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** An empty table with four dashed seats: the house illustration for "nothing here yet". */
export function EmptyTable({ className }: { className?: string }) {
  const seat =
    "absolute size-[18px] rounded-full border-[1.5px] border-dashed border-seat-line";
  return (
    <span
      className={cn("relative mb-2.5 block size-24 shrink-0", className)}
      aria-hidden="true"
    >
      <b className="absolute left-6 top-6 size-12 rounded-full bg-secondary shadow-[inset_0_0_0_1.5px_var(--input)]" />
      <i className={cn(seat, "left-[39px] top-0")} />
      <i className={cn(seat, "left-[78px] top-[39px]")} />
      <i className={cn(seat, "left-[39px] top-[78px]")} />
      <i className={cn(seat, "left-0 top-[39px]")} />
    </span>
  );
}

/**
 * Every data view's empty state: why it's empty + one next action.
 * e.g. title="No tolys yet" body="Pick a deal, start a toly and send the link to your friends." action={<Button asLink href="/">Browse deals</Button>}
 */
export function EmptyState({
  title,
  body,
  action,
  art,
  flat = false,
  className,
}: {
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  /** defaults to the empty table; pass an icon bubble for errors */
  art?: ReactNode;
  /** dashed outline instead of a card (inside dashboards) */
  flat?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-[28px] px-6 py-16 text-center",
        flat ? "shadow-[inset_0_0_0_1.5px_var(--input)]" : "bg-card shadow-1",
        className,
      )}
    >
      {art ?? <EmptyTable />}
      <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">
        {title}
      </h3>
      {body && <p className="max-w-[28em] text-ink-2">{body}</p>}
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}
