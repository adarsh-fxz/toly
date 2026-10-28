"use client";

import type { LenisOptions } from "lenis";
import { ReactLenis, useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";

const options: LenisOptions = {
  autoRaf: true,
  autoToggle: true,
  anchors: { offset: -96 },
  stopInertiaOnNavigate: true,
  lerp: 0.085,
  smoothWheel: true,
  syncTouch: false,
  respectReducedMotion: true,
  allowNestedScroll: true,
  prevent: (node) =>
    Boolean(
      node.closest(
        'textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"], [data-lenis-prevent]',
      ),
    ) || document.body.style.overflow === "hidden",
};

/** Native touch/keyboard scrolling stays intact; wheel and anchor movements ease to rest. */
export function ScrollExperience({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={options}>
      {children}
      <Suspense fallback={null}>
        <ScrollControls />
      </Suspense>
    </ReactLenis>
  );
}

function ScrollControls() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const lenis = useLenis(
    ({ scroll }) => setVisible(pathname === "/" && scroll > 640),
    [pathname],
  );
  useEffect(() => {
    setVisible(pathname === "/" && window.scrollY > 640);
    // Reconcile Next's route/back restoration with Lenis, discarding the previous route's inertia.
    lenis?.resize();
    lenis?.scrollTo(window.scrollY, { immediate: true });
  }, [pathname, lenis]);
  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          key="back-top"
          type="button"
          aria-label="Back to top"
          title="Back to top"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 8 }}
          transition={{
            duration: reduce ? 0.12 : 0.32,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="fixed right-6 bottom-6 z-40 grid size-12 place-items-center rounded-full border border-glass-line bg-glass text-foreground shadow-2 backdrop-blur-[20px] transition-[background-color,color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-action active:scale-[.97] focus-visible:ring-3 focus-visible:ring-ring/50 max-sm:right-5 max-sm:bottom-5"
          onClick={() => {
            const focusHero = () =>
              document.getElementById("hero-h")?.focus({ preventScroll: true });
            if (lenis)
              lenis.scrollTo(0, {
                duration: 1.1,
                lerp: undefined,
                immediate: Boolean(reduce),
                onComplete: focusHero,
              });
            else {
              window.scrollTo({
                top: 0,
                behavior: reduce ? "instant" : "smooth",
              });
              focusHero();
            }
          }}
        >
          <ArrowUp className="size-5" strokeWidth={1.8} aria-hidden />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
