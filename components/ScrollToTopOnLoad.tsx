"use client";

import { useEffect } from "react";

/**
 * Forces the page to start at the top on every fresh load / refresh,
 * overriding the browser's default scroll-position restoration.
 */
export default function ScrollToTopOnLoad() {
  useEffect(() => {
    // Stop the browser from restoring the previous scroll position on reload.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
