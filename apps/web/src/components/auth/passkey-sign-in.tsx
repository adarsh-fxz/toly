"use client";

import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

export function PasskeySignIn({ onDone }: { onDone: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Offer saved passkeys in the browser's autofill on the phone field when supported.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(await PublicKeyCredential.isConditionalMediationAvailable?.()))
        return;
      const { data } = await authClient.signIn.passkey({ autoFill: true });
      if (data && !cancelled) onDone();
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [onDone]);

  async function signIn() {
    setPending(true);
    setError(null);
    const { error } = await authClient.signIn.passkey();
    setPending(false);
    if (error) {
      setError(
        authErrorMessage(
          error,
          "Couldn't sign in with a passkey. Try your phone number instead.",
        ),
      );
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={signIn}
        disabled={pending}
      >
        <KeyRound aria-hidden />
        {pending ? "Waiting for your device…" : "Sign in with a passkey"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
