"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Show on an intentional upward scroll; stay available while hovered or keyboard-focused. */
export function useScrollHeader(pathname: string) {
  const home = pathname === "/";
  const [visible, setVisible] = useState(!home);
  const headerRef = useRef<HTMLElement>(null);
  const hovering = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const atTop = useRef(true);
  const cancelHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);
  const hideAfterPause = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(() => {
      if (
        !atTop.current &&
        !hovering.current &&
        !(
          headerRef.current?.contains(document.activeElement) &&
          document.activeElement?.matches(":focus-visible")
        )
      )
        setVisible(false);
    }, 1100);
  }, [cancelHide]);
  useEffect(() => {
    let lastIntent = 0;
    let previous = window.scrollY;
    let anchor = previous;
    let frame = 0;
    atTop.current = previous <= 104;
    setVisible(!home && atTop.current);
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      atTop.current = y <= 104;
      if (atTop.current) {
        setVisible(!home);
        anchor = y;
      } else if (Math.abs(y - anchor) >= 6) {
        const focused =
          headerRef.current?.contains(document.activeElement) &&
          document.activeElement?.matches(":focus-visible");
        setVisible(
          (y < previous && performance.now() - lastIntent < 1100) ||
            hovering.current ||
            Boolean(focused),
        );
        anchor = y;
      }
      previous = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onIntent = () => {
      lastIntent = performance.now();
      hideAfterPause();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    for (const event of ["wheel", "touchmove", "keydown", "pointerdown"])
      window.addEventListener(event, onIntent, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      for (const event of ["wheel", "touchmove", "keydown", "pointerdown"])
        window.removeEventListener(event, onIntent);
      cancelAnimationFrame(frame);
      cancelHide();
    };
  }, [home, cancelHide, hideAfterPause]);
  return {
    visible,
    headerRef,
    onPointerEnter: () => {
      hovering.current = true;
      cancelHide();
    },
    onPointerLeave: () => {
      hovering.current = false;
      hideAfterPause();
    },
    onFocusCapture: () => {
      cancelHide();
      setVisible(true);
    },
    onBlurCapture: hideAfterPause,
  };
}
