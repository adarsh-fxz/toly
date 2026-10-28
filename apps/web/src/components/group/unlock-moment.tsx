"use client";

import { useEffect, useState } from "react";
import { Confetti } from "@/components/toly/confetti";

export function UnlockMoment({ groupId }: { groupId: string }) {
  const [play, setPlay] = useState(false);
  useEffect(() => {
    const key = `toly-unlocked-${groupId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "seen");
      setPlay(true);
    }
  }, [groupId]);
  return play ? <Confetti /> : null;
}
