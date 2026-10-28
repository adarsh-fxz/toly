"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { InlineConfirm } from "@/components/feedback/inline-confirm";
import { Button } from "@/components/ui/button";
import { api, readError } from "@/lib/api";

export function JoinToly({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setPending(true);
    setError(null);
    const res = await api.api.v1.groups[":id"].join.$post({
      param: { id: groupId },
    });
    setPending(false);
    if (!res.ok) {
      setError((await readError(res)).message);
      router.refresh();
      return;
    }
    const { status } = await res.json();
    toast.success(
      status === "unlocked"
        ? "You filled the last seat. Deal unlocked."
        : "You're in",
    );
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="w-full"
        onClick={join}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Joining…" : "Join this toly"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LeaveToly({
  groupId,
  isOrganizer,
}: {
  groupId: string;
  isOrganizer: boolean;
}) {
  const router = useRouter();

  async function leave() {
    const res = await api.api.v1.groups[":id"].leave.$post({
      param: { id: groupId },
    });
    if (!res.ok) {
      toast.error((await readError(res)).message);
      return false;
    }
    toast.success(isOrganizer ? "Toly cancelled" : "You left the toly");
    router.refresh();
    return true;
  }

  return (
    <InlineConfirm
      trigger={isOrganizer ? "Cancel this toly" : "Leave this toly"}
      title={
        isOrganizer ? "Cancel for everyone who joined?" : "Give up your seat?"
      }
      body={
        isOrganizer
          ? "Everyone who joined will see that the toly was cancelled."
          : "Your seat opens up for someone else."
      }
      confirmLabel={isOrganizer ? "Cancel toly" : "Leave"}
      onConfirm={leave}
    />
  );
}
