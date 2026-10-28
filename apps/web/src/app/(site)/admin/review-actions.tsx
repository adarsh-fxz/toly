"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
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
      return;
    }
    setPending(decision);
    setError(null);
    const res = await api.api.v1.admin.merchants[":id"].review.$post({
      param: { id: merchantId },
      json: { decision, note: note.trim() || undefined },
    });
    setPending(null);
    if (!res.ok) {
      setError((await readError(res)).message);
      return;
    }
    toast.success(done[decision]);
    router.refresh();
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
          <p
            id={`${id}-error`}
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {status !== "approved" ? (
          <Button
            onClick={() => review("approved")}
            disabled={pending !== null}
          >
            {pending === "approved" ? "Approving…" : "Approve"}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => review("suspended")}
            disabled={pending !== null}
          >
            {pending === "suspended" ? "Pausing…" : "Pause venue"}
          </Button>
        )}
        {status === "pending" ? (
          <Button
            variant="outline"
            onClick={() => review("rejected")}
            disabled={pending !== null}
          >
            {pending === "rejected" ? "Declining…" : "Decline"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
