import { Skeleton } from "@/components/ui/skeleton";

export function DealListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 min-[981px]:grid-cols-3"
      role="status"
      aria-label="Loading deals"
    >
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed skeleton positions
        <div key={i} className="rounded-xl bg-card p-2 shadow-1">
          <Skeleton className="h-[168px] rounded-[22px]" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="mt-5 h-7 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
