"use client";

import { normalizeNepaliPhone } from "@toly/shared/phone";
import { useEffect, useId, useState } from "react";
import { MotionRegion } from "@/components/feedback/motion-region";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { formatPhone as formatNepaliPhone } from "@/lib/format";
import { Turnstile } from "./turnstile";

const RESEND_SECONDS = 30;

type Step = "phone" | "code" | "name";

export function PhoneOtpForm({
  mode,
  turnstileSiteKey,
  onDone,
}: {
  /** "sign-in" creates a session; "link" adds the number to the signed-in account. */
  mode: "sign-in" | "link";
  turnstileSiteKey: string | null;
  onDone: () => void;
}) {
  const id = useId();
  const [step, setStep] = useState<Step>("phone");
  const [rawPhone, setRawPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  async function sendCode(target: string) {
    setPending(true);
    setError(null);
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: target,
      fetchOptions: captcha
        ? { headers: { "x-captcha-response": captcha } }
        : undefined,
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return false;
    }
    setResendIn(RESEND_SECONDS);
    return true;
  }

  async function submitPhone(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeNepaliPhone(rawPhone);
    if (!normalized) {
      setError("Enter a Nepali mobile number, like 98XXXXXXXX.");
      return;
    }
    if (turnstileSiteKey && !captcha) {
      setError("Complete the security check, then try again.");
      return;
    }
    setPhone(normalized);
    if (await sendCode(normalized)) {
      setCode("");
      setStep("code");
    }
  }

  async function submitCode(value = code) {
    if (value.length !== 6 || pending) return;
    setPending(true);
    setError(null);
    const { data, error } = await authClient.phoneNumber.verify({
      phoneNumber: phone,
      code: value,
      ...(mode === "link"
        ? { updatePhoneNumber: true, disableSession: true }
        : {}),
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      setCode("");
      return;
    }
    if (mode === "sign-in" && !data?.user?.name) {
      setStep("name");
      return;
    }
    onDone();
  }

  async function submitName(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Add at least 2 characters so friends recognise you.");
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
    onDone();
  }

  const stepDots = (
    <span
      className="inline-flex gap-1.5"
      role="img"
      aria-label={`Step ${step === "phone" ? 1 : step === "code" ? 2 : 3} of 3`}
    >
      {["phone", "code", "name"].map((value) => (
        <i
          key={value}
          className={`size-1.5 rounded-full ${value === step ? "bg-primary" : "bg-input"}`}
        />
      ))}
    </span>
  );
  const errorId = `${id}-error`;
  const errorNode = error ? (
    <p id={errorId} role="alert" className="text-sm text-destructive">
      {error}
    </p>
  ) : null;

  if (step === "name") {
    return (
      <MotionRegion key="name">
        <form onSubmit={submitName} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`}>
              What should friends call you?{" "}
              <span className="ml-2">{stepDots}</span>
            </Label>
            <Input
              id={`${id}-name`}
              autoComplete="name"
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : `${id}-name-hint`}
            />
            <p id={`${id}-name-hint`} className="text-sm text-muted-foreground">
              Shown to people in your toly. You can change it later.
            </p>
          </div>
          {errorNode}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Saving…" : "Continue"}
          </Button>
        </form>
      </MotionRegion>
    );
  }

  if (step === "code") {
    return (
      <MotionRegion key="code">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitCode();
          }}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor={`${id}-code`}>
              Enter the 6-digit code <span className="ml-2">{stepDots}</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Sent to{" "}
              <span className="font-medium text-foreground tabular">
                {formatNepaliPhone(phone)}
              </span>
            </p>
            <InputOTP
              id={`${id}-code`}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              pattern="^[0-9]+$"
              value={code}
              onChange={setCode}
              onComplete={submitCode}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {errorNode}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || code.length !== 6}
            aria-busy={pending}
          >
            {pending ? "Checking…" : "Verify"}
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
            >
              Use a different number
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={resendIn > 0 || pending}
              onClick={() => sendCode(phone)}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Button>
          </div>
        </form>
      </MotionRegion>
    );
  }

  return (
    <form onSubmit={submitPhone} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-phone`}>
          Mobile number <span className="ml-2">{stepDots}</span>
        </Label>
        <div className="flex">
          <span className="inline-flex h-[52px] items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-base text-muted-foreground tabular">
            +977
          </span>
          <Input
            id={`${id}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete={
              mode === "sign-in" ? "tel-national webauthn" : "tel-national"
            }
            placeholder="98XXXXXXXX"
            spellCheck={false}
            className="rounded-l-none tabular"
            value={rawPhone}
            onChange={(e) => setRawPhone(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : `${id}-phone-hint`}
          />
        </div>
        <p id={`${id}-phone-hint`} className="text-sm text-muted-foreground">
          NTC or Ncell. We only use it for codes and toly updates.
        </p>
      </div>
      {turnstileSiteKey ? (
        <Turnstile siteKey={turnstileSiteKey} onToken={setCaptcha} />
      ) : null}
      {errorNode}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Sending…" : "Send code"}
      </Button>
    </form>
  );
}
