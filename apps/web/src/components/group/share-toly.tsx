"use client";

import { useEffect, useState } from "react";
import { SharePanel } from "@/components/toly/share-panel";

export function ShareToly({
  groupId,
  message,
}: {
  groupId: string;
  message: string;
}) {
  const [url, setUrl] = useState(`/g/${groupId}`);
  useEffect(() => setUrl(`${window.location.origin}/g/${groupId}`), [groupId]);
  return <SharePanel url={url} message={message} />;
}
