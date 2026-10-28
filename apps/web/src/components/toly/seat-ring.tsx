"use client";

import { UserPlus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PersonAvatar } from "@/components/brand/person-avatar";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Member } from "./types";

/**
 * Compact seat ring (196 px): progress arc around a small table, seats around it.
 * Used in the home hero card, sign-in brand panel and "Filling up" cards.
 * Seats are laid out from 12 o'clock clockwise; open seats pulse softly.
 */
export function SeatRing({
  members,
  size,
  unlocked = false,
  className,
}: {
  members: Member[];
  size: number;
  unlocked?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const filled = Math.min(members.length, size);
  const C = 98; // centre
  const R = 76; // seat radius
  const seats = Array.from({ length: size }, (_, i) => {
    const a = ((-90 + (i * 360) / size) * Math.PI) / 180;
    return {
      x: C + R * Math.cos(a),
      y: C + R * Math.sin(a),
      member: members[i],
    };
  });

  return (
    <div
      className={cn("relative size-[196px] shrink-0", className)}
      role="img"
      aria-label={
        unlocked
          ? `All ${size} seats filled. Unlocked.`
          : `${filled} of ${size} seats filled`
      }
    >
      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox="0 0 196 196"
        aria-hidden="true"
      >
        <circle
          cx={C}
          cy={C}
          r="50"
          fill="none"
          stroke="var(--input)"
          strokeWidth="3"
        />
        <motion.circle
          cx={C}
          cy={C}
          r="50"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          transform={`rotate(-90 ${C} ${C})`}
          initial={false}
          animate={{ strokeDasharray: `${(filled / size) * 100} 100` }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
          }
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 flex size-[84px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-card shadow-[0_12px_26px_-14px_rgb(23_22_28/.45),inset_0_0_0_1px_var(--border)]">
        <span className="font-display text-[26px] font-semibold leading-none tracking-tight tabular-nums">
          {filled}/{size}
        </span>
        <span
          className={cn(
            "mt-1 text-xs font-medium leading-none",
            unlocked ? "text-success" : "text-ink-2",
          )}
        >
          {unlocked ? "unlocked" : "seats in"}
        </span>
      </div>
      {seats.map((s) =>
        s.member ? (
          <motion.span
            key={s.member.id}
            className={cn(
              "absolute -ml-[21px] -mt-[21px] size-[42px] rounded-full",
              s.member.isYou
                ? "shadow-[0_0_0_2.5px_var(--primary),0_0_0_5.5px_var(--card)]"
                : "shadow-[0_0_0_3px_var(--card),0_8px_16px_-8px_rgb(23_22_28/.45)]",
            )}
            style={{ left: s.x, top: s.y }}
            initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0.12 } : spring.seat}
          >
            <PersonAvatar
              name={s.member.firstName}
              seed={s.member.id}
              src={s.member.avatarUrl}
              size={42}
              decorative
            />
            {s.member.isYou && (
              <span className="absolute left-1/2 top-[calc(100%+8px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-1 text-[11px] font-semibold leading-none text-background">
                You
              </span>
            )}
          </motion.span>
        ) : (
          <span
            key={`open-${s.x}-${s.y}`}
            className="seat-pulse absolute -ml-[21px] -mt-[21px] grid size-[42px] place-items-center rounded-full bg-card text-ink-2 shadow-[inset_0_0_0_1.5px_var(--seat-line)]"
            style={{ left: s.x, top: s.y }}
          >
            <UserPlus
              className="size-[18px]"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
        ),
      )}
    </div>
  );
}
