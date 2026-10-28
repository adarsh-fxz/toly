"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Light/dark switch. Both icons are rendered and swapped with the `dark:` variant,
 * so there is no hydration flash or mounted-check flicker.
 * Requires <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch between light and dark"
      className={cn(
        "inline-grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}
