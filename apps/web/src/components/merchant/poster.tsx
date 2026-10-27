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
      margin: 0,
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

      <article
        id="poster"
        className="@container mx-auto flex aspect-[1/1.414] w-full max-w-md flex-col justify-between bg-ink p-[7cqw] text-ink-foreground print:max-w-none print:[print-color-adjust:exact]"
      >
        <Wordmark className="text-[8cqw]" />
        <div className="space-y-[4cqw]">
          <SeatDots
            filled={3}
            total={4}
            size="lg"
            className="gap-[3cqw] [&>span]:size-[8cqw]"
          />
          <h1 className="font-display text-[12cqw] font-extrabold leading-[0.95] font-condensed">
            Come as a toly. Pay less as a group.
          </h1>
          <p className="text-[4.5cqw] text-ink-foreground/85">
            Scan for group deals and Toly Spin at {name}.
          </p>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div className="aspect-square w-[36cqw] shrink-0 rounded-xl bg-white p-[2.5cqw]">
            {qr ? (
              // biome-ignore lint/performance/noImgElement: locally generated data URL
              <img
                src={qr}
                alt={`QR code linking to ${name} on Toly`}
                className="size-full"
              />
            ) : null}
          </div>
          <p className="text-right text-[3.2cqw] text-ink-foreground/80 break-all">
            {url}
          </p>
        </div>
      </article>
    </div>
  );
}
