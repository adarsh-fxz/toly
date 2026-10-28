"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InlineConfirm } from "@/components/feedback/inline-confirm";
import { Button } from "@/components/ui/button";
import { api, readError } from "@/lib/api";

type Next = "live" | "paused" | "ended";

const labels: Record<Next, { action: string; done: string }> = {
  live: { action: "Publish", done: "Deal is live" },
  paused: { action: "Pause", done: "Deal paused" },
  ended: { action: "End deal", done: "Deal ended" },
};

export function DealStatusActions({
  merchantId,
  dealId,
  status,
  canPublish,
}: {
  merchantId: string;
  dealId: string;
  status: string;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<Next | null>(null);

  const options: Next[] =
    status === "live"
      ? ["paused", "ended"]
      : status === "ended"
        ? []
        : canPublish
          ? ["live"]
          : [];

  async function change(next: Next) {
    setPending(next);
    const res = await api.api.v1.merchants[":id"].deals[":dealId"].status.$post(
      {
        param: { id: merchantId, dealId },
        json: { status: next },
      },
    );
    setPending(null);
    if (!res.ok) {
      toast.error((await readError(res)).message);
      return false;
    }
    toast.success(labels[next].done);
    router.refresh();
    return true;
  }

  return (
    <>
      {options.map((next) =>
        next === "ended" ? (
          <InlineConfirm
            key={next}
            trigger="End deal"
            title="End this deal?"
            body="New groups will no longer be able to start this deal."
            confirmLabel="End deal"
            onConfirm={() => change(next)}
          />
        ) : (
          <Button
            key={next}
            size="sm"
            variant={next === "live" ? "default" : "outline"}
            disabled={pending !== null}
            onClick={() => change(next)}
          >
            {pending === next ? "Saving…" : labels[next].action}
          </Button>
        ),
      )}
    </>
  );
}
