"use client";

import { WifiOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Banner } from "@/components/feedback/banner";
import { api } from "@/lib/api";

const REFRESH_MS = 30_000;

/** Fetches a fresh signed token every 30 seconds and keeps the screen awake while the voucher is open. */
export function RotatingQr({ voucherId }: { voucherId: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [cycle, setCycle] = useState(0);
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
          setCycle((value) => value + 1);
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
        if (cancelled) void l.release().catch(() => {});
        else lock = l;
      })
      .catch(() => {});
    const markOffline = () => setOffline(true);
    window.addEventListener("offline", markOffline);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
      void lock?.release().catch(() => {});
    };
  }, [voucherId, router]);

  return (
    <div className="space-y-2">
      <div className="relative mx-auto aspect-square w-full max-w-[296px] overflow-hidden rounded-3xl bg-qr-bg p-[18px] max-sm:max-w-[266px] shadow-[0_0_0_1px_rgb(23_22_28/.08),0_16px_40px_-20px_rgb(23_22_28/.4)]">
        <AnimatePresence initial={false}>
          {src ? (
            <motion.div
              key={src}
              className="absolute inset-[18px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: offline ? 0.12 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              {/* biome-ignore lint/performance/noImgElement: locally generated signed QR data URL */}
              <img
                src={src}
                alt="Voucher QR code. It refreshes every 30 seconds."
                className="size-full [image-rendering:pixelated]"
              />
            </motion.div>
          ) : (
            <div className="skeleton size-full rounded-md" />
          )}
        </AnimatePresence>
        {offline ? (
          <div className="absolute inset-4 grid place-items-center text-center text-sm font-semibold text-qr-fg">
            <span>
              <WifiOff className="mx-auto mb-2 size-7" aria-hidden />
              QR paused while you're offline
            </span>
          </div>
        ) : null}
      </div>
      {offline ? (
        <Banner tone="warn" title="You're offline">
          Ask staff to type the code below.
        </Banner>
      ) : (
        <p
          className="flex items-center justify-center gap-2 text-center text-xs text-ink-2"
          aria-live="off"
        >
          <svg
            key={cycle}
            className="qr-timer size-[18px]"
            viewBox="0 0 36 36"
            style={{ ["--qr-ms" as string]: `${REFRESH_MS}ms` }}
            aria-hidden
          >
            <circle className="track" cx="18" cy="18" r="15" />
            <circle
              className="tick"
              cx="18"
              cy="18"
              r="15"
              pathLength={100}
              transform="rotate(-90 18 18)"
            />
          </svg>
          Refreshes every 30 seconds
        </p>
      )}
    </div>
  );
}
