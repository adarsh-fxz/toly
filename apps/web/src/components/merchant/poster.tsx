"use client";

import { Printer } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { SeatDots } from "@/components/brand/seat-dots";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/** A5 counter poster. Prints on its own page; the rest of the app is hidden in print. */
export function Poster({ name, slug }: { name: string; slug: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const link = `${window.location.origin}/v/${slug}`;
    setUrl(link.replace(/^https?:\/\//, ""));
    QRCode.toDataURL(link, {
      margin: 4,
      color: { dark: "#17161C", light: "#FFFFFF" },
      width: 720,
      errorCorrectionLevel: "M",
    }).then(setQr);
  }, [slug]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="max-w-md text-sm text-muted-foreground">
          Print it on A5 and put it by the till or on tables. Customers scan it
          to see your group deals and spin.
        </p>
        <Button onClick={() => window.print()}>
          <Printer aria-hidden />
          Print poster
        </Button>
      </div>

      <div className="@container mx-auto w-full max-w-[559px]">
        <article
          id="poster"
          className="force-light relative isolate flex aspect-[148/210] w-full flex-col overflow-hidden bg-card p-[7cqw] text-foreground print:[print-color-adjust:exact]"
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-[42%] bg-accent"
          />
          <div
            aria-hidden
            className="absolute -right-[12cqw] -top-[12cqw] -z-10 size-[43cqw] rounded-full border-[4cqw] border-primary/50"
          />
          <div className="flex items-center justify-between">
            <Wordmark className="text-[6cqw]" />
            <span lang="ne" className="font-nepali text-[3.2cqw] text-ink-2">
              टोली
            </span>
          </div>
          <h1 className="mt-[6cqw] font-display text-[8.5cqw] font-bold leading-[1.04] tracking-[-0.04em]">
            Come as a toly.
            <br />
            Pay less as a group.
          </h1>
          <p className="mt-[3cqw] text-[3.4cqw] leading-snug text-ink-2">
            Scan for group deals and Toly Spin at <b>{name}</b>.
          </p>
          <div className="mt-[5cqw] flex items-center gap-[4cqw]">
            <div className="aspect-square w-[43cqw] shrink-0 rounded-[4cqw] bg-qr-bg p-[1cqw] ring-2 ring-foreground">
              {qr ? (
                // biome-ignore lint/performance/noImgElement: generated QR data URL
                <img
                  src={qr}
                  alt={`QR code linking to ${name} on Toly`}
                  className="size-full"
                />
              ) : (
                <div className="skeleton size-full" />
              )}
            </div>
            <div className="min-w-0 space-y-[3cqw]">
              <p className="text-[2.8cqw] font-semibold leading-snug">
                Point your phone camera at the code
              </p>
              <p className="break-all text-[2.5cqw] text-ink-2">
                or open
                <br />
                <b className="text-foreground">{url}</b>
              </p>
              <SeatDots
                filled={2}
                total={3}
                size="sm"
                className="[&>span]:size-[3.5cqw]"
              />
            </div>
          </div>
          <ol className="mt-auto grid grid-cols-3 gap-[2cqw] border-t-2 border-foreground pt-[3cqw]">
            {[
              "Start a toly and send the link",
              "Friends join, the deal unlocks",
              "Show the code, pay us as usual",
            ].map((text, i) => (
              <li key={text}>
                <b className="font-display text-[4cqw]">{i + 1}</b>
                <p className="mt-1 text-[2.5cqw] leading-snug">{text}</p>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </div>
  );
}
