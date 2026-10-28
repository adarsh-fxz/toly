"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Banner } from "@/components/feedback/banner";
import { InlineConfirm } from "@/components/feedback/inline-confirm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, readError } from "@/lib/api";

type Decision = "approved" | "rejected" | "suspended";

const done: Record<Decision, string> = {
  approved: "Venue approved",
  rejected: "Venue declined",
  suspended: "Venue paused",
};

export function ReviewActions({
  merchantId,
  status,
}: {
  merchantId: string;
  status: string;
}) {
  const id = useId();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<Decision | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function review(decision: Decision) {
    if (decision !== "approved" && note.trim().length < 5) {
      setError("Add a short reason. The venue will see it.");
      return false;
    }
    setPending(decision);
    setError(null);
    try {
      const res = await api.api.v1.admin.merchants[":id"].review.$post({
        param: { id: merchantId },
        json: { decision, note: note.trim() || undefined },
      });
      if (!res.ok) {
        setError((await readError(res)).message);
        return false;
      }
      toast.success(done[decision]);
      router.refresh();
      return true;
    } catch {
      setError("Couldn't save the review. Try again.");
      return false;
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="w-full space-y-3 min-[61.3125rem]:w-72">
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-note`}>Note to the venue</Label>
        <Textarea
          id={`${id}-note`}
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error ? (
          <div id={`${id}-error`}>
            <Banner tone="danger">{error}</Banner>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {status !== "approved" ? (
          <Button
            variant="success"
            onClick={() => review("approved")}
            disabled={pending !== null}
            aria-busy={pending === "approved"}
          >
            {pending === "approved" ? "Approving…" : "Approve"}
          </Button>
        ) : (
          <InlineConfirm
            trigger="Pause venue"
            title="Pause this venue?"
            body="Customers won't be able to start new tolys here."
            keepLabel="Keep live"
            confirmLabel="Pause venue"
            onConfirm={() => review("suspended")}
          />
        )}
        {status === "pending" ? (
          <InlineConfirm
            trigger="Decline"
            title="Decline this venue?"
            body="The venue will see the reason above."
            keepLabel="Keep reviewing"
            confirmLabel="Decline"
            onConfirm={() => review("rejected")}
          />
        ) : null}
      </div>
    </div>
  );
}
