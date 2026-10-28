/* eslint-disable @next/next/no-img-element -- tiny local SVGs, no optimisation needed */
import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK_COUNT = 6;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * A person's avatar: their photo if they have one, otherwise one of six illustrated
 * Kathmandu friends (public/avatars/avatar-1..6.svg) picked stably from their id.
 * Never shows a broken image; alt is empty when a visible name sits next to it.
 */
export function PersonAvatar({
  name,
  seed,
  src,
  size = 40,
  decorative = false,
  className,
}: {
  name: string;
  /** stable id (user id) so the same person always gets the same illustration */
  seed?: string;
  src?: string | null;
  size?: number;
  /** true when the name is already printed next to the avatar */
  decorative?: boolean;
  className?: string;
}) {
  const fallback = `/avatars/avatar-${(hash(seed ?? name) % FALLBACK_COUNT) + 1}.svg`;
  return (
    <Image
      unoptimized
      src={src || fallback}
      alt={decorative ? "" : name}
      width={size}
      height={size}
      loading="lazy"
      // width/height attributes give the default size; a size-* class (e.g. "size-full") overrides it
      className={cn(
        "aspect-square shrink-0 rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}

/** Overlapping row of avatars, e.g. "Aashma, you, Prabin and Sujan" on a voucher. */
export function AvatarStack({
  people,
  size = 32,
  className,
}: {
  people: { id: string; name: string; avatarUrl?: string | null }[];
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex", className)} aria-hidden="true">
      {people.map((p, i) => (
        <PersonAvatar
          key={p.id}
          name={p.name}
          seed={p.id}
          src={p.avatarUrl}
          size={size}
          decorative
          className={cn("ring-3 ring-card", i > 0 && "-ml-2.5")}
        />
      ))}
    </span>
  );
}
