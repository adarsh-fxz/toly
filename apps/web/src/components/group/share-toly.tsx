"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";

export function ShareToly({
  groupId,
  message,
}: {
  groupId: string;
  message: string;
}) {
  const [url, setUrl] = useState(`/g/${groupId}`);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/g/${groupId}`);
    setCanShare(typeof navigator.share === "function");
  }, [groupId]);

  const text = `${message} ${url}`;

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg", variant: "outline" })}
        >
          WhatsApp
        </a>
        <a
          href={`viber://forward?text=${encodeURIComponent(text)}`}
          className={buttonVariants({ size: "lg", variant: "outline" })}
        >
          Viber
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="lg" onClick={copy} aria-live="polite">
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        {canShare ? (
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              navigator.share({ text: message, url }).catch(() => {})
            }
          >
            <Share2 aria-hidden />
            More
          </Button>
        ) : null}
      </div>
    </div>
  );
}
