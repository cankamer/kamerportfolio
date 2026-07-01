"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * Minimal vertical navigation: small clickable squares stacked on the right
 * edge, one per section. No labels are shown by default (a subtle name reveals
 * on hover); the active square fills with gold based on scroll position.
 */
export default function SideNav() {
  const { d } = useLocale();
  const [active, setActive] = useState<string>("home");

  const items = [
    { id: "home", label: "Kamer" },
    { id: "journey", label: d.nav.journey },
    { id: "about", label: d.nav.about },
    { id: "skills", label: d.nav.skills },
    { id: "hub", label: d.nav.hub },
  ];

  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most-visible section currently intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-4 sm:flex"
    >
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-label={item.label}
            aria-current={isActive ? "true" : undefined}
            className="group flex items-center gap-2.5"
          >
            {/* Hover-revealed name (optional, fully out of the way otherwise) */}
            <span
              className={cn(
                "pointer-events-none whitespace-nowrap rounded-md border border-gold/15 bg-marble/80 px-2 py-0.5",
                "font-sans text-[10px] uppercase tracking-[0.2em] text-ivory-dim backdrop-blur-sm",
                "translate-x-1 opacity-0 transition-all duration-300",
                "group-hover:translate-x-0 group-hover:opacity-100"
              )}
            >
              {item.label}
            </span>

            <span
              className={cn(
                "relative h-2.5 w-2.5 rotate-45 border transition-all duration-300",
                isActive
                  ? "scale-125 border-gold bg-gold shadow-[0_0_10px_2px_rgba(201,162,75,0.5)]"
                  : "border-gold/40 bg-transparent group-hover:border-gold group-hover:bg-gold/30"
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
