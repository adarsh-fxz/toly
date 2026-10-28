import { Skeleton } from "@/components/ui/skeleton";

export function RouteSkeleton({
  kind = "page",
}: {
  kind?: "page" | "toly" | "voucher" | "spin" | "dashboard" | "scan" | "admin";
}) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="space-y-8 py-12 max-sm:py-7"
    >
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-4/5 max-w-lg" />
        <Skeleton className="h-5 w-3/5 max-w-sm" />
      </div>
      {kind === "voucher" ? (
        <div className="mx-auto max-w-[520px] rounded-[32px] bg-card p-8 shadow-2">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mx-auto my-8 aspect-square w-56 rounded-md" />
          <Skeleton className="mx-auto h-10 w-4/5" />
        </div>
      ) : kind === "toly" || kind === "spin" || kind === "scan" ? (
        <div className="grid gap-8 min-[61.3125rem]:grid-cols-[minmax(0,1fr)_380px]">
          <Skeleton
            className={
              kind === "scan"
                ? "aspect-[4/3] rounded-xl"
                : "mx-auto aspect-square w-full max-w-[420px] rounded-full"
            }
          />
          <div className="space-y-5 rounded-xl bg-card p-7 shadow-1">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 ${kind === "dashboard" ? "grid-cols-2 min-[61.3125rem]:grid-cols-4" : "sm:grid-cols-2"}`}
          >
            {["a", "b", "c", "d"].map((key) => (
              <div
                key={key}
                className="space-y-4 rounded-xl bg-card p-6 shadow-1"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton
                  className={
                    kind === "dashboard" ? "h-10 w-2/3" : "h-20 w-full"
                  }
                />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
          {kind === "dashboard" || kind === "admin" ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : null}
        </>
      )}
    </div>
  );
}
