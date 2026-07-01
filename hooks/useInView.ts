"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Fraction of the element that must be visible to count as "in view". */
  threshold?: number;
  /** Margin around the root, e.g. "-15% 0px" to trigger before fully entering. */
  rootMargin?: string;
  /** Fire only the first time it enters (default true — animations don't replay). */
  once?: boolean;
}

/**
 * Thin IntersectionObserver hook. Returns a ref to attach and a boolean.
 * Used to gate Framer Motion entry animations and (later) heavy 3D/media,
 * so off-screen elements never animate or render.
 */
export function useInView<T extends Element = HTMLDivElement>({
  threshold = 0.25,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback for environments without IO (very old browsers / SSR safety).
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView } as const;
}
