import {
  CircleAlert,
  CircleCheck,
  Info,
  type LucideIcon,
  TriangleAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONES: Record<
  string,
  { bg: string; icon: string; Icon: LucideIcon; role?: "status" | "alert" }
> = {
  info: { bg: "bg-info-soft", icon: "text-info", Icon: Info, role: "status" },
  warn: {
    bg: "bg-warning-soft",
    icon: "text-warning",
    Icon: TriangleAlert,
    role: "status",
  },
  danger: {
    bg: "bg-destructive-soft",
    icon: "text-destructive",
    Icon: CircleAlert,
    role: "alert",
  },
  ok: {
    bg: "bg-success-soft",
    icon: "text-success",
    Icon: CircleCheck,
    role: "status",
  },
  neutral: { bg: "bg-secondary", icon: "text-ink-2", Icon: Info },
};

/**
 * Page-level callout: "Your venue is under review", "You're offline, ask staff to type the code",
 * "Verify your number to join". Bold title + one sentence + optional action on the right.
 * Use `danger` for form-level errors above a form.
 */
export function Banner({
  tone = "info",
  title,
  children,
  action,
  icon,
  className,
}: {
  tone?: "info" | "warn" | "danger" | "ok" | "neutral";
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  const t = TONES[tone] ?? {
    bg: "bg-info-soft",
    icon: "text-info",
    Icon: Info,
    role: "status" as const,
  };
  const Icon = icon ?? t.Icon;
  return (
    <div
      role={t.role}
      className={cn(
        "flex items-start gap-3.5 rounded-[18px] px-[18px] py-4 text-[15px] leading-[1.45] text-foreground max-sm:flex-wrap",
        t.bg,
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-[18px] shrink-0", t.icon)}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        {title && <b className="block font-semibold">{title}</b>}
        {children}
      </div>
      {action && (
        <div className="self-center max-sm:w-full max-sm:pl-8">{action}</div>
      )}
    </div>
  );
}
