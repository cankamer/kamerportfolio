"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/* =========================================================================
   SMOOTH SCROLL
   Lenis eases wheel/trackpad input into buttery scrolling. It still drives the
   real window scroll position, so framer-motion's useScroll (the doors, the
   timeline) keeps working unchanged.
   ========================================================================= */

let lenis: Lenis | null = null;

/** Smoothly scroll to a y offset or element; falls back to native scrolling. */
export function smoothScrollTo(target: number | string | HTMLElement) {
  if (lenis) lenis.scrollTo(target);
  else if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      anchors: true,
      // Pages lock the body (e.g. the welcome gate) with overflow:hidden;
      // honour that instead of scrolling underneath it.
      virtualScroll: () => document.body.style.overflow !== "hidden",
    });
    lenis = instance;

    let raf = 0;
    const loop = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
