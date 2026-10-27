import { cn } from "@/lib/utils";

type Segment = { id: string; short: string; sub: string };

const SIZE = 320;
const R = SIZE / 2;

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [R + radius * Math.cos(rad), R + radius * Math.sin(rad)] as const;
}

function slice(start: number, end: number) {
  const [x1, y1] = polar(start, R - 6);
  const [x2, y2] = polar(end, R - 6);
  const large = end - start > 180 ? 1 : 0;
  return `M ${R} ${R} L ${x1} ${y1} A ${R - 6} ${R - 6} 0 ${large} 1 ${x2} ${y2} Z`;
}

/** Rotation that brings the centre of segment `index` under the top pointer after `turns` full spins. */
export function landingRotation(
  index: number,
  count: number,
  turns = 6,
  jitter = 0,
) {
  const step = 360 / count;
  return turns * 360 - (index * step + step / 2) + jitter * step * 0.35;
}

// Segment fills cycle through crimson, the dhaka weave and indigo; text colour follows for contrast.
const fills = [
  { fill: "var(--primary)", text: "var(--primary-foreground)" },
  { fill: "url(#dhaka)", text: "#ffffff" },
  { fill: "#1a1d3a", text: "#f6f7fa" },
];

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
  const step = 360 / segments.length;

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-sm",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={cn(
          "size-full drop-shadow-sm motion-safe:transition-transform",
          spinning
            ? "motion-safe:duration-[4500ms] motion-safe:ease-[cubic-bezier(0.12,0.67,0.12,1)]"
            : "duration-0",
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
        role="img"
        aria-label="Prize wheel"
      >
        <defs>
          {/* Dhaka weave: stepped diamonds in the topi's crimson, mustard, white and black. */}
          <pattern
            id="dhaka"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <rect width="16" height="16" fill="#1a1d3a" />
            <path d="M8 1 L15 8 L8 15 L1 8 Z" fill="#c8102e" />
            <path d="M8 4 L12 8 L8 12 L4 8 Z" fill="#f2b705" />
            <path d="M8 6.5 L9.5 8 L8 9.5 L6.5 8 Z" fill="#ffffff" />
            <path
              d="M0 0 L2 0 L0 2 Z M16 0 L14 0 L16 2 Z M0 16 L2 16 L0 14 Z M16 16 L14 16 L16 14 Z"
              fill="#ffffff"
            />
          </pattern>
        </defs>
        <circle cx={R} cy={R} r={R - 1} fill="#1a1d3a" />
        {segments.map((segment, i) => {
          // Cycle the three fills, but never let the last segment match the first one beside it.
          const last =
            i === segments.length - 1 && i % fills.length === 0 && i > 0;
          const style = fills[last ? 1 : i % fills.length] ?? fills[0];
          const mid = i * step + step / 2;
          const [tx, ty] = polar(mid, R * 0.66);
          const [sx, sy] = polar(mid, R * 0.42);
          return (
            <g key={segment.id}>
              <path
                d={slice(i * step, (i + 1) * step)}
                fill={style?.fill}
                stroke="#f6f7fa"
                strokeWidth="2"
              />
              <text
                x={tx}
                y={ty}
                transform={`rotate(${mid} ${tx} ${ty})`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={style?.text}
                className="font-display text-[22px] font-extrabold"
                style={{
                  fontVariationSettings: '"wdth" 75',
                  paintOrder: "stroke",
                  stroke: "#1a1d3a",
                  strokeWidth: last || i % fills.length === 1 ? 4 : 0,
                }}
              >
                {segment.short}
              </text>
              <text
                x={sx}
                y={sy}
                transform={`rotate(${mid} ${sx} ${sy})`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={style?.text}
                className="font-sans text-[11px] font-semibold"
                style={{
                  paintOrder: "stroke",
                  stroke: "#1a1d3a",
                  strokeWidth: last || i % fills.length === 1 ? 3 : 0,
                }}
              >
                {segment.sub}
              </text>
            </g>
          );
        })}
        <circle
          cx={R}
          cy={R}
          r={22}
          fill="#f6f7fa"
          stroke="#1a1d3a"
          strokeWidth="4"
        />
      </svg>
      {/* Fixed pointer at the top. */}
      <svg
        aria-hidden
        viewBox="0 0 40 44"
        className="absolute -top-2 left-1/2 w-10 -translate-x-1/2 drop-shadow"
      >
        <path
          d="M20 44 L4 8 A16 16 0 0 1 36 8 Z"
          fill="var(--prize)"
          stroke="#1a1d3a"
          strokeWidth="3"
        />
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
