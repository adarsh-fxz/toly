"use client";

import { AnimatePresence, motion } from "motion/react";
export function StatusHeadline({ children }: { children: string }) {
  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.h1
          key={children}
          className="text-h1 font-semibold max-sm:text-[36px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
