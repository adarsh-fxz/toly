"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { PasskeySignIn } from "@/components/auth/passkey-sign-in";
import { PhoneOtpForm } from "@/components/auth/phone-otp-form";

export function SignInPanel({
  next,
  google,
  turnstileSiteKey,
}: {
  next: string;
  google: boolean;
  turnstileSiteKey: string | null;
}) {
  const router = useRouter();
  const done = useCallback(() => {
    router.replace(next);
    router.refresh();
  }, [router, next]);

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h1 className="text-h1 font-semibold max-sm:text-[36px]">Sign in</h1>
        <p className="text-muted-foreground">
          New here? The same steps create your account.
        </p>
      </div>
      <PhoneOtpForm
        mode="sign-in"
        turnstileSiteKey={turnstileSiteKey}
        onDone={done}
      />
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-3">
        {google ? <GoogleSignIn next={next} /> : null}
        <PasskeySignIn onDone={done} />
      </div>
    </div>
  );
}
