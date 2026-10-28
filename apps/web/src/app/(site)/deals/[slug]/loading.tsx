import { Skeleton } from "@/components/ui/skeleton";
export default function LoadingDeal() {
  return (
    <div
      role="status"
      aria-label="Loading deal"
      className="space-y-6 py-12 max-sm:py-7"
    >
      <Skeleton className="h-8 w-24" />
      <div className="grid gap-9 min-[61.3125rem]:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="h-[300px] rounded-[30px]" />
        </div>
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    </div>
  );
}
