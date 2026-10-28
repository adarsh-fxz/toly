"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Gift } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Confetti } from "@/components/toly/confetti";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/motion";

export function PrizeReveal({
  open,
  title,
  offer,
  voucherId,
  onClose,
}: {
  open: boolean;
  title: string;
  offer: string;
  voucherId: string;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-scrim opacity-100 transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden rounded-t-xl bg-popover p-8 text-center shadow-3 outline-none transition-[opacity,translate,scale] duration-320 ease-out data-starting-style:translate-y-full data-ending-style:translate-y-full max-sm:px-6 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-40px)] sm:-translate-y-1/2 sm:rounded-xl sm:data-starting-style:translate-y-[calc(-50%-6px)] sm:data-starting-style:scale-[.98] sm:data-starting-style:opacity-0 sm:data-ending-style:opacity-0">
          <span
            className="mx-auto mb-5 block h-1 w-10 rounded-full bg-input sm:hidden"
            aria-hidden
          />
          <Confetti />
          <p className="relative text-sm font-semibold text-accent-foreground">
            You won
          </p>
          <motion.span
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reduce ? { duration: 0.12 } : { ...spring.seat, delay: 0.1 }
            }
            className="relative mx-auto mt-4 grid size-[88px] place-items-center rounded-full bg-accent text-accent-foreground"
          >
            <Gift className="size-10" strokeWidth={1.7} aria-hidden />
          </motion.span>
          <Dialog.Title className="relative mt-5 font-display text-[40px] font-semibold leading-tight tracking-[-.04em] max-sm:text-[34px]">
            {title}
          </Dialog.Title>
          <Dialog.Description className="relative mt-3 text-ink-2">
            {offer}
          </Dialog.Description>
          <div className="relative mt-7 grid gap-2">
            <Button asLink href={`/vouchers/${voucherId}`} size="lg">
              View voucher
            </Button>
            <Button variant="ghost" size="lg" onClick={onClose}>
              Done
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
