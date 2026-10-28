"use client";

import {
  BadgeCheck,
  Camera,
  CircleAlert,
  Keyboard,
  ScanLine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type QrScannerType from "qr-scanner";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MotionRegion } from "@/components/feedback/motion-region";
import { Confetti } from "@/components/toly/confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, readError } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import { describeOffer, formatCode } from "@/lib/voucher";

type Lookup = {
  id: string;
  code: string;
  title: string;
  details: Parameters<typeof describeOffer>[0] & { includes?: string[] };
  holderName: string;
  status: string;
  redeemedAt: string | null;
  window: string | null;
  canRedeem: boolean;
  problem: { code: string; message: string } | null;
};

type State =
  | { step: "scan" }
  | { step: "checking" }
  | { step: "result"; voucher: Lookup }
  | { step: "error"; message: string }
  | { step: "done"; voucher: Lookup; at: string };

export function Scanner({ merchantId }: { merchantId: string }) {
  const id = useId();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerType | null>(null);
  const busy = useRef(false);
  const [state, setState] = useState<State>({ step: "scan" });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [bill, setBill] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const check = useCallback(
    async (ref: { token: string } | { code: string }) => {
      if (busy.current) return;
      busy.current = true;
      scannerRef.current?.stop();
      setState({ step: "checking" });
      const res = await api.api.v1.merchants[":id"].redemptions.lookup.$post({
        param: { id: merchantId },
        json: ref,
      });
      busy.current = false;
      if (!res.ok) {
        navigator.vibrate?.([60, 60, 60]);
        setState({ step: "error", message: (await readError(res)).message });
        return;
      }
      const voucher = (await res.json()) as unknown as Lookup;
      navigator.vibrate?.(voucher.canRedeem ? 80 : [60, 60, 60]);
      setBill("");
      setState({ step: "result", voucher });
    },
    [merchantId],
  );

  useEffect(() => {
    if (state.step !== "scan" || !videoRef.current) return;
    let disposed = false;
    (async () => {
      const { default: QrScanner } = await import("qr-scanner");
      if (disposed || !videoRef.current) return;
      if (!(await QrScanner.hasCamera())) {
        setCameraError("No camera found. Type the code instead.");
        return;
      }
      if (disposed || !videoRef.current) return;
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result.data.startsWith("toly1.")) check({ token: result.data });
        },
        {
          preferredCamera: "environment",
          maxScansPerSecond: 8,
          returnDetailedScanResult: true,
        },
      );
      scannerRef.current = scanner;
      try {
        await scanner.start();
        setCameraError(null);
      } catch {
        setCameraError(
          "Camera access was blocked. Allow it in your browser settings, or type the code.",
        );
      }
    })();
    return () => {
      disposed = true;
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, [state.step, check]);

  async function redeem(voucher: Lookup) {
    setRedeeming(true);
    const amount = bill ? Number(bill) : null;
    const res = await api.api.v1.merchants[":id"].redemptions.$post({
      param: { id: merchantId },
      json: {
        voucherId: voucher.id,
        billAmount: amount && amount > 0 ? amount : null,
      },
    });
    setRedeeming(false);
    if (!res.ok) {
      setState({ step: "error", message: (await readError(res)).message });
      return;
    }
    const { redeemedAt } = await res.json();
    navigator.vibrate?.(120);
    setState({ step: "done", voucher, at: String(redeemedAt) });
    router.refresh();
  }

  const reset = () => {
    setManual("");
    setState({ step: "scan" });
  };

  return (
    <div className="grid gap-8 min-[61.3125rem]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <section
        aria-label="Scanner"
        className="space-y-4 rounded-xl bg-card p-5 shadow-1"
      >
        {state.step === "scan" ? (
          <>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#0e0d16] max-sm:aspect-square">
              <video
                ref={videoRef}
                className="size-full object-cover"
                playsInline
                muted
              />
              <div aria-hidden className="viewfinder-frame">
                <i />
                <i />
                <i />
                <i />
                <span className="viewfinder-line" />
              </div>
              {cameraError ? (
                <div className="absolute inset-0 grid place-items-center p-8 text-center text-white">
                  <div className="space-y-2">
                    <Camera className="mx-auto size-8" aria-hidden />
                    <p>{cameraError}</p>
                  </div>
                </div>
              ) : null}
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ScanLine className="size-4" aria-hidden />
              Point the camera at the customer's voucher.
            </p>
          </>
        ) : (
          <MotionRegion key={state.step} kind="scan">
            <ResultPanel
              state={state}
              bill={bill}
              setBill={setBill}
              redeeming={redeeming}
              onRedeem={redeem}
              onReset={reset}
            />
          </MotionRegion>
        )}
      </section>

      <section
        aria-labelledby={`${id}-manual`}
        className="space-y-4 self-start rounded-xl bg-card p-6 shadow-1"
      >
        <h2
          id={`${id}-manual`}
          className="flex items-center gap-2 font-sans text-lg font-semibold [font-variation-settings:normal]"
        >
          <Keyboard className="size-5" aria-hidden />
          Type the code instead
        </h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (manual.trim()) check({ code: manual });
          }}
        >
          <Label htmlFor={`${id}-code`} className="sr-only">
            Voucher code
          </Label>
          <Input
            id={`${id}-code`}
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="K7Q2-MX9P"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            className="font-semibold tracking-wider tabular"
          />
          <Button type="submit" disabled={state.step === "checking"}>
            Check
          </Button>
        </form>
      </section>
    </div>
  );
}

function ResultPanel({
  state,
  bill,
  setBill,
  redeeming,
  onRedeem,
  onReset,
}: {
  state: Exclude<State, { step: "scan" }>;
  bill: string;
  setBill: (v: string) => void;
  redeeming: boolean;
  onRedeem: (v: Lookup) => void;
  onReset: () => void;
}) {
  const billId = useId();

  if (state.step === "checking") {
    return (
      <div
        role="status"
        className="skeleton grid aspect-square place-items-center rounded-xl bg-muted"
      >
        Checking voucher…
      </div>
    );
  }

  if (state.step === "error") {
    return (
      <div
        role="alert"
        className="space-y-4 rounded-xl bg-destructive-soft p-6"
      >
        <CircleAlert className="size-10 text-destructive" aria-hidden />
        <p className="text-2xl font-bold">{state.message}</p>
        <Button size="lg" className="w-full" onClick={onReset}>
          Scan again
        </Button>
      </div>
    );
  }

  if (state.step === "done") {
    return (
      <div
        role="status"
        className="relative overflow-hidden space-y-4 rounded-xl bg-success p-6 text-success-foreground"
      >
        <Confetti pieces={8} />
        <BadgeCheck className="size-12" aria-hidden />
        <p className="font-display text-h2 font-semibold">Redeemed</p>
        <p className="text-lg">
          {state.voucher.title} for {state.voucher.holderName},{" "}
          {formatDateTime(state.at)}
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          onClick={onReset}
        >
          Scan next
        </Button>
      </div>
    );
  }

  const { voucher } = state;
  return (
    <div
      role="status"
      aria-live="polite"
      className="space-y-5 rounded-xl bg-card p-6 shadow-1 data-[ok=true]:bg-success-soft"
      data-ok={voucher.canRedeem}
    >
      <div className="space-y-1">
        <p
          className={
            voucher.canRedeem
              ? "font-semibold text-success"
              : "font-semibold text-destructive"
          }
        >
          {voucher.canRedeem ? "Valid voucher" : voucher.problem?.message}
          {voucher.problem?.code === "ALREADY_REDEEMED" && voucher.redeemedAt
            ? ` on ${formatDateTime(voucher.redeemedAt)}`
            : null}
        </p>
        <p className="text-3xl font-bold">{describeOffer(voucher.details)}</p>
        <p className="text-muted-foreground">
          {voucher.title} for {voucher.holderName}, code{" "}
          {formatCode(voucher.code)}
        </p>
      </div>
      {voucher.details.includes?.length ? (
        <ul className="list-inside list-disc text-sm">
          {voucher.details.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {voucher.canRedeem ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor={billId}>
              Final bill (Rs){" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id={billId}
              inputMode="numeric"
              value={bill}
              onChange={(e) => setBill(e.target.value.replace(/\D/g, ""))}
              aria-describedby={`${billId}-hint`}
            />
            <p id={`${billId}-hint`} className="text-sm text-muted-foreground">
              Helps you see what Toly customers spend. Redeem after they've
              paid.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="lg"
              variant="outline"
              onClick={onReset}
              disabled={redeeming}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              variant="success"
              onClick={() => onRedeem(voucher)}
              disabled={redeeming}
              aria-busy={redeeming}
            >
              {redeeming ? "Redeeming…" : "Redeem"}
            </Button>
          </div>
        </>
      ) : (
        <Button size="lg" className="w-full" onClick={onReset}>
          Scan again
        </Button>
      )}
    </div>
  );
}
