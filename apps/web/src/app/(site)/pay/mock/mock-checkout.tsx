"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MockCheckout({ reference }: { reference: string }) {
  const [pending, setPending] = useState(false);

  async function settle(outcome: "completed" | "failed") {
    setPending(true);
    const res = await fetch(
      `/api/v1/payments/mock/${encodeURIComponent(reference)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      },
    );
    if (!res.ok) {
      setPending(false);
      return;
    }
    const { returnUrl } = (await res.json()) as { returnUrl: string };
    window.location.assign(returnUrl);
  }

  return (
    <div className="grid gap-2">
      <Button size="lg" onClick={() => settle("completed")} disabled={pending}>
        Pay
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => settle("failed")}
        disabled={pending}
      >
        Cancel payment
      </Button>
    </div>
  );
}
