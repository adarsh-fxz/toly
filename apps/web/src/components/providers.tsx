"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ScrollExperience } from "@/components/layout/scroll-experience";
import { Toaster } from "@/components/ui/sonner";

/**
 * App-wide client providers. Theme follows the system until the person picks one
 * (stored by next-themes). MotionConfig "user" makes every motion component respect
 * prefers-reduced-motion automatically.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <ScrollExperience>
          {children}
          <Toaster />
        </ScrollExperience>
      </MotionConfig>
    </ThemeProvider>
  );
}
