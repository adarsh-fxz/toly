"use client";

import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const REFRESH_MS = 30_000;

/** Fetches a fresh signed token every 30 seconds and keeps the screen awake while the voucher is open. */
export function RotatingQr({ voucherId }: { voucherId: string }) {
  const router = useRouter();
  const [src, setSrc] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let lock: WakeLockSentinel | null = null;

    async function refresh() {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await api.api.v1.me.vouchers[":id"].token.$get({
          param: { id: voucherId },
        });
        if (res.status === 409) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const { token } = await res.json();
        const dataUrl = await QRCode.toDataURL(token, {
          margin: 4,
          color: { dark: "#17161C", light: "#FFFFFF" },
          width: 512,
          errorCorrectionLevel: "M",
        });
        if (!cancelled) {
          setSrc(dataUrl);
          setOffline(false);
        }
      } catch {
        if (!cancelled) setOffline(true);
      }
    }

    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    navigator.wakeLock
      ?.request("screen")
      .then((l) => {
        lock = l;
      })
      .catch(() => {});
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      lock?.release().catch(() => {});
    };
  }, [voucherId, router]);

  return (
    <div className="space-y-2">
      <div className="mx-auto aspect-square w-full max-w-64 rounded-xl bg-qr-bg p-1">
        {src ? (
          // biome-ignore lint/performance/noImgElement: locally generated data URL, nothing to optimise
          <img
            src={src}
            alt="Voucher QR code. It refreshes every 30 seconds."
            className="size-full [image-rendering:pixelated]"
          />
        ) : (
          <div className="skeleton size-full rounded-md" />
        )}
      </div>
      <p
        className="text-center text-sm text-muted-foreground"
        aria-live="polite"
      >
        {offline
          ? "You're offline. Ask staff to type the code below."
          : "Refreshes every 30 seconds"}
      </p>
    </div>
  );
}
