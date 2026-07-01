"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/** The WebGL scene can't render on the server — load it client-only. */
const FloralScene = dynamic(() => import("./FloralScene"), { ssr: false });

/**
 * Fixed, full-viewport floral backdrop that sits behind all page content.
 * Fades in once mounted (so the CSS gradient fallback shows first) and
 * honours prefers-reduced-motion by freezing the animation.
 */
export default function FloralBackground() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {mounted && <FloralScene reduced={reduced} />}
    </div>
  );
}
