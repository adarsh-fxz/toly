"use client";

import { Link2, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * "Send the link to your friends": link box with Copy, WhatsApp, Viber, and the
 * native share sheet when the browser has one. Copy confirms with a "Link copied" toast.
 */
export function SharePanel({ url, message }: { url: string; message: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(
    () => setCanShare(typeof navigator !== "undefined" && !!navigator.share),
    [],
  );

  const text = `${message} ${url}`;
  const shown = url.replace(/^https?:\/\//, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy. Press and hold the link to copy it.");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 min-h-[52px] items-center gap-2.5 rounded-[14px] bg-secondary pl-4 pr-1.5">
        <Link2
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate text-[15px] tabular-nums">
          {shown}
        </span>
        <Button variant="ink" size="sm" onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-[360px]:grid-cols-1">
        <Button
          variant="outline"
          asLink
          className="min-w-0 px-3 text-[15px]"
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
        >
          <MessageCircle
            className="size-[18px] text-[#1E9E57]"
            aria-hidden="true"
          />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          asLink
          className="min-w-0 px-3 text-[15px]"
          href={`viber://forward?text=${encodeURIComponent(text)}`}
        >
          <MessageCircle
            className="size-[18px] text-[#7360F2]"
            aria-hidden="true"
          />
          Viber
        </Button>
      </div>
      {canShare && (
        <Button
          variant="ghost"
          onClick={() =>
            navigator
              .share({ title: message, text: message, url })
              .catch(() => {})
          }
        >
          <Share2 className="size-[18px]" aria-hidden="true" />
          More ways to share
        </Button>
      )}
    </div>
  );
}
