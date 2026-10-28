"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Destructive actions (leave/cancel a toly, remove staff, end a deal) confirm inline,
 * never with window.confirm(). The trigger turns into a soft-red panel; focus lands on
 * the SAFE choice; Escape cancels.
 *
 * <InlineConfirm trigger="Leave this toly" title="Leave this toly?" body="Your seat opens up for someone else."
 *   confirmLabel="Leave" keepLabel="Keep it" onConfirm={leave} />
 */
export function InlineConfirm({
  trigger,
  title,
  body,
  confirmLabel,
  keepLabel = "Keep it",
  onConfirm,
  defaultOpen = false,
}: {
  trigger: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  confirmLabel: string;
  keepLabel?: string;
  onConfirm: () => undefined | boolean | Promise<undefined | boolean>;
  defaultOpen?: boolean;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);
  const focusKeep = useCallback((button: HTMLButtonElement | null) => {
    button?.focus();
  }, []);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 220);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="confirm"
          role="alertdialog"
          aria-modal="false"
          aria-label={typeof title === "string" ? title : undefined}
          initial={{ opacity: 0, y: reduce ? 0 : 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[18px] bg-destructive-soft px-[18px] py-4 text-[15px]"
        >
          <div className="min-w-0 flex-1">
            <b className="block font-semibold">{title}</b>
            {body && <div className="mt-1 text-sm text-ink-2">{body}</div>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              ref={focusKeep}
              type="button"
              onClick={close}
              className="inline-flex min-h-11 items-center rounded-full bg-card px-4 text-[15px] font-medium shadow-[inset_0_0_0_1px_var(--input)]"
            >
              {keepLabel}
            </button>
            <Button
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const done = await onConfirm();
                  if (done !== false) close();
                } catch {
                  toast.error("Couldn't complete that. Try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Working…" : confirmLabel}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="trigger"
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          disabled={busy}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex min-h-11 items-center self-start rounded-full px-4 text-[15px] font-medium text-destructive hover:bg-destructive-soft"
        >
          {trigger}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
