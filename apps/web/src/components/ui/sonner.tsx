"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Toasts: ink pill, top-centre under the header, 4 s, never the only place an outcome is shown
 * for anything important (show a Banner or inline state too).
 *   toast("Link copied")            toast.success("You're in. Seat 3 of 4.")
 *   toast.error("Couldn't send the code. Try again in a minute.")
 * Put <Toaster /> once in the root layout.
 */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      offset={84}
      mobileOffset={72}
      duration={4000}
      gap={8}
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex min-h-[52px] w-max max-w-[calc(100vw-32px)] items-center gap-2.5 rounded-full bg-foreground py-1.5 pl-[18px] pr-1.5 text-[15px] font-medium text-background shadow-3",
          icon: "text-primary [&_svg]:size-[18px]",
          title: "pr-2",
          description: "text-[13px] opacity-75",
          actionButton:
            "ml-1 min-h-10 rounded-full bg-primary px-4 text-primary-foreground",
          closeButton:
            "!static order-last !size-10 !translate-none !rounded-full !border-0 !bg-transparent !text-current opacity-70 hover:opacity-100",
          error: "[&_[data-icon]]:text-[#FF9E95]",
          success: "[&_[data-icon]]:text-[#7BD8A4]",
        },
      }}
    />
  );
}
