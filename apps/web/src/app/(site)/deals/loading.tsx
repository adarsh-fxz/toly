import { DealListSkeleton } from "@/components/deal/deal-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingDeals() {
  return (
    <div className="space-y-8 py-12 max-sm:py-7">
      <div className="space-y-4" aria-hidden>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-14 max-w-md" />
        <Skeleton className="h-5 max-w-lg" />
      </div>
      <DealListSkeleton rows={6} />
    </div>
  );
}
