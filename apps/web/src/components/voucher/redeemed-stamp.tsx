"use client";

import { motion, useReducedMotion } from "motion/react";
import { formatDateTime } from "@/lib/format";
import { stamp } from "@/lib/motion";

/** Tilted green "Redeemed" stamp dropped over the QR once staff redeem the voucher. */
export function RedeemedStamp({ at }: { at: string | Date }) {
  const reduce = useReducedMotion();
  const label = formatDateTime(at);
  return (
    <motion.div
      role="img"
      aria-label={`Redeemed on ${label}`}
      className="absolute grid size-[200px] place-items-center rounded-full border-4 border-success bg-[color-mix(in_oklab,var(--card)_70%,transparent)] text-center font-display text-[30px] font-bold uppercase tracking-[0.04em] text-success shadow-[inset_0_0_0_6px_color-mix(in_oklab,var(--success)_18%,transparent)] max-sm:size-40 max-sm:text-2xl"
      {...(reduce
        ? {
            initial: { opacity: 0, rotate: -14 },
            animate: { opacity: 1, rotate: -14 },
          }
        : stamp)}
    >
      <span>
        Redeemed
        <small className="mt-1 block font-sans text-xs font-semibold normal-case tracking-normal tabular-nums">
          {label}
        </small>
      </span>
    </motion.div>
  );
}
