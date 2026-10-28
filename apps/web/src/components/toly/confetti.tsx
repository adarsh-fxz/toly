"use client";

import { useReducedMotion } from "motion/react";

const COLORS = ["#F2A23A", "#D6456F", "#5CD39A", "#93B8FF", "#FFFFFF"];

/**
 * One-shot confetti for the unlock moment, the prize reveal and redeem success.
 * Pure CSS (transform + opacity), ~15 pieces, renders nothing under reduced motion.
 * Re-mount it (change `key`) to play again. Parent must be `relative overflow-hidden`.
 */
export function Confetti({
  pieces = 15,
  palette = COLORS,
}: {
  pieces?: number;
  palette?: string[];
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => (
        <i
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed confetti positions
          key={i}
          style={{
            ["--l" as string]: `${((i * 61) % 92) + 4}%`,
            ["--c" as string]: palette[i % palette.length],
            ["--dl" as string]: `${((i * 37) % 90) / 100}s`,
          }}
        />
      ))}
    </div>
  );
}
