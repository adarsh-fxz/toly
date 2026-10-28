// Toly · lib/motion.ts
// Shared Framer Motion (motion.dev) presets. Pair with useReducedMotion():
//   const reduce = useReducedMotion();
//   <motion.div {...(reduce ? fade : seatIn)} />
import type { Transition, Variants } from "motion/react";

export const duration = {
  press: 0.12,
  quick: 0.2,
  base: 0.32,
  seat: 0.6,
  celebrate: 1.4,
  spin: 4.6,
} as const;

export const ease = {
  out: [0.2, 0.8, 0.2, 1],
  inOut: [0.65, 0, 0.35, 1],
  spin: [0.12, 0.75, 0.12, 1],
} as const;

export const spring = {
  seat: { type: "spring", stiffness: 420, damping: 22 } satisfies Transition,
  stamp: { type: "spring", stiffness: 500, damping: 20 } satisfies Transition,
  gentle: { type: "spring", stiffness: 260, damping: 28 } satisfies Transition,
};

/** Reduced-motion fallback: opacity only. */
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.12 },
};

/** Route enter / exit (app/template.tsx). */
export const page = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.quick, ease: ease.out },
  },
  exit: { opacity: 0, transition: { duration: duration.press } },
};

/** List entrances: parent staggers children 40 ms, max 6 animated. */
export const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
export const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: ease.out },
  },
};

/** A seat filling on the toly page. */
export const seatIn = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: spring.seat,
};

/** Scanner result panel (valid / not valid / redeemed). */
export const scanResult = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: duration.base, ease: ease.out },
};

/** Redeemed stamp on the voucher. */
export const stamp = {
  initial: { opacity: 0, scale: 1.6, rotate: -14 },
  animate: { opacity: 1, scale: 1, rotate: -14 },
  transition: spring.stamp,
};

/** Phone sheet / desktop dialog. */
export const sheet = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: {
    y: "100%",
    transition: { duration: duration.quick, ease: ease.inOut },
  },
};
export const dialog = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.base, ease: ease.out },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: duration.press } },
};

/** Toasts sit top-centre below the header and never cover primary actions. */
export const toast = {
  initial: { opacity: 0, y: -10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: duration.base, ease: ease.out },
};

/**
 * Wheel rotation that lands the server-chosen prize under the top pointer.
 * segments: number of equal slices; index: winning slice (0 = first clockwise from 12 o'clock).
 */
export function wheelTarget(
  current: number,
  segments: number,
  index: number,
  turns = 5,
) {
  const slice = 360 / segments;
  const centre = index * slice + slice / 2;
  const base = current - (current % 360);
  return base + turns * 360 + (360 - centre);
}
export const wheelSpin: Transition = {
  duration: duration.spin,
  ease: ease.spin,
};

/** Haptics: valid = one short tick, invalid = double buzz. Safe no-op where unsupported. */
export const haptic = {
  valid: () => navigator.vibrate?.(20),
  invalid: () => navigator.vibrate?.([40, 60, 40]),
  win: () => navigator.vibrate?.(30),
};
