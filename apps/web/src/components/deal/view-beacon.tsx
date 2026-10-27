"use client";

import { useEffect } from "react";

/** Counts a real page view from the browser, so server renders and prefetches don't. */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/v1/deals/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [slug]);
  return null;
}
