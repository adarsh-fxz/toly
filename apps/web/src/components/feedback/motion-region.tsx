"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fade, scanResult } from "@/lib/motion";

/** Animate a changed panel without changing its layout or the underlying operation. */
export function MotionRegion({
  children,
  kind = "step",
  className,
}: {
  children: ReactNode;
  kind?: "step" | "scan";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const preset = reduce
    ? fade
    : kind === "scan"
      ? scanResult
      : {
          initial: { opacity: 0, x: 16 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] as const },
        };
  return (
    <motion.div
      className={className}
      {...preset}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
    >
      {children}
    </motion.div>
  );
}
