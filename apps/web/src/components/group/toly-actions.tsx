"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
        ? "You filled the last seat. Deal unlocked!"
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
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function leave() {
    setPending(true);
    const res = await api.api.v1.groups[":id"].leave.$post({
      param: { id: groupId },
    });
    setPending(false);
    if (!res.ok) {
      toast.error((await readError(res)).message);
      return;
    }
    toast.success(isOrganizer ? "Toly cancelled" : "You left the toly");
    router.refresh();
  }

  if (!confirming) {
    return (
      <Button variant="ghost" onClick={() => setConfirming(true)}>
        {isOrganizer ? "Cancel this toly" : "Leave this toly"}
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
      <p className="mr-auto text-sm">
        {isOrganizer ? "Cancel for everyone who joined?" : "Give up your seat?"}
      </p>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Keep it
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={leave}
        disabled={pending}
      >
        {pending ? "Working…" : isOrganizer ? "Cancel toly" : "Leave"}
      </Button>
    </div>
  );
}
