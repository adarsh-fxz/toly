"use client";

import { formatNepaliPhone } from "@toly/shared/phone";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, readError } from "@/lib/api";

type Member = {
  userId: string;
  name: string;
  phoneNumber: string | null;
  role: "owner" | "staff";
};

export function TeamManager({
  merchantId,
  members,
}: {
  merchantId: string;
  members: Member[];
}) {
  const id = useId();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const res = await api.api.v1.merchants[":id"].team.$post({
      param: { id: merchantId },
      json: { phone },
    });
    setPending(false);
    if (!res.ok) {
      setError((await readError(res)).message);
      return;
    }
    setPhone("");
    toast.success("Added to your team");
    router.refresh();
  }

  async function remove(member: Member) {
    const res = await api.api.v1.merchants[":id"].team[":userId"].$delete({
      param: { id: merchantId, userId: member.userId },
    });
    if (!res.ok) {
      toast.error((await readError(res)).message);
      return;
    }
    toast.success(`${member.name || "Staff member"} can no longer scan`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <ul className="divide-y border-y">
        {members.map((m) => (
          <li
            key={m.userId}
            className="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold">
                {m.name || "Unnamed"}
                {m.role === "owner" ? (
                  <Badge variant="secondary">Owner</Badge>
                ) : null}
              </p>
              {m.phoneNumber ? (
                <p className="text-sm text-muted-foreground tabular">
                  {formatNepaliPhone(m.phoneNumber)}
                </p>
              ) : null}
            </div>
            {m.role === "staff" ? (
              <Button variant="ghost" size="sm" onClick={() => remove(m)}>
                Remove
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="space-y-3" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-phone`}>
            Add a staff member by mobile number
          </Label>
          <div className="flex gap-2">
            <Input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              placeholder="98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : `${id}-hint`}
            />
            <Button
              type="submit"
              disabled={pending || !phone.trim()}
              aria-busy={pending}
            >
              {pending ? "Adding…" : "Add"}
            </Button>
          </div>
          {error ? (
            <p
              id={`${id}-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          ) : (
            <p id={`${id}-hint`} className="text-sm text-muted-foreground">
              Staff can scan and redeem vouchers. They can't edit deals or see
              this team list.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
