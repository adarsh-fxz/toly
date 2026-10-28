"use client";

import { UserPlus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { PersonAvatar } from "@/components/brand/person-avatar";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Member, TolyStatus } from "./types";

/**
 * The big table on the toly page (/g/[code]): a round table seen from above with every
 * seat around it, first names under each seat, a progress arc, and `children` in the
 * middle (price while forming, a green check when unlocked).
 * New members pop in with a spring; open seats pulse. Updates are announced politely.
 */
export function SeatTable({
  members,
  size,
  status,
  children,
  className,
}: {
  members: Member[];
  size: number;
  status: TolyStatus;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const filled = Math.min(members.length, size);
  const closed = status === "expired" || status === "cancelled";
  const seats = Array.from({ length: size }, (_, i) => {
    const a = ((-90 + (i * 360) / size) * Math.PI) / 180;
    return { x: Math.cos(a), y: Math.sin(a), member: members[i] };
  });

  return (
    <div className={cn("seat-table", closed && "closed", className)}>
      <p className="sr-only" aria-live="polite">
        {filled} of {size} seats filled
        {status === "unlocked" ? ". Unlocked." : ""}
      </p>
      <svg className="table-ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke="var(--input)"
          strokeWidth=".9"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="24"
          fill="none"
          stroke="var(--primary)"
          strokeWidth=".9"
          strokeLinecap="round"
          pathLength={100}
          transform="rotate(-90 50 50)"
          initial={false}
          animate={{ strokeDasharray: `${(filled / size) * 100} 100` }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
          }
        />
      </svg>
      <motion.div
        className="table-top"
        animate={
          status === "unlocked" && !reduce
            ? {
                boxShadow: [
                  "0 0 0 0 rgb(242 162 58 / .55)",
                  "0 0 0 28px rgb(242 162 58 / 0)",
                ],
              }
            : undefined
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {children}
      </motion.div>
      {seats.map((s) => (
        <div
          key={s.member?.id ?? `open-${s.x}-${s.y}`}
          className={cn("seat", s.member?.isYou && "me")}
          style={{ ["--x" as string]: s.x, ["--y" as string]: s.y }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {s.member ? (
              <motion.span
                key="filled"
                className="seat-av"
                initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={reduce ? { duration: 0.12 } : spring.seat}
              >
                <PersonAvatar
                  name={s.member.firstName}
                  seed={s.member.id}
                  src={s.member.avatarUrl}
                  size={120}
                  decorative
                  className="size-full"
                />
              </motion.span>
            ) : (
              <span key="open" className="seat-open">
                <UserPlus
                  className="size-[22px]"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>
            )}
          </AnimatePresence>
          <span className="whitespace-nowrap text-center text-sm font-semibold leading-tight">
            {s.member
              ? s.member.isYou
                ? "You"
                : s.member.firstName
              : "Open seat"}
            {s.member?.isOrganiser && (
              <small className="block text-xs font-medium text-muted-foreground">
                (started it)
              </small>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
