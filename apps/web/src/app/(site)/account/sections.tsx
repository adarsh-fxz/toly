"use client";

import { BadgeCheck, KeyRound, Laptop, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";
import { InlineConfirm } from "@/components/feedback/inline-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { formatDate, formatPhone as formatNepaliPhone } from "@/lib/format";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 rounded-xl bg-card p-7 shadow-1 max-sm:p-[22px] min-[61.3125rem]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] min-[61.3125rem]:gap-10">
      <div className="space-y-1">
        <h2 className="font-display text-h4 font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

export function ProfileSection({ name }: { name: string }) {
  const id = useId();
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError("Add at least 2 characters.");
      return;
    }
    setPending(true);
    setError(null);
    const { error } = await authClient.updateUser({ name: trimmed });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    toast.success("Name saved");
    router.refresh();
  }

  return (
    <Section
      title="Your name"
      description="Shown to friends in your tolys and to venues when you redeem."
    >
      <form onSubmit={save} className="space-y-3" noValidate>
        <Label htmlFor={`${id}-name`} className="sr-only">
          Name
        </Label>
        <Input
          id={`${id}-name`}
          autoComplete="name"
          maxLength={60}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
        <Button
          type="submit"
          disabled={pending || value.trim() === name}
          aria-busy={pending}
        >
          {pending ? "Saving…" : "Save name"}
        </Button>
      </form>
    </Section>
  );
}

export function PhoneSection({
  phoneNumber,
  turnstileSiteKey,
}: {
  phoneNumber: string | null;
  turnstileSiteKey: string | null;
}) {
  const router = useRouter();

  return (
    <Section
      title="Mobile number"
      description="Needed to start or join a toly, so every seat belongs to a real person."
    >
      {phoneNumber ? (
        <p className="inline-flex items-center gap-2 text-lg font-medium tabular">
          {formatNepaliPhone(phoneNumber)}
          <Badge variant="success" className="gap-1">
            <BadgeCheck className="size-4" aria-hidden />
            Verified
          </Badge>
        </p>
      ) : (
        <PhoneOtpForm
          mode="link"
          turnstileSiteKey={turnstileSiteKey}
          onDone={() => {
            toast.success("Number verified");
            router.refresh();
          }}
        />
      )}
    </Section>
  );
}

export function PasskeysSection() {
  const { data: passkeys, isPending, refetch } = authClient.useListPasskeys();
  const [adding, setAdding] = useState(false);

  async function add() {
    setAdding(true);
    const { error } = await authClient.passkey.addPasskey({
      name: deviceLabel(),
    });
    setAdding(false);
    if (error) {
      toast.error(
        authErrorMessage(error, "Couldn't add a passkey on this device."),
      );
      return;
    }
    toast.success("Passkey added");
    refetch();
  }

  async function remove(id: string) {
    const { error } = await authClient.passkey.deletePasskey({ id });
    if (error) {
      toast.error(authErrorMessage(error));
      return false;
    }
    toast.success("Passkey removed");
    refetch();
    return true;
  }

  return (
    <Section
      title="Passkeys"
      description="Sign in with your fingerprint, face or screen lock. Can't be phished or reused."
    >
      <div className="space-y-4">
        {isPending ? (
          <Skeleton className="h-14 w-full" />
        ) : passkeys && passkeys.length > 0 ? (
          <ul className="kit-list divide-y rounded-xl border bg-card">
            {passkeys.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <KeyRound
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {p.name || "Passkey"}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Added {formatDate(p.createdAt)}
                    </span>
                  </span>
                </span>
                <InlineConfirm
                  trigger="Remove"
                  title="Remove this passkey?"
                  body="You can still sign in with another passkey or your mobile number."
                  keepLabel="Keep"
                  confirmLabel="Remove"
                  onConfirm={() => remove(p.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No passkeys yet. Add one to skip SMS codes next time.
          </p>
        )}
        <Button
          variant="outline"
          onClick={add}
          disabled={adding}
          aria-busy={adding}
        >
          <KeyRound aria-hidden />
          {adding ? "Waiting for your device…" : "Add a passkey"}
        </Button>
      </div>
    </Section>
  );
}

type SessionRow = {
  id: string;
  token: string;
  userAgent?: string | null;
  updatedAt: Date;
};

export function SessionsSection() {
  const router = useRouter();
  const { data: current } = authClient.useSession();
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await authClient.listSessions();
    if (error) {
      setError(authErrorMessage(error, "Couldn't load your devices."));
      return;
    }
    setError(null);
    setSessions(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function revoke(token: string) {
    const { error } = await authClient.revokeSession({ token });
    if (error) {
      toast.error(authErrorMessage(error));
      return false;
    }
    toast.success("Signed out on that device");
    load();
    return true;
  }

  async function revokeOthers() {
    const { error } = await authClient.revokeOtherSessions();
    if (error) {
      toast.error(authErrorMessage(error));
      return false;
    }
    toast.success("Signed out everywhere else");
    load();
    router.refresh();
    return true;
  }

  return (
    <Section
      title="Signed-in devices"
      description="Sign out anywhere you don't recognise."
    >
      {error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={load}>
            Try again
          </Button>
        </div>
      ) : !sessions ? (
        <Skeleton className="h-28 w-full" />
      ) : (
        <div className="space-y-4">
          <ul className="kit-list divide-y rounded-xl border bg-card">
            {sessions.map((s) => {
              const isCurrent = s.token === current?.session.token;
              const mobile = /mobile|android|iphone/i.test(s.userAgent ?? "");
              const Icon = mobile ? Smartphone : Laptop;
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon
                      className="size-5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {describeAgent(s.userAgent)}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {isCurrent
                          ? "This device"
                          : `Active ${formatDate(s.updatedAt)}`}
                      </span>
                    </span>
                  </span>
                  {isCurrent ? null : (
                    <InlineConfirm
                      trigger="Sign out"
                      title="Sign out on that device?"
                      keepLabel="Keep signed in"
                      confirmLabel="Sign out"
                      onConfirm={() => revoke(s.token)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          {sessions.length > 1 ? (
            <InlineConfirm
              trigger="Sign out of all other devices"
              title="Sign out everywhere else?"
              body="You'll stay signed in on this device."
              keepLabel="Keep signed in"
              confirmLabel="Sign out"
              onConfirm={revokeOthers}
            />
          ) : null}
        </div>
      )}
    </Section>
  );
}

function deviceLabel() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "Android phone";
  if (/iphone|ipad/i.test(ua)) return "iPhone";
  if (/mac/i.test(ua)) return "Mac";
  if (/windows/i.test(ua)) return "Windows PC";
  return "This device";
}

function describeAgent(ua?: string | null) {
  if (!ua) return "Unknown device";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /chrome/i.test(ua)
      ? "Chrome"
      : /firefox/i.test(ua)
        ? "Firefox"
        : /safari/i.test(ua)
          ? "Safari"
          : "Browser";
  const os = /android/i.test(ua)
    ? "Android"
    : /iphone|ipad/i.test(ua)
      ? "iOS"
      : /mac/i.test(ua)
        ? "macOS"
        : /windows/i.test(ua)
          ? "Windows"
          : /linux/i.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}
