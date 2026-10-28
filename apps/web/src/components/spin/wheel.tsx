import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type Segment = { id: string; short: string; sub: string };

export function landingRotation(
  index: number,
  count: number,
  turns = 6,
  jitter = 0,
) {
  const step = 360 / count;
  return turns * 360 - (index * step + step / 2) + jitter * step * 0.35;
}

const colors = [
  "var(--seg-a)",
  "var(--seg-b)",
  "var(--seg-c)",
  "var(--seg-b)",
  "var(--seg-d)",
  "var(--seg-b)",
];

/** Kit presentation driven by the existing server-selected result and rotation. */
export function Wheel({
  segments,
  rotation,
  spinning,
  className,
}: {
  segments: Segment[];
  rotation: number;
  spinning: boolean;
  className?: string;
}) {
  const slice = 360 / segments.length;
  const background = `conic-gradient(${segments.map((_, i) => `${colors[i % colors.length]} ${i * slice}deg ${(i + 1) * slice}deg`).join(",")})`;
  return (
    <div
      className={cn("wheel-wrap mx-auto", className)}
      role="img"
      aria-label={`Prize wheel: ${segments.map((s) => `${s.short} ${s.sub}`).join(", ")}`}
    >
      <div
        className={cn(
          "wheel-disc motion-safe:transition-transform",
          spinning
            ? "motion-safe:duration-[4500ms] motion-safe:ease-[cubic-bezier(.12,.75,.12,1)]"
            : "duration-0",
        )}
        style={{ background, transform: `rotate(${rotation}deg)` }}
      >
        {segments.map((segment, i) => (
          <span
            key={segment.id}
            className="wheel-label"
            style={{ ["--a" as string]: `${i * slice + slice / 2}deg` }}
          >
            <b>{segment.short}</b>
            <span>{segment.sub}</span>
          </span>
        ))}
      </div>
      <div className="wheel-dots" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed rim lights
          <i key={i} style={{ ["--a" as string]: `${i * 15}deg` }} />
        ))}
      </div>
      <span className="wheel-hub" aria-hidden="true">
        <LogoMark tile={false} size={34} />
      </span>
      <svg className="wheel-pointer" viewBox="0 0 30 38" aria-hidden="true">
        <path
          d="M15 37 C11 30 3 22 3 14 a12 12 0 0 1 24 0 c0 8-8 16-12 23Z"
          fill="var(--primary)"
          stroke="var(--qr-bg)"
          strokeWidth="2.5"
        />
        <circle cx="15" cy="14" r="4.5" fill="var(--qr-bg)" />
      </svg>
    </div>
  );
}

export function segmentLabel(prize: {
  percentOff: number;
  appliesTo?: string | null;
}) {
  const item = prize.appliesTo?.trim();
  return {
    short: prize.percentOff === 100 ? "FREE" : `${prize.percentOff}%`,
    sub: item ? (item.length > 12 ? `${item.slice(0, 11)}…` : item) : "bill",
  };
}
