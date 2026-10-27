import { Skeleton } from "@/components/ui/skeleton";

export function DealListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <div key={i} className="flex gap-4 px-3 py-5">
          <Skeleton className="size-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}
